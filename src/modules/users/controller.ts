// User Management Module - Request Handlers
// Super Admin Only for most operations

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { UserService } from './service';
import { UserValidators } from './validators';
import { UserError } from './types';

export class UserController {
  // ─── GET /api/admin/users ─────────────────────────────────────
  static async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const role = (req.query.role as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await UserService.listUsers(page, limit, role, status);

      return ApiResponseHandler.paginated(
        res,
        result.users,
        result.pagination.total,
        page,
        limit,
        'Admins retrieved successfully'
      );
    } catch (error) {
      return next(error);
    }
  }

  // ─── GET /api/admin/users/:userId ─────────────────────────────
  static async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getUserById(req.params.userId as string);
      return ApiResponseHandler.success(res, user, 'User retrieved successfully');
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── POST /api/admin/users ────────────────────────────────────
  // Create admin user (super_admin only)
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = UserValidators.validateCreateUserRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(
          res,
          'Validation failed',
          400,
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      const user = await UserService.createUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        department: req.body.department,
        permissions: req.body.permissions,
        mustChangePassword: req.body.mustChangePassword ?? true,
      });

      return ApiResponseHandler.created(
        res,
        user,
        'Admin user created successfully. Temporary password sent to email.'
      );
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/users/:userId ─────────────────────────────
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = UserValidators.validateUpdateUserRequest(req.body);
      if (!validation.valid) {
        return ApiResponseHandler.error(
          res,
          'Validation failed',
          400,
          validation.errors,
          'VALIDATION_ERROR'
        );
      }

      const user = await UserService.updateUser(req.params.userId as string, {
        name: req.body.name,
        department: req.body.department,
        avatar: req.body.avatar,
      });

      return ApiResponseHandler.success(res, user, 'User updated successfully');
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/users/:userId/permissions ─────────────────
  // Super Admin Only
  static async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.body.permissions || !Array.isArray(req.body.permissions)) {
        return ApiResponseHandler.error(
          res,
          'Permissions must be an array of strings',
          400,
          { permissions: 'Must be an array of permission strings' },
          'VALIDATION_ERROR'
        );
      }

      const user = await UserService.updatePermissions(
        req.params.userId as string,
        req.body.permissions
      );

      return ApiResponseHandler.success(res, {
        id: user.id,
        permissions: user.permissions,
        updatedAt: new Date().toISOString(),
      }, 'Permissions updated successfully');
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/users/:userId/activate ────────────────────
  // Super Admin Only
  static async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.activateUser(req.params.userId as string);
      return ApiResponseHandler.success(
        res,
        { id: user.id, accountStatus: user.accountStatus },
        'Admin account activated successfully'
      );
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/users/:userId/deactivate ──────────────────
  // Super Admin Only
  static async deactivateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.deactivateUser(req.params.userId as string);
      return ApiResponseHandler.success(
        res,
        { id: user.id, accountStatus: user.accountStatus },
        'Admin account deactivated successfully'
      );
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }

  // ─── DELETE /api/admin/users/:userId ──────────────────────────
  // Super Admin Only
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.deleteUser(req.params.userId as string);
      return ApiResponseHandler.success(res, {}, 'Admin deleted successfully');
    } catch (error) {
      if (error instanceof UserError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode);
      }
      return next(error);
    }
  }
}
