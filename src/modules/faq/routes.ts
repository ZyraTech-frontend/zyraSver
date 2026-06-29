// FAQ Module - Route Definitions

import { Router } from 'express';
import { FAQController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public FAQ Routes ──────────────────────────────────────────
const faqRouter = Router();

faqRouter.get('/', FAQController.listPublicFAQs);

export default faqRouter;

// ─── Admin FAQ Routes (content permission) ──────────────────────
export const adminFaqRouter = Router();

adminFaqRouter.get(
  '/',
  authMiddleware,
  checkPermission('content'), // Grouping FAQ under 'content' permission
  FAQController.listAdminFAQs
);

adminFaqRouter.post(
  '/',
  authMiddleware,
  checkPermission('content'),
  FAQController.createFAQ
);

adminFaqRouter.put(
  '/reorder',
  authMiddleware,
  checkPermission('content'),
  FAQController.reorderFAQs
);

adminFaqRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  FAQController.getAdminFAQ
);

adminFaqRouter.put(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  FAQController.updateFAQ
);

adminFaqRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  FAQController.deleteFAQ
);
