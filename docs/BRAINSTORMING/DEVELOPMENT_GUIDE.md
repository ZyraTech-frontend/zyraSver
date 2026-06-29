# Development Guide - Phase 1

## Project Initialized ✅

Your backend skeleton is ready. Here's what's been set up:

### Core Infrastructure
- ✅ Express.js server with TypeScript
- ✅ Prisma ORM with PostgreSQL schema (20+ models)
- ✅ AWS S3 integration with CloudFront
- ✅ JWT authentication & password hashing
- ✅ Error handling & response formatting
- ✅ Middleware for CORS & auth

### Directory Structure
```
src/
├── index.ts                 # Main server file
├── middleware/
│   ├── auth.ts             # Auth middleware
│   └── errorHandler.ts     # Error handler
├── services/
│   └── s3.service.ts       # S3 operations
└── utils/
    ├── jwt.ts              # Token management
    ├── password.ts         # Bcrypt operations
    ├── response.ts         # Response formatting
    └── validation.ts       # Input validation
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# Edit .env with your AWS RDS & S3 credentials

# 3. Initialize database
npm run prisma:migrate

# 4. Start dev server
npm run dev
```

## API Response Format (All Endpoints)

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* your data */ },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": { /* validation errors if any */ },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Success",
  "data": [/* array of items */],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## Building Phase 1 Endpoints

### 1. Authentication Routes

**Location**: `src/routes/auth.routes.ts` (create this)

```typescript
// POST /api/auth/register
// Body: { email, password, firstName, lastName, phone }
// Response: { user, accessToken, refreshToken }

// POST /api/auth/login
// Body: { email, password }
// Response: { user, accessToken, refreshToken }

// POST /api/auth/refresh
// Body: { refreshToken }
// Response: { accessToken, refreshToken }

// POST /api/auth/logout
// Headers: Authorization: Bearer <token>
// Response: { success: true }
```

### 2. User Routes

**Location**: `src/routes/user.routes.ts` (create this)

```typescript
// GET /api/users/profile
// Headers: Authorization: Bearer <token>
// Response: { user }

// PUT /api/users/profile
// Headers: Authorization: Bearer <token>
// Body: { firstName, lastName, phone, avatar }
// Response: { user }

// GET /api/users (Admin only)
// Headers: Authorization: Bearer <token>
// Query: page, limit, role, status
// Response: { users, pagination }

// GET /api/users/:id (Admin only)
// Headers: Authorization: Bearer <token>
// Response: { user }
```

### 3. KYC Routes

**Location**: `src/routes/kyc.routes.ts` (create this)

```typescript
// POST /api/kyc/submit
// Headers: Authorization: Bearer <token>
// Body: { idType, idNumber, idDocument, dateOfBirth, address, ... }
// Response: { kyc }

// GET /api/kyc/status
// Headers: Authorization: Bearer <token>
// Response: { kyc }

// GET /api/kyc/pending (Admin only)
// Headers: Authorization: Bearer <token>
// Query: page, limit
// Response: { kyc[], pagination }

// PUT /api/kyc/:id/approve (Admin only)
// Headers: Authorization: Bearer <token>
// Response: { kyc }

// PUT /api/kyc/:id/reject (Admin only)
// Headers: Authorization: Bearer <token>
// Body: { rejectionReason }
// Response: { kyc }
```

### 4. File Upload Routes

**Location**: `src/routes/upload.routes.ts` (create this)

```typescript
// POST /api/upload/image
// Headers: Authorization: Bearer <token>
// Body: FormData with file
// Response: { file: { id, url, filename, size } }

// POST /api/upload/document
// Headers: Authorization: Bearer <token>
// Body: FormData with file
// Response: { file: { id, url, filename, size } }

// DELETE /api/upload/:id
// Headers: Authorization: Bearer <token>
// Response: { success: true }
```

## Code Patterns to Follow

### Creating an Endpoint

```typescript
// src/routes/example.routes.ts
import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth';
import { ApiResponseHandler } from '../utils/response';
import { validateEmail } from '../utils/validation';

const router = Router();

// Example: Create user (admin only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  async (req, res, next) => {
    try {
      const { email, firstName, lastName, role } = req.body;
      
      // Validate input
      let errors = {};
      errors = validateEmail(email, errors);
      
      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors);
      }

      // Business logic
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          role,
          password: await PasswordService.hash('TempPassword123!'),
        },
      });

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: req.user?.id,
          action: 'CREATE_USER',
          entity: 'User',
          entityId: user.id,
          changes: JSON.stringify({ email, firstName, lastName, role }),
        },
      });

      ApiResponseHandler.created(res, user, 'User created successfully');
    } catch (error) {
      next(error);
    }
  }
);

export default router;
```

### Registering Routes in Main App

```typescript
// In src/index.ts, add:
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import uploadRoutes from './routes/upload.routes';

// After middleware setup:
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
```

