// Authentication Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
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

      const result = await AuthService.login({
        email: req.body.email,
        password: req.body.password,
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

      // TODO: Upload file to cloud storage (S3/Cloudinary), get URL back
      // For now, use a placeholder — this will be replaced when storage is configured
      const documentUrl = `uploads/kyc/${userId}/${Date.now()}_${file.originalname}`;

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
