// Jobs Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { JobsService } from './service';
import { JobError } from './types';

export class JobsController {
  // ─── ADMIN JOB LISTINGS ───────────────────────────────────────

  static async listAdminJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const status = (req.query.status as string) || undefined;
      const department = (req.query.department as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await JobsService.listJobs(page, limit, status, department, search);
      return ApiResponseHandler.paginated(res, result.jobs, result.pagination.total, page, limit, 'Jobs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const { title } = req.body;
      const errors: Record<string, string> = {};

      if (!title) errors.title = 'Job title is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const job = await JobsService.createJob(req.body);
      return ApiResponseHandler.created(res, job, 'Job created successfully');
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.updateJob(req.params.id as string, req.body);
      return ApiResponseHandler.success(res, job, 'Job updated successfully');
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      await JobsService.deleteJob(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Job deleted successfully');
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── PUBLIC JOB LISTINGS ──────────────────────────────────────

  static async listPublicJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const department = (req.query.department as string) || undefined;

      const result = await JobsService.listPublicJobs(page, limit, department);
      return ApiResponseHandler.paginated(res, result.jobs, result.pagination.total, page, limit, 'Jobs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await JobsService.getJobById(req.params.id as string);
      return ApiResponseHandler.success(res, job, 'Job retrieved');
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── PUBLIC JOB APPLICATIONS ──────────────────────────────────

  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const errors: Record<string, string> = {};

      if (!req.body.jobId) errors.jobId = 'Job ID is required';
      if (!req.body.firstName) errors.firstName = 'First name is required';
      if (!req.body.lastName) errors.lastName = 'Last name is required';
      if (!req.body.email) errors.email = 'Email is required';
      if (!req.body.city) errors.city = 'City is required';
      if (!req.body.phoneNumber) errors.phoneNumber = 'Phone number is required';
      if (!req.body.legalAuthorization) errors.legalAuthorization = 'Legal authorization is required';
      if (!req.body.residence) errors.residence = 'Residence is required';
      if (!req.body.currentSalary) errors.currentSalary = 'Current salary is required';
      if (!req.body.howDidYouKnowZyra) errors.howDidYouKnowZyra = 'How did you know Zyra is required';

      // Files uploaded by multer
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      let resumeUrl = '';
      let additionalDocumentUrl = '';

      if (files?.resumeFile?.[0]) {
        resumeUrl = `uploads/resumes/${req.body.jobId}/${Date.now()}_${files.resumeFile[0].originalname}`;
      } else {
        errors.resumeFile = 'Resume file is required';
      }

      if (files?.additionalDocumentFile?.[0]) {
        additionalDocumentUrl = `uploads/docs/${req.body.jobId}/${Date.now()}_${files.additionalDocumentFile[0].originalname}`;
      }

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const result = await JobsService.submitApplication({
        ...req.body,
        resumeUrl,
        additionalDocumentUrl: additionalDocumentUrl || null,
        workExperience: parseInt(req.body.workExperience) || 0,
        certifyTruth: req.body.certifyTruth === 'true' || req.body.certifyTruth === true,
        agreePrivacy: req.body.agreePrivacy === 'true' || req.body.agreePrivacy === true,
      });

      return ApiResponseHandler.success(res, result, result.message);
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN JOB APPLICATIONS ───────────────────────────────────

  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const status = (req.query.status as string) || undefined;
      const jobId = (req.query.jobId as string) || undefined;

      const result = await JobsService.listApplications(page, limit, status, jobId);
      return ApiResponseHandler.paginated(res, result.applications, result.pagination.total, page, limit, 'Applications retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await JobsService.getApplicationById(req.params.id as string);
      return ApiResponseHandler.success(res, app, 'Application retrieved');
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reviewNotes } = req.body;
      const validStatuses = ['approved', 'rejected', 'pending'];

      if (!status || !validStatuses.includes(status)) {
        return ApiResponseHandler.error(res, 'Status must be approved, rejected, or pending', 400, { status: 'Invalid status' }, 'VALIDATION_ERROR');
      }

      const app = await JobsService.updateApplicationStatus(req.params.id as string, status, reviewNotes, req.user?.id);
      return ApiResponseHandler.success(res, app, `Application ${status} successfully`);
    } catch (error) {
      if (error instanceof JobError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
