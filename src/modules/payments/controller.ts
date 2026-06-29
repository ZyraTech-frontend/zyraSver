// Payments Module - Request Handlers

import { Request, Response, NextFunction } from 'express';
import { ApiResponseHandler } from '../../shared/utils/response';
import { PaymentsService } from './service';
import { PaymentError } from './types';

export class PaymentsController {
  // ─── PUBLIC ENDPOINTS ─────────────────────────────────────────

  static async initializePayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { courseId, studentName, studentEmail, amount } = req.body;
      const errors: Record<string, string> = {};

      if (!courseId) errors.courseId = 'Course ID is required';
      if (!studentName) errors.studentName = 'Student name is required';
      if (!studentEmail) errors.studentEmail = 'Student email is required';
      if (!amount || isNaN(Number(amount))) errors.amount = 'Valid amount is required';

      if (Object.keys(errors).length > 0) {
        return ApiResponseHandler.error(res, 'Validation failed', 400, errors, 'VALIDATION_ERROR');
      }

      const result = await PaymentsService.initializePayment({
        courseId,
        applicationId: req.body.applicationId,
        studentName,
        studentEmail,
        amount: Number(amount),
      });

      return ApiResponseHandler.success(res, result, 'Payment initialized');
    } catch (error) {
      if (error instanceof PaymentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = (req.query.reference as string) || req.params.reference;
      if (!reference) {
        return ApiResponseHandler.error(res, 'Payment reference is required', 400, null, 'VALIDATION_ERROR');
      }

      const result = await PaymentsService.verifyPayment(reference as string);
      return ApiResponseHandler.success(res, result, 'Payment verified');
    } catch (error) {
      if (error instanceof PaymentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      if (!signature) {
        res.status(401).send('Missing signature');
        return;
      }

      // Important: Ensure Express didn't parse the body as JSON if we need raw body for HMAC.
      // Or if using standard body-parser, `req.body` needs to be stringified back exactly,
      // but it's safer to configure a custom raw middleware for this route if possible.
      // Assuming raw string buffer in `req.rawBody` provided by a specific middleware.
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      await PaymentsService.processWebhook(signature, rawBody);
      res.status(200).send('Webhook received');
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(400).send('Webhook Error');
    }
  }

  // ─── ADMIN ENDPOINTS ──────────────────────────────────────────

  static async listPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
      const status = (req.query.status as string) || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await PaymentsService.listPayments(page, limit, status, search);
      return ApiResponseHandler.paginated(res, result.payments, result.pagination.total, page, limit, 'Transactions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  static async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      if (!reason) {
        return ApiResponseHandler.error(res, 'Refund reason is required', 400, null, 'VALIDATION_ERROR');
      }

      const result = await PaymentsService.issueRefund(req.params.reference as string, reason);
      return ApiResponseHandler.success(res, result, 'Payment refunded successfully');
    } catch (error) {
      if (error instanceof PaymentError) {
        return ApiResponseHandler.error(res, error.message, error.statusCode, null, error.code);
      }
      return next(error);
    }
  }
}
