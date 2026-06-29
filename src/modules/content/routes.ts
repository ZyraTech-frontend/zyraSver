// CMS Content Module - Route Definitions

import { Router } from 'express';
import { ContentController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Content Routes (No auth) ──────────────────────────
const contentRouter = Router();

contentRouter.get('/items/:section', ContentController.getPublicItems);
contentRouter.get('/pages/:section', ContentController.getPublicPage);

export default contentRouter;

// ─── Admin Content Routes (content permission) ────────────────
export const adminContentRouter = Router();

// Items (List CMS)
adminContentRouter.get(
  '/items/section/:section',
  authMiddleware,
  checkPermission('content'),
  ContentController.listAdminItems
);
adminContentRouter.post(
  '/items',
  authMiddleware,
  checkPermission('content'),
  ContentController.createItem
);
adminContentRouter.put(
  '/items/reorder/:section',
  authMiddleware,
  checkPermission('content'),
  ContentController.reorderItems
);
adminContentRouter.get(
  '/items/:id',
  authMiddleware,
  checkPermission('content'),
  ContentController.getItem
);
adminContentRouter.put(
  '/items/:id',
  authMiddleware,
  checkPermission('content'),
  ContentController.updateItem
);
adminContentRouter.delete(
  '/items/:id',
  authMiddleware,
  checkPermission('content'),
  ContentController.deleteItem
);

// Pages (Single Page CMS)
adminContentRouter.get(
  '/pages/:section',
  authMiddleware,
  checkPermission('content'),
  ContentController.getAdminPage
);
adminContentRouter.put(
  '/pages',
  authMiddleware,
  checkPermission('content'),
  ContentController.upsertPage
);
