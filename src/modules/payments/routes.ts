// Payments Module - Route Definitions

import { Router } from 'express';
import { PaymentsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Payment Routes ──────────────────────────────────────
const paymentsRouter = Router();

paymentsRouter.post('/initialize', PaymentsController.initializePayment);
paymentsRouter.get('/verify', PaymentsController.verifyPayment);

// Raw body is captured globally before JSON parsing for HMAC signature verification.
paymentsRouter.post('/webhook', PaymentsController.handleWebhook);

export default paymentsRouter;

// ─── Admin Transaction Routes (transactions permission) ─────────
export const adminTransactionsRouter = Router();

adminTransactionsRouter.get(
  '/',
  authMiddleware,
  checkPermission('transactions'),
  PaymentsController.listPayments
);

adminTransactionsRouter.post(
  '/:reference/refund',
  authMiddleware,
  checkPermission('transactions'),
  PaymentsController.refundPayment
);