## Using Prisma in Endpoints

### Create
```typescript
const user = await prisma.user.create({
  data: { email, password, firstName, lastName, role: 'STUDENT' },
});
```

### Read
```typescript
const user = await prisma.user.findUnique({ where: { email } });
const users = await prisma.user.findMany({ 
  where: { role: 'STUDENT' },
  skip: (page - 1) * limit,
  take: limit,
});
```

### Update
```typescript
const user = await prisma.user.update({
  where: { id },
  data: { firstName, lastName, phone },
});
```

### Delete (Soft)
```typescript
const user = await prisma.user.update({
  where: { id },
  data: { deletedAt: new Date() },
});
```

### Relations
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  include: { kyc: true, enrollments: true, payments: true },
});
```

## S3 File Operations

### Upload Image
```typescript
import { s3Service } from '../services/s3.service';

const url = await s3Service.uploadImage(
  'hero-image.jpg',
  fileBuffer,
  'image/jpeg'
);

// Save to database
const file = await prisma.uploadedFile.create({
  data: {
    filename: 'hero-image.jpg',
    s3Key: 'images/12345-hero-image.jpg',
    url,
    mimetype: 'image/jpeg',
    size: fileBuffer.length,
    fileType: 'image',
    uploadedBy: userId,
  },
});
```

### Generate Signed URL (for temp download)
```typescript
const signedUrl = await s3Service.getSignedDownloadUrl(
  'documents/resume.pdf',
  3600 // 1 hour
);
```

### Delete File
```typescript
await s3Service.deleteFile('images/12345-hero-image.jpg');
await prisma.uploadedFile.delete({ where: { id } });
```

## JWT Token Usage

### Generate Tokens (on login/register)
```typescript
import { JwtService } from '../utils/jwt';

const accessToken = JwtService.generateAccessToken({
  id: user.id,
  email: user.email,
  role: user.role,
});

const refreshToken = JwtService.generateRefreshToken({
  id: user.id,
  email: user.email,
  role: user.role,
});

// Save refresh token to database
await prisma.session.create({
  data: {
    userId: user.id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  },
});
```

### Verify Token (in middleware)
```typescript
// Already done in authMiddleware
// req.user contains: { id, email, role }
```

### Refresh Token
```typescript
const session = await prisma.session.findUnique({
  where: { refreshToken },
  include: { user: true },
});

if (!session || session.expiresAt < new Date()) {
  return ApiResponseHandler.error(res, 'Invalid or expired refresh token', 401);
}

// Generate new tokens
const newAccessToken = JwtService.generateAccessToken({
  id: session.user.id,
  email: session.user.email,
  role: session.user.role,
});
```

## Common Validations

```typescript
import { validateEmail, validatePassword, validateName, ValidationError } from '../utils/validation';

// Email validation
let errors = {};
errors = validateEmail(email, errors);

// Password validation (register)
errors = validatePassword(password, errors);

// Name validation
errors = validateName(firstName, 'First Name', errors);
errors = validateName(lastName, 'Last Name', errors);

// Throw validation error
if (Object.keys(errors).length > 0) {
  throw new ValidationError(errors);
}
```

## Logging Activity

```typescript
await prisma.activityLog.create({
  data: {
    userId: req.user?.id,
    action: 'LOGIN_SUCCESS',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
  },
});
```

## Error Handling

```typescript
try {
  // Your code
} catch (error) {
  console.error('Detailed error:', error);
  
  // Pass to global handler
  next(error);
  
  // Or specific response
  if (error.code === 'P2002') {
    ApiResponseHandler.error(res, 'Email already exists', 409);
  }
}
```

## Environment Variables Reference

```env
# Always required
DATABASE_URL              # PostgreSQL connection
AWS_ACCESS_KEY_ID         # AWS credentials
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET             # S3 bucket name
JWT_SECRET                # Token signing key

# Recommended
CLOUDFRONT_DOMAIN         # CDN domain for S3 URLs
API_PORT                  # Default: 5000
BCRYPT_ROUNDS             # Password hashing rounds (default: 12)

# Phase 2+
SENDGRID_API_KEY          # Email service
PAYSTACK_SECRET_KEY       # Payment processing
```

## Testing Locally

### 1. Start Server
```bash
npm run dev
```

### 2. Test Health Endpoint
```bash
curl http://localhost:5000/health
```

### 3. Use Postman
- Import the Postman collection (when created)
- Set environment variables
- Test each endpoint

### 4. Watch Database
```bash
npm run prisma:studio
```

Opens Prisma Studio at http://localhost:5555

## Next Steps

1. Create auth routes (register, login, refresh)
2. Create user routes (profile, list, create)
3. Create upload routes (image, document)
4. Create KYC routes (submit, review, approve)
5. Build Postman collection
6. Test with frontend

---

**Ready to build Phase 1!** 🚀
