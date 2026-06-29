// Contact Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { ContactService } from './service';
import { ContactError } from './types';

export class ContactController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async submitInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, email, message } = req.body;
      const errors: Record<string, string> = {};

      if (!fullName) errors.fullName = 'Full name is required';
      if (!email) errors.email = 'Email is required';
      if (!message) errors.message = 'Message is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const inquiry = await ContactService.submitInquiry(req.body);
      return ApiResponseHandler.created(res, inquiry, 'Inquiry submitted successfully');
    } catch (error) {
      if (error instanceof ContactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listInquiries(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const status = (req.query.status as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await ContactService.listInquiries(page, limit, status, search);
      return ApiResponseHandler.paginated(res, result.inquiries, result.total, page, limit, 'Inquiries retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const inquiry = await ContactService.getInquiry(req.params.id as string);
      return ApiResponseHandler.success(res, inquiry, 'Inquiry retrieved');
    } catch (error) {
      if (error instanceof ContactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return ApiResponseHandler.error(res, 'Status is required', 400, null, 'VALIDATION_ERROR');
      }

      const inquiry = await ContactService.updateStatus(req.params.id as string, status);
      return ApiResponseHandler.success(res, inquiry, 'Inquiry status updated');
    } catch (error) {
      if (error instanceof ContactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      await ContactService.deleteInquiry(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Inquiry deleted successfully');
    } catch (error) {
      if (error instanceof ContactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
