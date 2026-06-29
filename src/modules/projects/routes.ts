// Projects Module - Route Definitions

import { Router } from 'express';
import { ProjectsController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadImage } from '../../shared/middleware/upload';

// ─── Public Project Routes ──────────────────────────────────────
const projectsRouter = Router();

projectsRouter.get('/', ProjectsController.listPublicProjects);
projectsRouter.get('/:slug', ProjectsController.getPublicProject);

export default projectsRouter;

// ─── Admin Project Routes (projects permission) ─────────────────
export const adminProjectsRouter = Router();

// Image Upload Helper
adminProjectsRouter.post(
  '/upload',
  authMiddleware,
  checkPermission('projects'),
  uploadImage.single('file'),
  ProjectsController.handleFileUpload
);

// Projects
adminProjectsRouter.get(
  '/',
  authMiddleware,
  checkPermission('projects'),
  ProjectsController.listAdminProjects
);
adminProjectsRouter.post(
  '/',
  authMiddleware,
  checkPermission('projects'),
  ProjectsController.createProject
);
adminProjectsRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('projects'),
  ProjectsController.getAdminProject
);
adminProjectsRouter.put(
  '/:id',
  authMiddleware,
  checkPermission('projects'),
  ProjectsController.updateProject
);
adminProjectsRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('projects'),
  ProjectsController.deleteProject
);
