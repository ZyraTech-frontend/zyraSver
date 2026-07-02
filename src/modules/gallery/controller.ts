// Gallery Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { s3Service } from '../../shared/services/s3.service';
import { GalleryService } from './service';
import { GalleryError } from './types';

export class GalleryController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async listPublicAlbums(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

      const result = await GalleryService.listAlbums(page, limit, 'published');
      return ApiResponseHandler.paginated(res, result.albums, result.total, page, limit, 'Albums retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const album = await GalleryService.getAlbum(req.params.id as string, true);
      if (album.status !== 'published') {
        return ApiResponseHandler.error(res, 'Album not found', 404, null, 'NOT_FOUND');
      }
      return ApiResponseHandler.success(res, album, 'Album retrieved');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: ALBUMS ──────────────────────────────────

  static async listAdminAlbums(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;

      const result = await GalleryService.listAlbums(page, limit, status);
      return ApiResponseHandler.paginated(res, result.albums, result.total, page, limit, 'Albums retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const album = await GalleryService.getAlbum(req.params.id as string, true);
      return ApiResponseHandler.success(res, album, 'Album retrieved');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.body;
      if (!title) {
        return ApiResponseHandler.error(res, 'Title is required', 400, null, 'VALIDATION_ERROR');
      }

      const album = await GalleryService.createAlbum(req.body);
      return ApiResponseHandler.created(res, album, 'Album created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      const album = await GalleryService.updateAlbum(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, album, 'Album updated successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteAlbum(req: Request, res: Response, next: NextFunction) {
    try {
      await GalleryService.deleteAlbum(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Album deleted successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS: MEDIA ───────────────────────────────────

  static async addMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const { albumId, url } = req.body;
      // If using multer for file uploads, url will be injected by the upload controller/middleware
      // We assume `req.body.url` is available here (e.g. from S3 or local path)
      if (!albumId || !url) {
        return ApiResponseHandler.error(res, 'Album ID and URL are required', 400, null, 'VALIDATION_ERROR');
      }

      const media = await GalleryService.addMediaToAlbum(req.body);
      return ApiResponseHandler.created(res, media, 'Media added successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const media = await GalleryService.updateMedia(req.params.mediaId as string, req.body);
      return ApiResponseHandler.success(res, media, 'Media updated successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteMedia(req: Request, res: Response, next: NextFunction) {
    try {
      await GalleryService.removeMedia(req.params.mediaId as string);
      return ApiResponseHandler.success(res, {}, 'Media deleted successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async reorderMedia(req: Request, res: Response, next: NextFunction) {
    try {
      const albumId = req.params.id as string;
      const { orderedIds } = req.body;
      
      if (!Array.isArray(orderedIds)) {
        return ApiResponseHandler.error(res, 'orderedIds array is required', 400, null, 'VALIDATION_ERROR');
      }

      await GalleryService.reorderMedia(albumId, orderedIds);
      return ApiResponseHandler.success(res, {}, 'Media reordered successfully');
    } catch (error) {
      if (error instanceof GalleryError) {
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
      const fileName = `gallery-${Date.now()}-${req.file.originalname}`;
      const url = await s3Service.uploadImage(fileName, req.file.buffer, req.file.mimetype);
      
      return ApiResponseHandler.success(res, { url }, 'File uploaded successfully');
    } catch (error) {
      return next(error);
    }
  }
}
