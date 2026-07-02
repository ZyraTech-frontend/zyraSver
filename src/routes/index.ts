// ============================================================
// CENTRAL API ROUTE REGISTRY
// ALL API endpoints are registered here.
// ============================================================
//
//  /api/auth/*                   → Authentication
//  /api/admin/users/*            → User Management (super_admin only)
//  /api/training-courses/*       → Public course listings
//  /api/training/applications    → Student enrollment form (public)
//  /api/admin/training-courses/* → Admin course management
//  /api/admin/enrollments/*      → Admin enrollment management
//  /api/settings/public          → Public site settings
//  /api/admin/settings           → Admin settings management
//  /api/jobs/*                   → Public job listings + applications
//  /api/admin/jobs/*             → Admin job management
//  /api/partnerships/applications → Public partnership form
//  /api/admin/partnerships/*     → Admin partnership management
//  /api/contact/inquiries        → Public contact form
//  /api/admin/contact-inquiries/* → Admin contact management
//  /api/newsletter/subscribe     → Public newsletter signup
//  /api/admin/newsletter/*       → Admin newsletter management
//  /api/admin/transactions/*     → Payment transactions
//  /api/blog/articles/*          → Public blog
//  /api/admin/blog/articles/*    → Admin blog management
//  /api/gallery/*                → Public gallery
//  /api/admin/gallery/*          → Admin gallery management
//  /api/projects/*               → Public projects
//  /api/admin/projects/*         → Admin projects
//  /api/faq/*                    → Public FAQs
//  /api/admin/faq/*              → Admin FAQ management
//  /api/testimonials/*           → Public testimonials
//  /api/admin/testimonials/*     → Admin testimonials
//  /api/admin/content/*          → CMS content management
//  /api/admin/messages/*         → Admin messages inbox
//  /api/admin/impact-stories/*   → Admin impact stories
//  /api/admin/activity-logs/*    → Activity logs
// ============================================================

import { Router } from 'express';

// ─── Implemented Modules ──────────────────────────────────────
import { checkMaintenanceMode } from '../shared/middleware/maintenance';
import authRoutes from '../modules/auth/routes';
import usersRoutes from '../modules/users/routes';
import trainingCoursesRoutes from '../modules/training-courses/routes';
import trainingApplicationsRoutes, {
  enrollmentsRouter,
} from '../modules/training-applications/routes';

const router = Router();

// ─── AUTH ─────────────────────────────────────────────────────
// POST /api/auth/login
// POST /api/auth/refresh
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
// GET  /api/auth/me                  (protected)
// POST /api/auth/logout              (protected)
// POST /api/auth/change-password     (protected)
// POST /api/auth/submit-kyc          (protected)
router.use('/auth', authRoutes);

// ─── USER MANAGEMENT (Super Admin Only) ──────────────────────
// GET    /api/admin/users
// GET    /api/admin/users/:userId
// POST   /api/admin/users
// PUT    /api/admin/users/:userId
// PUT    /api/admin/users/:userId/permissions
// PUT    /api/admin/users/:userId/activate
// PUT    /api/admin/users/:userId/deactivate
// DELETE /api/admin/users/:userId
router.use('/admin/users', usersRoutes);

// ─── PUBLIC TRAINING COURSES ──────────────────────────────────
// GET /api/training-courses
// GET /api/training-courses/:id
router.use('/training-courses', checkMaintenanceMode, trainingCoursesRoutes);

// ─── ADMIN TRAINING COURSES ───────────────────────────────────
// GET    /api/admin/training-courses       (training_courses permission)
// POST   /api/admin/training-courses
// PUT    /api/admin/training-courses/:id
// DELETE /api/admin/training-courses/:id
import { TrainingCoursesController } from '../modules/training-courses/controller';
import { authMiddleware } from '../shared/middleware/auth';
import { checkPermission } from '../shared/middleware/permission';

router.get(
  '/admin/training-courses',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.listCourses
);
router.post(
  '/admin/training-courses',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.createCourse
);
router.put(
  '/admin/training-courses/:id',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.updateCourse
);
router.delete(
  '/admin/training-courses/:id',
  authMiddleware,
  checkPermission('training_courses'),
  TrainingCoursesController.deleteCourse
);

// ─── TRAINING APPLICATIONS (Public Student Form) ──────────────
// POST /api/training/applications
router.use('/training/applications', checkMaintenanceMode, trainingApplicationsRoutes);

