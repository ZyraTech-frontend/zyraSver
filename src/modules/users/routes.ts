// User Management Module - Route Definitions
// All routes are Super Admin Only

import { Router } from 'express';
import { UserController } from './controller';
import { authMiddleware } from '../../shared/middleware/auth';
import { superAdminOnly } from '../../shared/middleware/permission';

const router = Router();

// All user management routes require: auth + super_admin role
router.use(authMiddleware);
router.use(superAdminOnly);

// GET  /api/admin/users          — list all admins (paginated)
router.get('/', UserController.listUsers);

// GET  /api/admin/users/:userId  — get single admin
router.get('/:userId', UserController.getUser);

// POST /api/admin/users          — create admin user
router.post('/', UserController.createUser);

// PUT  /api/admin/users/:userId  — update admin details
router.put('/:userId', UserController.updateUser);

// PUT  /api/admin/users/:userId/permissions — update permissions
router.put('/:userId/permissions', UserController.updatePermissions);

// PUT  /api/admin/users/:userId/activate
router.put('/:userId/activate', UserController.activateUser);

// PUT  /api/admin/users/:userId/deactivate
router.put('/:userId/deactivate', UserController.deactivateUser);

// DELETE /api/admin/users/:userId
router.delete('/:userId', UserController.deleteUser);

export default router;
