// Logs Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { LogsService } from './service';

export class LogsController {
  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
      const action = (req.query.action as string) || undefined;
      const entity = (req.query.entity as string) || undefined;
      const userId = (req.query.userId as string) || undefined;

      const result = await LogsService.listLogs(page, limit, action, entity, userId);
      return ApiResponseHandler.paginated(res, result.logs, result.total, page, limit, 'Activity logs retrieved');
    } catch (error) {
      return next(error);
    }
  }
}
