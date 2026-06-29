// Training Applications Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { TrainingApplicationsService } from './service';
import { ApplicationError } from './types';

const ADVANCED_CATEGORIES = ['intermediate', 'advanced', 'internship', 'matured'];

export class TrainingApplicationsController {
  // ─── POST /api/training/applications (Public) ─────────────────
  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId } = req.body;

      // We need to know if this is advanced to validate correctly
      // Determine from the course (we'll check category later in service)
      // For now, check if cvFile was provided in multipart
      const hasFile = !!req.file;

      // Determine if course is advanced based on provided category hint
      // The service will also double-check against actual DB category
      const categoryHint = req.body._courseCategory || '';
      const isAdvanced = ADVANCED_CATEGORIES.includes(categoryHint.toLowerCase());

      // Validate input
      const errors = TrainingApplicationsService.validateInput(req.body, isAdvanced, hasFile);

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(
          res,
          'Please provide all required fields',
          400,
          errors,
          'VALIDATION_ERROR'
        );
      }

      // Build CV file URL if uploaded
      let cvFileUrl: string | undefined;
      if (req.file) {
        // TODO: Upload to cloud storage. For now store as local path
        cvFileUrl = `uploads/cv/${courseId}/${Date.now()}_${req.file.originalname}`;
      }

      const result = await TrainingApplicationsService.submitApplication({
        courseId: req.body.courseId,
        fullName: req.body.fullName,
        emailAddress: req.body.emailAddress,
        phoneNumber: req.body.phoneNumber,
        country: req.body.country,
        currentLocation: req.body.currentLocation,
        educationLevel: req.body.educationLevel,
        preferredCohort: req.body.preferredCohort,
        learningMode: req.body.learningMode,
        message: req.body.message,
        cvFileUrl,
        motivationStatement: req.body.motivationStatement,
        linkedinUrl: req.body.linkedinUrl,
        websiteUrl: req.body.websiteUrl,
      });

      return ApiResponseHandler.success(res, result, 'Application submitted successfully');
    } catch (error) {
      if (error instanceof ApplicationError) {
        return ApiResponseHandler.error(
          res,
          error.message,
          error.statusCode,
          error.details,
          error.code
        );
      }
      return next(error);
    }
  }

  // ─── GET /api/admin/enrollments ───────────────────────────────
  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
      const status = (req.query.status as string) || undefined;
      const courseId = (req.query.courseId as string) || undefined;

      const result = await TrainingApplicationsService.listApplications(
        page,
        limit,
        status,
        courseId
      );

      return ApiResponseHandler.paginated(
        res,
        result.applications,
        result.pagination.total,
        page,
        limit,
        'Enrollments retrieved successfully'
      );
    } catch (error) {
      return next(error);
    }
  }

  // ─── GET /api/admin/enrollments/:id ───────────────────────────
  static async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await TrainingApplicationsService.getApplicationById(
        req.params.id as string
      );
      return ApiResponseHandler.success(res, application, 'Enrollment retrieved');
    } catch (error) {
      if (error instanceof ApplicationError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── PUT /api/admin/enrollments/:id/status ────────────────────
  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reviewNotes } = req.body;
      const validStatuses = ['approved', 'rejected', 'pending'];

      if (!status || !validStatuses.includes(status)) {
        return ApiResponseHandler.error(
          res,
          'Status must be approved, rejected, or pending',
          400,
          { status: 'Must be approved, rejected, or pending' },
          'VALIDATION_ERROR'
        );
      }

      const application = await TrainingApplicationsService.updateStatus(
        req.params.id as string,
        status,
        reviewNotes,
        req.user?.id
      );

      return ApiResponseHandler.success(
        res,
        application,
        `Application ${status} successfully`
      );
    } catch (error) {
      if (error instanceof ApplicationError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
