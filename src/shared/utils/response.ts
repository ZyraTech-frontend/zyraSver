import { Response } from 'express';

// ─── Error Code Map ───────────────────────────────────────────
const STATUS_CODE_MAP: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_ERROR',
};

// ─── Response Handler ─────────────────────────────────────────
export class ApiResponseHandler {
  /**
   * Standard success response
   * { success: true, data: {...}, message: "..." }
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      data,
      message,
    });
  }

  /**
   * Paginated list response
   * { success: true, data: { data: [...], pagination: {...} } }
   */
  static paginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = 'Success',
    statusCode: number = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      message,
    });
  }

  /**
   * Error response — matches frontend expected format exactly
   * { success: false, error: { code: "...", message: "...", details?: {...} } }
   */
  static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: number = 500,
    details?: Record<string, string> | null,
    code?: string
  ) {
    const errorCode = code || STATUS_CODE_MAP[statusCode] || 'INTERNAL_ERROR';

    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message,
        ...(details && { details }),
      },
    });
  }

  /**
   * Created response (201)
   */
  static created<T>(res: Response, data: T, message: string = 'Created successfully') {
    return this.success(res, data, message, 201);
  }
}
