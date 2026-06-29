// Impact Module - Route Definitions

import { Router } from 'express';
import { ImpactController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadImage } from '../../shared/middleware/upload';

// ─── Public Impact Routes ───────────────────────────────────────
const impactRouter = Router();

impactRouter.get('/', ImpactController.getPublicImpactData);

export default impactRouter;

// ─── Admin Impact Routes (content permission) ───────────────────
export const adminImpactRouter = Router();

// Upload Helper
adminImpactRouter.post(
  '/upload',
  authMiddleware,
  checkPermission('content'),
  uploadImage.single('file'),
  ImpactController.handleFileUpload
);

// Metrics
adminImpactRouter.get(
  '/metrics',
  authMiddleware,
  checkPermission('content'),
  ImpactController.listAdminMetrics
);
adminImpactRouter.post(
  '/metrics',
  authMiddleware,
  checkPermission('content'),
  ImpactController.createMetric
);
adminImpactRouter.put(
  '/metrics/reorder',
  authMiddleware,
  checkPermission('content'),
  ImpactController.reorderMetrics
);
adminImpactRouter.get(
  '/metrics/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.getMetric
);
adminImpactRouter.put(
  '/metrics/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.updateMetric
);
adminImpactRouter.delete(
  '/metrics/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.deleteMetric
);

// Stories
adminImpactRouter.get(
  '/stories',
  authMiddleware,
  checkPermission('content'),
  ImpactController.listAdminStories
);
adminImpactRouter.post(
  '/stories',
  authMiddleware,
  checkPermission('content'),
  ImpactController.createStory
);
adminImpactRouter.get(
  '/stories/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.getStory
);
adminImpactRouter.put(
  '/stories/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.updateStory
);
adminImpactRouter.delete(
  '/stories/:id',
  authMiddleware,
  checkPermission('content'),
  ImpactController.deleteStory
);
