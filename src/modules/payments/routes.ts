// Payments Module - Route Definitions

import { Router } from 'express';
import express from 'express';
import { PaymentsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Payment Routes ──────────────────────────────────────
const paymentsRouter = Router();

paymentsRouter.post('/initialize', PaymentsController.initializePayment);
paymentsRouter.get('/verify', PaymentsController.verifyPayment);

// Webhook requires raw body for HMAC signature verification
// We'll use express.raw for this specific route
paymentsRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => {
    // Attach raw body for controller
    (req as any).rawBody = req.body;
    next();
  },
  PaymentsController.handleWebhook
);

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
