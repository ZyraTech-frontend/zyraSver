// CMS Content Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { ContentService } from './service';
import { ContentError } from './types';

export class ContentController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async getPublicItems(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.params.section as string;
      if (!section) {
        return ApiResponseHandler.error(res, 'Section is required', 400, null, 'VALIDATION_ERROR');
      }

      const items = await ContentService.listContentItems(section, 'published');
      return ApiResponseHandler.success(res, items, 'Content items retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.params.section as string;
      if (!section) {
        return ApiResponseHandler.error(res, 'Section is required', 400, null, 'VALIDATION_ERROR');
      }

      const page = await ContentService.getContentPage(section);
      return ApiResponseHandler.success(res, page, 'Content page retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: Content Items ───────────────────────────

  static async listAdminItems(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.params.section as string;
      const status = (req.query.status as string) || undefined;
      if (!section) {
        return ApiResponseHandler.error(res, 'Section is required', 400, null, 'VALIDATION_ERROR');
      }

      const items = await ContentService.listContentItems(section, status);
      return ApiResponseHandler.success(res, items, 'Content items retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ContentService.getContentItem(req.params.id as string);
      return ApiResponseHandler.success(res, item, 'Content item retrieved');
    } catch (error) {
      if (error instanceof ContentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { section } = req.body;
      if (!section) {
        return ApiResponseHandler.error(res, 'Section is required', 400, null, 'VALIDATION_ERROR');
      }

      const item = await ContentService.createContentItem(req.body);
      return ApiResponseHandler.created(res, item, 'Content item created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await ContentService.updateContentItem(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, item, 'Content item updated successfully');
    } catch (error) {
      if (error instanceof ContentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      await ContentService.deleteContentItem(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Content item deleted successfully');
    } catch (error) {
      if (error instanceof ContentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async reorderItems(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.params.section as string;
      const { orderedIds } = req.body;
      
      if (!section || !Array.isArray(orderedIds)) {
        return ApiResponseHandler.error(res, 'Section and orderedIds array are required', 400, null, 'VALIDATION_ERROR');
      }

      await ContentService.reorderContentItems(section, orderedIds);
      return ApiResponseHandler.success(res, {}, 'Items reordered successfully');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: Content Pages ───────────────────────────

  static async getAdminPage(req: Request, res: Response, next: NextFunction) {
    try {
      const section = req.params.section as string;
      if (!section) {
        return ApiResponseHandler.error(res, 'Section is required', 400, null, 'VALIDATION_ERROR');
      }

      const page = await ContentService.getContentPage(section);
      return ApiResponseHandler.success(res, page, 'Content page retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async upsertPage(req: Request, res: Response, next: NextFunction) {
    try {
      const { section, content } = req.body;
      if (!section || content === undefined) {
        return ApiResponseHandler.error(res, 'Section and content are required', 400, null, 'VALIDATION_ERROR');
      }

      const page = await ContentService.upsertContentPage(
        { section, content },
        req.user?.id
      );
      
      return ApiResponseHandler.success(res, page, 'Content page saved successfully');
    } catch (error) {
      if (error instanceof ContentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
