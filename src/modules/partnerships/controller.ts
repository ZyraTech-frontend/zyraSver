// Partnerships Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { PartnershipsService } from './service';
import { PartnershipError } from './types';

export class PartnershipsController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async submitApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const { organizationName, email, contactName, agreedToTerms } = req.body;
      const errors: Record<string, string> = {};

      if (!organizationName) errors.organizationName = 'Organization name is required';
      if (!contactName) errors.contactName = 'Contact name is required';
      if (!email) errors.email = 'Email is required';
      if (agreedToTerms !== true) errors.agreedToTerms = 'You must agree to the terms';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const application = await PartnershipsService.submitApplication(req.body);
      return ApiResponseHandler.created(res, application, 'Partnership application submitted successfully');
    } catch (error) {
      if (error instanceof PartnershipError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await PartnershipsService.listApplications(page, limit, status, search);
      return ApiResponseHandler.paginated(res, result.applications, result.total, page, limit, 'Applications retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const application = await PartnershipsService.getApplication(req.params.id as string);
      return ApiResponseHandler.success(res, application, 'Application retrieved');
    } catch (error) {
      if (error instanceof PartnershipError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, reviewNotes } = req.body;
      if (!status) {
        return ApiResponseHandler.error(res, 'Status is required', 400, null, 'VALIDATION_ERROR');
      }

      const adminId = req.user!.id;
      const application = await PartnershipsService.updateStatus(
        req.params.id as string,
        status,
        reviewNotes,
        adminId
      );
      
      return ApiResponseHandler.success(res, application, 'Application status updated');
    } catch (error) {
      if (error instanceof PartnershipError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async deleteApplication(req: Request, res: Response, next: NextFunction) {
    try {
      await PartnershipsService.deleteApplication(req.params.id as string);
      return ApiResponseHandler.success(res, {}, 'Application deleted successfully');
    } catch (error) {
      if (error instanceof PartnershipError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
