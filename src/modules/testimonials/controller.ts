// Testimonials Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { s3Service } from '../../shared/services/s3.service';
import { TestimonialService } from './service';
import { TestimonialError } from './types';

export class TestimonialController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async listPublicTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const isFeaturedParam = req.query.isFeatured as string;
      const isFeatured = isFeaturedParam === 'true' ? true : isFeaturedParam === 'false' ? false : undefined;

      const result = await TestimonialService.listTestimonials(page, limit, 'published', isFeatured);
      return ApiResponseHandler.paginated(res, result.testimonials, result.total, page, limit, 'Testimonials retrieved');
    } catch (error) {
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listAdminTestimonials(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;
      const isFeaturedParam = req.query.isFeatured as string;
      const isFeatured = isFeaturedParam === 'true' ? true : isFeaturedParam === 'false' ? false : undefined;

      const result = await TestimonialService.listTestimonials(page, limit, status, isFeatured);
      return ApiResponseHandler.paginated(res, result.testimonials, result.total, page, limit, 'Testimonials retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonial = await TestimonialService.getTestimonial(req.params.id as string);
      return ApiResponseHandler.success(res, testimonial, 'Testimonial retrieved');
    } catch (error) {
      if (error instanceof TestimonialError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, content } = req.body;
      const errors: Record<string, string> = {};

      if (!name) errors.name = 'Name is required';
      if (!content) errors.content = 'Content is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const testimonial = await TestimonialService.createTestimonial(req.body);
      return ApiResponseHandler.created(res, testimonial, 'Testimonial created successfully');
    } catch (error) {
      return next(error);
    }
  }

  static async updateTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      const testimonial = await TestimonialService.updateTestimonial(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, testimonial, 'Testimonial updated successfully');
    } catch (error) {
      if (error instanceof TestimonialError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteTestimonial(req: Request, res: Response, next: NextFunction) {
    try {
      await TestimonialService.deleteTestimonial(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Testimonial deleted successfully');
    } catch (error) {
      if (error instanceof TestimonialError) {
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
      
      const fileName = `testimonials-${Date.now()}-${req.file.originalname}`;
      const url = await s3Service.uploadImage(fileName, req.file.buffer, req.file.mimetype);
      return ApiResponseHandler.success(res, { url }, 'File uploaded successfully');
    } catch (error) {
      return next(error);
    }
  }
}
