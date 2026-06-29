// Contact Module - Route Definitions

import { Router } from 'express';
import { ContactController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Contact Routes ──────────────────────────────────────
const contactRouter = Router();

contactRouter.post('/', ContactController.submitInquiry);

export default contactRouter;

// ─── Admin Contact Routes (messages permission) ─────────────────
export const adminContactRouter = Router();

adminContactRouter.get(
  '/',
  authMiddleware,
  checkPermission('messages'),
  ContactController.listInquiries
);

adminContactRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('messages'),
  ContactController.getInquiry
);

adminContactRouter.patch(
  '/:id/status',
  authMiddleware,
  checkPermission('messages'),
  ContactController.updateStatus
);

adminContactRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('messages'),
  ContactController.deleteInquiry
);
