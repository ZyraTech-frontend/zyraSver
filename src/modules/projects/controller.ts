// Projects Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { s3Service } from '../../shared/services/s3.service';
import { ProjectsService } from './service';
import { ProjectError } from './types';

export class ProjectsController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async listPublicProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const technology = (req.query.technology as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await ProjectsService.listProjects(page, limit, 'published', technology, search);
      return ApiResponseHandler.paginated(res, result.projects, result.total, page, limit, 'Projects retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getPublicProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.getProject(req.params.slug as string);
      
      if (project.status !== 'published') {
        return ApiResponseHandler.error(res, 'Project not found', 404, null, 'NOT_FOUND');
      }
      
      return ApiResponseHandler.success(res, project, 'Project retrieved');
    } catch (error) {
      if (error instanceof ProjectError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listAdminProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;
      const technology = (req.query.technology as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await ProjectsService.listProjects(page, limit, status, technology, search);
      return ApiResponseHandler.paginated(res, result.projects, result.total, page, limit, 'Projects retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getAdminProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.getProject(req.params.id as string);
      return ApiResponseHandler.success(res, project, 'Project retrieved');
    } catch (error) {
      if (error instanceof ProjectError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, slug } = req.body;
      const errors: Record<string, string> = {};

      if (!title) errors.title = 'Title is required';
      if (!slug) errors.slug = 'Slug is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const project = await ProjectsService.createProject(req.body);
      return ApiResponseHandler.created(res, project, 'Project created successfully');
    } catch (error) {
      if (error instanceof ProjectError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectsService.updateProject(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, project, 'Project updated successfully');
    } catch (error) {
      if (error instanceof ProjectError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectsService.deleteProject(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Project deleted successfully');
    } catch (error) {
      if (error instanceof ProjectError) {
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
      const fileName = `projects-${Date.now()}-${req.file.originalname}`;
      const url = await s3Service.uploadImage(fileName, req.file.buffer, req.file.mimetype);
      
      return ApiResponseHandler.success(res, { url }, 'File uploaded successfully');
    } catch (error) {
      return next(error);
    }
  }
}
