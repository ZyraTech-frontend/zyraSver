// Settings Module - Route Definitions

import { Router } from 'express';
import { SettingsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

// ─── Public Settings Route ──────────────────────────────────────
const settingsRouter = Router();

settingsRouter.get('/', SettingsController.getPublicSettings);

export default settingsRouter;

// ─── Admin Settings Routes (settings permission) ────────────────
export const adminSettingsRouter = Router();

adminSettingsRouter.get(
  '/',
  authMiddleware,
  checkPermission('settings'),
  SettingsController.listAdminSettings
);

adminSettingsRouter.put(
  '/',
  authMiddleware,
  checkPermission('settings'),
  SettingsController.updateSetting
);

adminSettingsRouter.post(
  '/bulk',
  authMiddleware,
  checkPermission('settings'),
  SettingsController.bulkUpdateSettings
);
