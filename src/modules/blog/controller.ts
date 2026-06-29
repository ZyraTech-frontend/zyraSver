// Blog Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { BlogService } from './service';
import { BlogError } from './types';

export class BlogController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async listPublicArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const tag = (req.query.tag as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await BlogService.listArticles(page, limit, 'published', tag, search);
      return ApiResponseHandler.paginated(res, result.articles, result.total, page, limit, 'Articles retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await BlogService.getArticle(req.params.slug as string);
      
      if (article.status !== 'published') {
        return ApiResponseHandler.error(res, 'Article not found', 404, null, 'NOT_FOUND');
      }
      
      return ApiResponseHandler.success(res, article, 'Article retrieved');
    } catch (error) {
      if (error instanceof BlogError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listAdminArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;
      const tag = (req.query.tag as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await BlogService.listArticles(page, limit, status, tag, search);
      return ApiResponseHandler.paginated(res, result.articles, result.total, page, limit, 'Articles retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await BlogService.getArticle(req.params.id as string);
      return ApiResponseHandler.success(res, article, 'Article retrieved');
    } catch (error) {
      if (error instanceof BlogError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, slug, content } = req.body;
      const errors: Record<string, string> = {};

      if (!title) errors.title = 'Title is required';
      if (!slug) errors.slug = 'Slug is required';
      if (!content) errors.content = 'Content is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const article = await BlogService.createArticle(req.body);
      return ApiResponseHandler.created(res, article, 'Article created successfully');
    } catch (error) {
      if (error instanceof BlogError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await BlogService.updateArticle(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, article, 'Article updated successfully');
    } catch (error) {
      if (error instanceof BlogError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      await BlogService.deleteArticle(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Article deleted successfully');
    } catch (error) {
      if (error instanceof BlogError) {
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
      
      // Mocked URL. Replace with S3 or actual storage solution logic
      const mockUrl = `https://storage.zyratechhub.com/blog/${Date.now()}-${req.file.originalname}`;
      
      return ApiResponseHandler.success(res, { url: mockUrl }, 'File uploaded successfully');
    } catch (error) {
      return next(error);
    }
  }
}
