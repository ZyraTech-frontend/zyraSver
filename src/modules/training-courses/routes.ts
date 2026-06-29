// Training Courses Module - Route Definitions

import { Router } from 'express';
import { TrainingCoursesController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';

const router = Router();

// Public routes — no auth
router.get('/', TrainingCoursesController.listPublicCourses);
router.get('/:id', TrainingCoursesController.getCourse);

// Admin routes — auth + training_courses permission
router.post(
  '/admin',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.createCourse
);
router.put(
  '/admin/:id',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.updateCourse
);
router.delete(
  '/admin/:id',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.deleteCourse
);

export default router;
