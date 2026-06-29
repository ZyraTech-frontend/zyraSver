// Messages Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { MessagesService } from './service';
import { MessageError } from './types';

export class MessagesController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async submitMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { sender, email, content } = req.body;
      const errors: Record<string, string> = {};

      if (!sender) errors.sender = 'Sender name is required';
      if (!email) errors.email = 'Email is required';
      if (!content) errors.content = 'Content is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const message = await MessagesService.submitMessage(req.body);
      return ApiResponseHandler.created(res, message, 'Message submitted successfully');
    } catch (error) {
      if (error instanceof MessageError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      
      const isReadParam = req.query.isRead as string;
      const isRead = isReadParam === 'true' ? true : isReadParam === 'false' ? false : undefined;
      const search = (req.query.search as string) || undefined;

      const result = await MessagesService.listMessages(page, limit, isRead, search);
      return ApiResponseHandler.paginated(res, result.messages, result.total, page, limit, 'Messages retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const message = await MessagesService.getMessage(req.params.id as string);
      return ApiResponseHandler.success(res, message, 'Message retrieved');
    } catch (error) {
      if (error instanceof MessageError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateReadStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { isRead } = req.body;
      if (typeof isRead !== 'boolean') {
        return ApiResponseHandler.error(res, 'isRead boolean is required', 400, null, 'VALIDATION_ERROR');
      }

      const message = await MessagesService.updateReadStatus(req.params.id as string, isRead);
      return ApiResponseHandler.success(res, message, 'Message status updated');
    } catch (error) {
      if (error instanceof MessageError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      await MessagesService.deleteMessage(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Message deleted successfully');
    } catch (error) {
      if (error instanceof MessageError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
