// Authentication Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { s3Service } from '../../shared/services/s3.service';
import { AuthService } from './service';
import { AuthValidators } from './validators';
import { AuthError } from './types';

export class AuthController {
  // ─── POST /api/auth/login ─────────────────────────────────────
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = AuthValidators.validateLoginRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, validation.errors, 'VALIDATION_ERROR');
      }

      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      const userAgent = req.headers['user-agent'] as string;

      const result = await AuthService.login({
        email: req.body.email,
        password: req.body.password,
        ipAddress,
        userAgent,
      });

      return ApiResponseHandler.success(res, result, 'Login successful');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── POST /api/auth/refresh ───────────────────────────────────
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = AuthValidators.validateRefreshTokenRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, validation.errors, 'VALIDATION_ERROR');
      }

      const result = await AuthService.refreshToken(req.body.refreshToken);
      return ApiResponseHandler.success(res, result, 'Token refreshed');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── GET /api/auth/me ─────────────────────────────────────────
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');
      }

      const user = await AuthService.getUserById(userId);
      return ApiResponseHandler.success(res, user, 'User retrieved');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── POST /api/auth/logout ────────────────────────────────────
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');
      }

      await AuthService.logout(userId);
      return ApiResponseHandler.success(res, {}, 'Logged out successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── POST /api/auth/change-password ───────────────────────────
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');
      }

      if (!req.body.currentPassword || !req.body.newPassword) {
        return ApiResponseHandler.error(
          res,
          'Current password and new password are required',
          400,
          {
            currentPassword: !req.body.currentPassword ? 'Current password is required' : '',
            newPassword: !req.body.newPassword ? 'New password is required' : '',
          },
          'VALIDATION_ERROR'
        );
      }

      const user = await AuthService.changePassword(
        userId,
        req.body.currentPassword,
        req.body.newPassword
      );

      return ApiResponseHandler.success(res, {
        message: 'Password changed successfully',
        user: {
          id: user.id,
          mustChangePassword: user.mustChangePassword,
          accountStatus: user.accountStatus,
        },
      }, 'Password changed successfully');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── POST /api/auth/submit-kyc ────────────────────────────────
  static async submitKyc(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');
      }

      // File uploaded by multer middleware
      const file = req.file;
      if (!file) {
        return ApiResponseHandler.error(res, 'KYC document file is required', 400, { documents: 'Document file is required' }, 'VALIDATION_ERROR');
      }

      const documentType = req.body.documentType;
      if (!documentType || !['national_id', 'passport', 'drivers_license'].includes(documentType)) {
        return ApiResponseHandler.error(
          res,
          'Invalid document type',
          400,
          { documentType: 'Must be national_id, passport, or drivers_license' },
          'VALIDATION_ERROR'
        );
      }

      const fileName = `${userId}-${file.originalname}`;
      const documentUrl = await s3Service.uploadDocument(fileName, file.buffer, file.mimetype);

      await AuthService.submitKyc(userId, documentUrl, documentType);

      return ApiResponseHandler.success(res, {
        message: 'KYC documents submitted successfully',
        user: { kycStatus: 'pending' },
      }, 'KYC submitted');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── PUT /api/auth/profile ────────────────────────────────────
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const validation = AuthValidators.validateUpdateProfileRequest(req.body);
      if (!validation.valid) return ApiResponseHandler.error(res, 'Validation failed', 400, validation.errors, 'VALIDATION_ERROR');

      const user = await AuthService.updateProfile(userId, req.body);
      return ApiResponseHandler.success(res, user, 'Profile updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── PUT /api/auth/profile/notifications ──────────────────────
  static async updateNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const user = await AuthService.updateNotifications(userId, req.body);
      return ApiResponseHandler.success(res, user, 'Notification preferences updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── POST /api/auth/2fa/verify ────────────────────────────────
  static async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { tempToken, token } = req.body;
      if (!tempToken || !token) return ApiResponseHandler.error(res, 'Temp token and 2FA token are required', 400, null, 'VALIDATION_ERROR');

      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string;
      const userAgent = req.headers['user-agent'] as string;

      const result = await AuthService.verify2FA(tempToken, token, ipAddress, userAgent);
      return ApiResponseHandler.success(res, result, '2FA verified successfully');
    } catch (error) {
      if (error instanceof AuthError) return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      return next(error);
    }
  }

  // ─── POST /api/auth/2fa/generate ──────────────────────────────
  static async generate2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const result = await AuthService.generate2FA(userId);
      return ApiResponseHandler.success(res, result, '2FA initialized');
    } catch (error) {
      if (error instanceof AuthError) return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      return next(error);
    }
  }

  // ─── POST /api/auth/2fa/enable ────────────────────────────────
  static async enable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const { token } = req.body;
      if (!token) return ApiResponseHandler.error(res, '2FA token is required to enable', 400, null, 'VALIDATION_ERROR');

      const user = await AuthService.enable2FA(userId, token);
      return ApiResponseHandler.success(res, user, '2FA enabled successfully');
    } catch (error) {
      if (error instanceof AuthError) return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      return next(error);
    }
  }

  // ─── POST /api/auth/2fa/disable ───────────────────────────────
  static async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const user = await AuthService.disable2FA(userId);
      return ApiResponseHandler.success(res, user, '2FA disabled successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── GET /api/auth/sessions ───────────────────────────────────
  static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const sessions = await AuthService.getActiveSessions(userId);
      return ApiResponseHandler.success(res, sessions, 'Active sessions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── DELETE /api/auth/sessions/:id ────────────────────────────
  static async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      await AuthService.revokeSession(userId, req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Session revoked successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── DELETE /api/auth/sessions ────────────────────────────────
  static async revokeAllSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponseHandler.error(res, 'Authentication required', 401, null, 'UNAUTHORIZED');

      const authHeader = req.headers.authorization;
      const currentToken = authHeader?.split(' ')[1];

      if (!currentToken) return ApiResponseHandler.error(res, 'Current token required', 400, null, 'VALIDATION_ERROR');

      await AuthService.revokeAllOtherSessions(userId, currentToken);
      return ApiResponseHandler.success(res, {}, 'All other sessions revoked successfully');
    } catch (error) {
      return next(error);
    }
  }
  // ─── POST /api/auth/forgot-password ───────────────────────────
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = AuthValidators.validateForgotPasswordRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, validation.errors, 'VALIDATION_ERROR');
      }

      await AuthService.requestPasswordReset(req.body.email);

      return ApiResponseHandler.success(
        res,
        {},
        'If an account exists with this email, a reset link will be sent'
      );
    } catch (error) {
      return next(error);
    }
  }

  // ─── POST /api/auth/reset-password ────────────────────────────
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = AuthValidators.validateResetPasswordRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, validation.errors, 'VALIDATION_ERROR');
      }

      await AuthService.resetPassword(req.body.token, req.body.newPassword);
      return ApiResponseHandler.success(res, {}, 'Password reset successfully');
    } catch (error) {
      if (error instanceof AuthError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
