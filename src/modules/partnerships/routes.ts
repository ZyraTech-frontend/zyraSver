// Partnerships Module - Route Definitions

import { Router } from 'express';
import { PartnershipsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';

// ─── Public Partnership Routes ──────────────────────────────────
const partnershipsRouter = Router();

partnershipsRouter.post('/', PartnershipsController.submitApplication);

export default partnershipsRouter;

// ─── Admin Partnership Routes ───────────────────────────────────
export const adminPartnershipsRouter = Router();

adminPartnershipsRouter.get(
  '/',
  authMiddleware,
  // We allow all admins to see this, or restrict via permission if needed
  PartnershipsController.listApplications
);

adminPartnershipsRouter.get(
  '/:id',
  authMiddleware,
  PartnershipsController.getApplication
);

adminPartnershipsRouter.patch(
  '/:id/status',
  authMiddleware,
  PartnershipsController.updateStatus
);

adminPartnershipsRouter.delete(
  '/:id',
  authMiddleware,
  PartnershipsController.deleteApplication
);
