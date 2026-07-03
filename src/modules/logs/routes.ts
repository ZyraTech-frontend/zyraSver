// Logs Module - Route Definitions

import { Router } from 'express';
import { LogsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

export const adminLogsRouter = Router();

adminLogsRouter.get(
  '/',
  authMiddleware,
  checkPermission('super_admin_only'), // Assuming logs are sensitive
  LogsController.listLogs
);
