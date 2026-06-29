// Training Courses Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { TrainingCoursesService } from './service';
import { CourseError } from './types';

export class TrainingCoursesController {
  // ─── GET /api/admin/training-courses ─────────────────────────
  static async listCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const category = (req.query.category as string) || undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;

      const result = await TrainingCoursesService.listCourses(page, limit, category, search, status);

      return ApiResponseHandler.paginated(
        res,
        result.courses,
        result.pagination.total,
        page,
        limit,
        'Courses retrieved successfully'
      );
    } catch (error) {
      return next(error);
    }
  }

  // ─── GET /api/training-courses (Public) ───────────────────────
  static async listPublicCourses(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const category = (req.query.category as string) || undefined;

      const result = await TrainingCoursesService.listPublicCourses(page, limit, category);

      return ApiResponseHandler.paginated(
        res,
        result.courses,
        result.pagination.total,
        page,
        limit,
        'Courses retrieved'
      );
    } catch (error) {
      return next(error);
    }
  }

  // ─── GET /api/training-courses/:id (Public) ──────────────────
  static async getCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await TrainingCoursesService.getCourseById(req.params.id as string);
      return ApiResponseHandler.success(res, course, 'Course retrieved');
    } catch (error) {
      if (error instanceof CourseError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── POST /api/admin/training-courses ────────────────────────
  static async createCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, category, duration, level, price } = req.body;
      const errors: Record<string, string> = {};

      if (!title) errors.title = 'Course title is required';
      if (!category) errors.category = 'Category is required';
      else if (!['basic', 'intermediate', 'advanced', 'internship', 'matured'].includes(category)) {
        errors.category = 'Category must be: basic, intermediate, advanced, internship, or matured';
      }
      if (!duration) errors.duration = 'Duration is required (e.g. "8 weeks")';
      if (!level) errors.level = 'Level is required (e.g. "Intermediate")';
      if (!price) errors.price = 'Price is required (e.g. "GHS 2,800")';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const course = await TrainingCoursesService.createCourse({
        title,
        category,
        duration,
        level,
        price,
        description: req.body.description,
        topics: req.body.topics || [],
        instructor: req.body.instructor,
        format: req.body.format,
      });

      return ApiResponseHandler.created(res, course, 'Course created successfully');
    } catch (error) {
      if (error instanceof CourseError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/training-courses/:id ─────────────────────
  static async updateCourse(req: Request, res: Response, next: NextFunction) {
    try {
      const course = await TrainingCoursesService.updateCourse(
        req.params.id as string,
        req.body
      );
      return ApiResponseHandler.success(res, course, 'Course updated successfully');
    } catch (error) {
      if (error instanceof CourseError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── DELETE /api/admin/training-courses/:id ──────────────────
  static async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try {
      await TrainingCoursesService.deleteCourse(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Course deleted successfully');
    } catch (error) {
      if (error instanceof CourseError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
