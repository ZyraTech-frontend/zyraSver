// Authentication Module - Route Definitions

import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';
import { uploadKYC } from '../../shared/middleware/upload';

const router = Router();

// ─── Public Routes (no auth required) ────────────────────────
router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// ─── Protected Routes (auth required) ────────────────────────
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.post('/submit-kyc', authMiddleware, uploadKYC.single('documents'), AuthController.submitKyc);

export default router;
