// Settings Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { SettingsService } from './service';
import { SettingsError } from './types';
import { EmailService } from '../../shared/services/email';

export class SettingsController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async getPublicSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.listPublicSettings();
      return ApiResponseHandler.success(res, settings, 'Public settings retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listAdminSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const category = (req.query.category as string) || undefined;
      const settings = await SettingsService.listAllSettings(category);
      return ApiResponseHandler.success(res, settings, 'Settings retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async updateSetting(req: Request, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) {
        return ApiResponseHandler.error(res, 'Key and value are required', 400, null, 'VALIDATION_ERROR');
      }

      const setting = await SettingsService.upsertSetting(req.body, req.user?.id);
      
      if (req.body.category === 'email') {
        EmailService.reloadConfig();
      }

      return ApiResponseHandler.success(res, setting, 'Setting updated successfully');
    } catch (error) {
      if (error instanceof SettingsError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async bulkUpdateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings) || settings.length === 0) {
        return ApiResponseHandler.error(res, 'Settings array is required', 400, null, 'VALIDATION_ERROR');
      }

      const results = await SettingsService.bulkUpsertSettings(settings, req.user?.id);

      if (settings.some((s: any) => s.category === 'email')) {
        EmailService.reloadConfig();
      }

      return ApiResponseHandler.success(res, results, 'Settings updated successfully');
    } catch (error) {
      if (error instanceof SettingsError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
