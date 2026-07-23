import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Shared infrastructure
import { prisma, testDatabaseConnection, disconnectDatabase } from './shared/config/database';
import { errorHandler } from './shared/middleware/errorHandler';
import { generalRateLimiter } from './shared/middleware/rateLimiter';

// Central route registry
import apiRoutes from './routes';

// Load environment variables
dotenv.config();

// Initialize Express
const app: Express = express();
// Azure uses WEBSITES_PORT, fallback to API_PORT (dev), then PORT, then 8080
const PORT = parseInt(process.env.WEBSITES_PORT || process.env.API_PORT || process.env.PORT || '8080', 10);

// ECS/ALB and Azure load balancers forward the original client IP in proxy headers.
app.set('trust proxy', 1);

// ============================================
// SECURITY HEADERS (Helmet)
// ============================================
app.use(helmet());

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'https://zyratechhub.com',         // Production frontend
  'https://www.zyratechhub.com',     // Production www
  process.env.FRONTEND_URL || 'http://localhost:5173',  // Dev (Vite default)
  'http://localhost:3000',
  'http://localhost:3001',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// ============================================
// BODY PARSER
// ============================================
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buf) => {
    const expressReq = req as Request & { rawBody?: Buffer };
    if (expressReq.originalUrl === '/api/payments/webhook') {
      expressReq.rawBody = Buffer.from(buf);
    }
  },
}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// GLOBAL RATE LIMITER (100 req/min for all routes)
// ============================================
app.use(generalRateLimiter);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'ZyraTech Hub API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api', apiRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${_req.method} ${_req.path} not found`,
    },
  });
});

// ============================================
// GLOBAL ERROR HANDLER (must be last)
// ============================================
app.use(errorHandler);

// ============================================
// STARTUP
// ============================================
async function start() {
  try {
    await testDatabaseConnection();

    // Bind to 0.0.0.0 to accept external traffic in containerized environments (Docker, Azure)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on 0.0.0.0:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Base: /api`);
      console.log(`✓ Health Check: http://localhost:${PORT}/health`);
      console.log(`✓ CORS: Allowing ${allowedOrigins.length} origins`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  await disconnectDatabase();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

export { prisma };
export default app;
