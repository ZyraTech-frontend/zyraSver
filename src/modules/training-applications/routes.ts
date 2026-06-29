// Training Applications Module - Route Definitions

import { Router } from 'express';
import { TrainingApplicationsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadTrainingCV } from '../../shared/middleware/upload';
import { formSubmissionRateLimiter } from '../../shared/middleware/rateLimiter';

const router = Router();

// POST /api/training/applications — Public, rate limited
// Uses multer for optional CV file upload (advanced courses)
router.post(
  '/',
  formSubmissionRateLimiter,
  uploadTrainingCV.single('cvFile'),
  TrainingApplicationsController.submitApplication
);

export default router;

// ─── Enrollments routes (used in admin section) ───────────────
export const enrollmentsRouter = Router();

// GET  /api/admin/enrollments
enrollmentsRouter.get(
  '/',
  authMiddleware,
  checkPermission('enrollments'),
  TrainingApplicationsController.listApplications
);

// GET  /api/admin/enrollments/:id
enrollmentsRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('enrollments'),
  TrainingApplicationsController.getApplication
);

// PUT  /api/admin/enrollments/:id/status
enrollmentsRouter.put(
  '/:id/status',
  authMiddleware,
  checkPermission('enrollments'),
  TrainingApplicationsController.updateStatus
);
