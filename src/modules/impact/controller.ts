// Impact Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { s3Service } from '../../shared/services/s3.service';
import { ImpactService } from './service';
import { ImpactError } from './types';

export class ImpactController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async getPublicImpactData(_req: Request, res: Response, next: NextFunction) {
    try {
      const [metrics, storiesResult] = await Promise.all([
        ImpactService.listMetrics(),
        // Just get the top 10 published stories for the public page
        ImpactService.listStories(1, 10, 'published'),
      ]);

      return ApiResponseHandler.success(res, {
        metrics,
        stories: storiesResult.stories,
      }, 'Impact data retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: METRICS ─────────────────────────────────

  static async listAdminMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const metrics = await ImpactService.listMetrics();
      return ApiResponseHandler.success(res, metrics, 'Metrics retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const metric = await ImpactService.getMetric(req.params.id as string);
      return ApiResponseHandler.success(res, metric, 'Metric retrieved');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const { label, value } = req.body;
      const errors: Record<string, string> = {};

      if (!label) errors.label = 'Label is required';
      if (!value) errors.value = 'Value is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const metric = await ImpactService.createMetric(req.body);
      return ApiResponseHandler.created(res, metric, 'Metric created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateMetric(req: Request, res: Response, next: NextFunction) {
    try {
      const metric = await ImpactService.updateMetric(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, metric, 'Metric updated successfully');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteMetric(req: Request, res: Response, next: NextFunction) {
    try {
      await ImpactService.deleteMetric(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Metric deleted successfully');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async reorderMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return ApiResponseHandler.error(res, 'orderedIds array is required', 400, null, 'VALIDATION_ERROR');
      }

      await ImpactService.reorderMetrics(orderedIds);
      return ApiResponseHandler.success(res, {}, 'Metrics reordered successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: STORIES ─────────────────────────────────

  static async listAdminStories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;

      const result = await ImpactService.listStories(page, limit, status);
      return ApiResponseHandler.paginated(res, result.stories, result.total, page, limit, 'Stories retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await ImpactService.getStory(req.params.id as string);
      return ApiResponseHandler.success(res, story, 'Story retrieved');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createStory(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description } = req.body;
      const errors: Record<string, string> = {};

      if (!title) errors.title = 'Title is required';
      if (!description) errors.description = 'Description is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const story = await ImpactService.createStory(req.body);
      return ApiResponseHandler.created(res, story, 'Story created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateStory(req: Request, res: Response, next: NextFunction) {
    try {
      const story = await ImpactService.updateStory(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, story, 'Story updated successfully');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteStory(req: Request, res: Response, next: NextFunction) {
    try {
      await ImpactService.deleteStory(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Story deleted successfully');
    } catch (error) {
      if (error instanceof ImpactError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── UPLOAD HELPERS ───────────────────────────────────────────

  static async handleFileUpload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponseHandler.error(res, 'No file uploaded', 400, null, 'VALIDATION_ERROR');
      }
      
      const fileName = `impact-${Date.now()}-${req.file.originalname}`;
      const url = await s3Service.uploadImage(fileName, req.file.buffer, req.file.mimetype);
      return ApiResponseHandler.success(res, { url }, 'File uploaded successfully');
    } catch (error) {
      return next(error);
    }
  }
}
