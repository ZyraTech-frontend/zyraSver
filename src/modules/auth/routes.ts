// Authentication Module - Route Definitions

import { Router } from 'express';
import { AuthController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { authRateLimiter } from '../../shared/middleware/rateLimiter';
import { uploadKYC } from '../../shared/middleware/upload';

const router = Router();

// ─── Public Routes (no auth required) ────────────────────────
router.post('/login', authRateLimiter, AuthController.login);
router.post('/2fa/verify', authRateLimiter, AuthController.verify2FA);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// ─── Protected Routes (auth required) ────────────────────────
router.get('/me', authMiddleware, AuthController.getCurrentUser);
router.post('/logout', authMiddleware, AuthController.logout);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.post('/submit-kyc', authMiddleware, uploadKYC.single('documents'), AuthController.submitKyc);

// Profile
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/profile/notifications', authMiddleware, AuthController.updateNotifications);

// 2FA Management
router.post('/2fa/generate', authMiddleware, AuthController.generate2FA);
router.post('/2fa/enable', authMiddleware, AuthController.enable2FA);
router.post('/2fa/disable', authMiddleware, AuthController.disable2FA);

// Sessions
router.get('/sessions', authMiddleware, AuthController.getSessions);
router.delete('/sessions', authMiddleware, AuthController.revokeAllSessions);
router.delete('/sessions/:id', authMiddleware, AuthController.revokeSession);

export default router;
