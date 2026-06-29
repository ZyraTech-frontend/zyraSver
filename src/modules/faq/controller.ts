// FAQ Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { FAQService } from './service';
import { FAQError } from './types';

export class FAQController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async listPublicFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const category = (req.query.category as string) || undefined;
      const faqs = await FAQService.listFAQs(category, 'published');
      return ApiResponseHandler.success(res, faqs, 'FAQs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listAdminFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const category = (req.query.category as string) || undefined;
      const status = (req.query.status as string) || undefined;
      
      const faqs = await FAQService.listFAQs(category, status);
      return ApiResponseHandler.success(res, faqs, 'FAQs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const faq = await FAQService.getFAQ(req.params.id as string);
      return ApiResponseHandler.success(res, faq, 'FAQ retrieved');
    } catch (error) {
      if (error instanceof FAQError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const errors: Record<string, string> = {};

      if (!question) errors.question = 'Question is required';
      if (!answer) errors.answer = 'Answer is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const faq = await FAQService.createFAQ(req.body);
      return ApiResponseHandler.created(res, faq, 'FAQ created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const faq = await FAQService.updateFAQ(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, faq, 'FAQ updated successfully');
    } catch (error) {
      if (error instanceof FAQError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      await FAQService.deleteFAQ(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'FAQ deleted successfully');
    } catch (error) {
      if (error instanceof FAQError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async reorderFAQs(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = req.body;
      
      if (!Array.isArray(orderedIds)) {
        return ApiResponseHandler.error(res, 'orderedIds array is required', 400, null, 'VALIDATION_ERROR');
      }

      await FAQService.reorderFAQs(orderedIds);
      return ApiResponseHandler.success(res, {}, 'FAQs reordered successfully');
    } catch (error) {
      return next(error);
    }
  }
}
