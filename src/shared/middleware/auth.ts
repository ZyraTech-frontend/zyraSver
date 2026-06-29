import { Request, Response, NextFunction } from 'express';
import { JwtService, TokenPayload } from '../utils/jwt';
import { ApiResponseHandler } from '../utils/response';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return ApiResponseHandler.error(res, 'No authorization token provided', 401);
    }

    const payload = JwtService.verifyToken(token);

    if (!payload) {
      return ApiResponseHandler.error(res, 'Invalid or expired token', 401);
    }

    req.user = payload;
    return next();
  } catch (error) {
    return ApiResponseHandler.error(res, 'Authentication failed', 401);
  }
};

export const optionalAuthMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const payload = JwtService.verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }

    return next();
  } catch (error) {
    // Silently continue if token verification fails
    return next();
  }
};

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponseHandler.error(res, 'User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponseHandler.error(res, 'Access denied', 403);
    }

    return next();
  };
};
