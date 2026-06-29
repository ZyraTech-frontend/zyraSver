import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';
import { ApiResponseHandler } from '../utils/response';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'field';
    return ApiResponseHandler.error(res, `${field} already exists`, 409);
  }

  if (err.code === 'P2025') {
    return ApiResponseHandler.error(res, 'Record not found', 404);
  }

  // Validation errors
  if (err instanceof ValidationError) {
    return ApiResponseHandler.error(res, 'Validation failed', 400, err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponseHandler.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponseHandler.error(res, 'Token expired', 401);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponseHandler.error(res, message, statusCode);
};
