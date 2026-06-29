// Testimonials Module - Route Definitions

import { Router } from 'express';
import { TestimonialController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadImage } from '../../shared/middleware/upload';

// ─── Public Testimonial Routes ──────────────────────────────────
const testimonialsRouter = Router();

testimonialsRouter.get('/', TestimonialController.listPublicTestimonials);

export default testimonialsRouter;

// ─── Admin Testimonial Routes (content permission) ──────────────
export const adminTestimonialsRouter = Router();

// Upload Helper
adminTestimonialsRouter.post(
  '/upload',
  authMiddleware,
  checkPermission('content'),
  uploadImage.single('file'),
  TestimonialController.handleFileUpload
);

// CRUD
adminTestimonialsRouter.get(
  '/',
  authMiddleware,
  checkPermission('content'),
  TestimonialController.listAdminTestimonials
);
adminTestimonialsRouter.post(
  '/',
  authMiddleware,
  checkPermission('content'),
  TestimonialController.createTestimonial
);
adminTestimonialsRouter.get(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  TestimonialController.getAdminTestimonial
);
adminTestimonialsRouter.put(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  TestimonialController.updateTestimonial
);
adminTestimonialsRouter.delete(
  '/:id',
  authMiddleware,
  checkPermission('content'),
  TestimonialController.deleteTestimonial
);
