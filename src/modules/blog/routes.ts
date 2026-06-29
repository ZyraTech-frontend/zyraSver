// Blog Module - Route Definitions

import { Router } from 'express';
import { BlogController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { checkPermission } from '../../shared/middleware/permission';
import { uploadImage } from '../../shared/middleware/upload';

// ─── Public Blog Routes ─────────────────────────────────────────
const blogRouter = Router();

blogRouter.get('/articles', BlogController.listPublicArticles);
blogRouter.get('/articles/:slug', BlogController.getPublicArticle);

export default blogRouter;

// ─── Admin Blog Routes (blog_articles permission) ───────────────
export const adminBlogRouter = Router();

// Image Upload Helper
adminBlogRouter.post(
  '/upload',
  authMiddleware,
  checkPermission('blog_articles'),
  uploadImage.single('file'),
  BlogController.handleFileUpload
);

// Articles
adminBlogRouter.get(
  '/articles',
  authMiddleware,
  checkPermission('blog_articles'),
  BlogController.listAdminArticles
);
adminBlogRouter.post(
  '/articles',
  authMiddleware,
  checkPermission('blog_articles'),
  BlogController.createArticle
);
adminBlogRouter.get(
  '/articles/:id',
  authMiddleware,
  checkPermission('blog_articles'),
  BlogController.getAdminArticle
);
adminBlogRouter.put(
  '/articles/:id',
  authMiddleware,
  checkPermission('blog_articles'),
  BlogController.updateArticle
);
adminBlogRouter.delete(
  '/articles/:id',
  authMiddleware,
  checkPermission('blog_articles'),
  BlogController.deleteArticle
);
