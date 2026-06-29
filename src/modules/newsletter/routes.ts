// Newsletter Module - Route Definitions

import { Router } from 'express';
import { NewsletterController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Newsletter Routes ───────────────────────────────────
const newsletterRouter = Router();

newsletterRouter.post('/subscribe', NewsletterController.subscribe);
newsletterRouter.post('/unsubscribe', NewsletterController.unsubscribe);

export default newsletterRouter;

// ─── Admin Newsletter Routes (content permission) ───────────────
export const adminNewsletterRouter = Router();

adminNewsletterRouter.get(
  '/',
  authMiddleware,
  checkPermission('content'), // Typically managed alongside content
  NewsletterController.listSubscribers
);

adminNewsletterRouter.patch(
  '/:id/status',
  authMiddleware,
  checkPermission('content'),
  NewsletterController.updateStatus
);
