// Gallery Module - Route Definitions

import { Router } from 'express';
import { GalleryController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadImage } from '../../shared/middleware/upload';

// ─── Public Gallery Routes ──────────────────────────────────────
const galleryRouter = Router();

galleryRouter.get('/albums', GalleryController.listPublicAlbums);
galleryRouter.get('/albums/:id', GalleryController.getPublicAlbum);

export default galleryRouter;

// ─── Admin Gallery Routes (gallery permission) ──────────────────
export const adminGalleryRouter = Router();

// Image Upload Helper
adminGalleryRouter.post(
  '/upload',
  authMiddleware,
  checkPermission('gallery'),
  uploadImage.single('file'),
  GalleryController.handleFileUpload
);

// Albums
adminGalleryRouter.get(
  '/albums',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.listAdminAlbums
);
adminGalleryRouter.post(
  '/albums',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.createAlbum
);
adminGalleryRouter.get(
  '/albums/:id',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.getAdminAlbum
);
adminGalleryRouter.put(
  '/albums/:id',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.updateAlbum
);
adminGalleryRouter.delete(
  '/albums/:id',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.deleteAlbum
);

// Media
adminGalleryRouter.post(
  '/media',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.addMedia
);
adminGalleryRouter.put(
  '/albums/:id/media/reorder',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.reorderMedia
);
adminGalleryRouter.put(
  '/media/:mediaId',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.updateMedia
);
adminGalleryRouter.delete(
  '/media/:mediaId',
  authMiddleware,
  checkPermission('gallery'),
  GalleryController.deleteMedia
);
