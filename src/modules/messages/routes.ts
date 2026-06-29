// Messages Module - Route Definitions

import { Router } from 'express';
import { MessagesController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Message Routes ──────────────────────────────────────
const messagesRouter = Router();

messagesRouter.post('/', MessagesController.submitMessage);

export default messagesRouter;

// ─── Admin Message Routes (messages permission) ─────────────────
export const adminMessagesRouter = Router();

adminMessagesRouter.get(
  '/',
  authMiddleware,
  checkPermission('messages'),
  MessagesController.listMessages
);

adminMessagesRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('messages'),
  MessagesController.getMessage // This marks it as read automatically
);

adminMessagesRouter.patch(
  '/:id/read-status',
  authMiddleware,
  checkPermission('messages'),
  MessagesController.updateReadStatus
);

adminMessagesRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('messages'),
  MessagesController.deleteMessage
);
