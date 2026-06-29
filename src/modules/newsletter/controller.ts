// Newsletter Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { NewsletterService } from './service';
import { NewsletterError } from './types';

export class NewsletterController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async subscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return ApiResponseHandler.error(res, 'Email is required', 400, null, 'VALIDATION_ERROR');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponseHandler.error(res, 'Invalid email format', 400, null, 'VALIDATION_ERROR');
      }

      const subscriber = await NewsletterService.subscribe(req.body);
      return ApiResponseHandler.created(res, subscriber, 'Successfully subscribed to newsletter');
    } catch (error) {
      if (error instanceof NewsletterError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      if (!email) {
        return ApiResponseHandler.error(res, 'Email is required', 400, null, 'VALIDATION_ERROR');
      }

      await NewsletterService.unsubscribe(email);
      return ApiResponseHandler.success(res, {}, 'Successfully unsubscribed from newsletter');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listSubscribers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const status = (req.query.status as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await NewsletterService.listSubscribers(page, limit, status, search);
      return ApiResponseHandler.paginated(res, result.subscribers, result.total, page, limit, 'Subscribers retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      if (!status) {
        return ApiResponseHandler.error(res, 'Status is required', 400, null, 'VALIDATION_ERROR');
      }

      const subscriber = await NewsletterService.updateSubscriberStatus(req.params.id as string, status);
      return ApiResponseHandler.success(res, subscriber, 'Subscriber status updated');
    } catch (error) {
      if (error instanceof NewsletterError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
