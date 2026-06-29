// Jobs Module - Route Definitions

import { Router } from 'express';
import { JobsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { formSubmissionRateLimiter } from '../../shared/middleware/rateLimiter';
import { uploadJobApplication } from '../../shared/middleware/upload';

// ─── Public Job Listings & Applications ───────────────────────
const publicRouter = Router();

publicRouter.get('/', JobsController.listPublicJobs);
publicRouter.get('/:id', JobsController.getJob);

publicRouter.post(
  '/applications',
  formSubmissionRateLimiter,
  uploadJobApplication.fields([
    { name: 'resumeFile', maxCount: 1 },
    { name: 'additionalDocumentFile', maxCount: 1 },
  ]),
  JobsController.submitApplication
);

export default publicRouter;

// ─── Admin Job Listings (jobs permission) ─────────────────────
export const adminJobsRouter = Router();

adminJobsRouter.get(
  '/',
  authMiddleware,
  checkPermission('jobs'),
  JobsController.listAdminJobs
);
adminJobsRouter.post(
  '/',
  authMiddleware,
  checkPermission('jobs'),
  JobsController.createJob
);
adminJobsRouter.put(
  '/:id',
  authMiddleware,
  checkPermission('jobs'),
  JobsController.updateJob
);
adminJobsRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('jobs'),
  JobsController.deleteJob
);

// ─── Admin Job Applications (job_applications permission) ──────
export const adminJobApplicationsRouter = Router();

adminJobApplicationsRouter.get(
  '/',
  authMiddleware,
  checkPermission('job_applications'),
  JobsController.listApplications
);
adminJobApplicationsRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('job_applications'),
  JobsController.getApplication
);
adminJobApplicationsRouter.put(
  '/:id/status',
  authMiddleware,
  checkPermission('job_applications'),
  JobsController.updateApplicationStatus
);