// ─── ADMIN ENROLLMENTS ────────────────────────────────────────
// GET /api/admin/enrollments
// GET /api/admin/enrollments/:id
// PUT /api/admin/enrollments/:id/status
router.use('/admin/enrollments', enrollmentsRouter);

// ─── UPCOMING MODULES (to be implemented) ─────────────────────
// Each will be uncommented as they are built:
//
// Payments
import paymentsRoutes, { adminTransactionsRouter } from '../modules/payments/routes';
router.use('/payments', checkMaintenanceMode, paymentsRoutes);
router.use('/admin/transactions', adminTransactionsRouter);
//
// Jobs
import jobsRoutes, { adminJobsRouter, adminJobApplicationsRouter } from '../modules/jobs/routes';
router.use('/jobs', checkMaintenanceMode, jobsRoutes);
router.use('/admin/jobs', adminJobsRouter);
router.use('/admin/job-applications', adminJobApplicationsRouter);
//
// Partnerships
// import partnershipApplicationsRoutes from '../modules/partnerships/routes';
// router.use('/partnerships/applications', partnershipApplicationsRoutes);
//
// Contact
// import contactRoutes from '../modules/contact/routes';
// router.use('/contact/inquiries', contactRoutes);
//
// Newsletter
// import newsletterRoutes from '../modules/newsletter/routes';
// router.use('/newsletter/subscribe', newsletterRoutes);
//
// Settings
import settingsRoutes, { adminSettingsRouter } from '../modules/settings/routes';
router.use('/settings/public', settingsRoutes);
router.use('/admin/settings', adminSettingsRouter);
//
// Blog
import blogRoutes, { adminBlogRouter } from '../modules/blog/routes';
router.use('/blog', checkMaintenanceMode, blogRoutes);
router.use('/admin/blog', adminBlogRouter);
//
// Gallery
import galleryRoutes, { adminGalleryRouter } from '../modules/gallery/routes';
router.use('/gallery', checkMaintenanceMode, galleryRoutes);
router.use('/admin/gallery', adminGalleryRouter);
//
// CMS
import contentRoutes, { adminContentRouter } from '../modules/content/routes';
router.use('/content', checkMaintenanceMode, contentRoutes);
router.use('/admin/content', adminContentRouter);

// Projects
import projectsRoutes, { adminProjectsRouter } from '../modules/projects/routes';
router.use('/projects', checkMaintenanceMode, projectsRoutes);
router.use('/admin/projects', adminProjectsRouter);

// FAQ
import faqRoutes, { adminFaqRouter } from '../modules/faq/routes';
router.use('/faq', checkMaintenanceMode, faqRoutes);
router.use('/admin/faq', adminFaqRouter);

// Testimonials
import testimonialsRoutes, { adminTestimonialsRouter } from '../modules/testimonials/routes';
router.use('/testimonials', checkMaintenanceMode, testimonialsRoutes);
router.use('/admin/testimonials', adminTestimonialsRouter);

// Newsletter
import newsletterRoutes, { adminNewsletterRouter } from '../modules/newsletter/routes';
router.use('/newsletter', checkMaintenanceMode, newsletterRoutes);
router.use('/admin/newsletter', adminNewsletterRouter);

// Partnerships
import partnershipsRoutes, { adminPartnershipsRouter } from '../modules/partnerships/routes';
router.use('/partnerships', checkMaintenanceMode, partnershipsRoutes);
router.use('/admin/partnerships', adminPartnershipsRouter);

// Contact
import contactRoutes, { adminContactRouter } from '../modules/contact/routes';
router.use('/contact', checkMaintenanceMode, contactRoutes);
router.use('/admin/contact', adminContactRouter);

// Messages
import messagesRoutes, { adminMessagesRouter } from '../modules/messages/routes';
router.use('/messages', checkMaintenanceMode, messagesRoutes);
router.use('/admin/messages', adminMessagesRouter);

// Impact
import impactRoutes, { adminImpactRouter } from '../modules/impact/routes';
router.use('/impact', checkMaintenanceMode, impactRoutes);
router.use('/admin/impact', adminImpactRouter);

// Logs
import { adminLogsRouter } from '../modules/logs/routes';
router.use('/admin/logs', adminLogsRouter);

export default router;
