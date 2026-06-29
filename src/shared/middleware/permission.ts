/**
 * Permission Middleware
 * Checks if the logged-in user has the required permission.
 * Super admins bypass all permission checks.
 * Regular admins must have the specific permission assigned by super admin.
 */

import { Request, Response, NextFunction } from 'express';

export function checkPermission(requiredPermission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to access this resource',
        },
      });
    }

    // Super admin has access to everything
    if (user.role === 'super_admin') {
      return next();
    }

    // Regular admin must have the specific permission
    if (user.role === 'admin' && user.permissions.includes(requiredPermission)) {
      return next();
    }

    // No permission
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have permission to access this resource',
      },
    });
  };
}

/**
 * Super Admin Only Middleware
 * Use this for endpoints that only super_admin can access
 * (e.g., user management, settings, activity logs)
 */
export function superAdminOnly(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
  }

  if (user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This action requires Super Admin privileges',
      },
    });
  }

  return next();
}
