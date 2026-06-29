// User Management Module - Business Logic Service
// Handles admin user CRUD, permissions, activate/deactivate
// Super Admin Only

import { prisma } from '../../shared/config/database';
import { PasswordService } from '../../shared/utils/password';
import { UserResponse, UserError, CreateUserInput, UpdateUserInput } from './types';

export class UserService {
  // ─── List All Admins ─────────────────────────────────────────
  static async listUsers(
    page: number = 1,
    limit: number = 10,
    role?: string,
    status?: string
  ): Promise<{
    users: UserResponse[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    limit = Math.min(Math.max(limit, 1), 100);
    page = Math.max(page, 1);

    const where: any = {};
    if (role) where.role = role;
    if (status) where.accountStatus = status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      users: users.map(this.formatUserResponse),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get Single Admin ─────────────────────────────────────────
  static async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');
    return this.formatUserResponse(user);
  }

  // ─── Create Admin User (Super Admin Only) ─────────────────────
  static async createUser(input: CreateUserInput): Promise<UserResponse> {
    // Only 'admin' can be created via API
    if (input.role !== 'admin') {
      throw new UserError(400, 'Only admin role can be created via API');
    }

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) throw new UserError(409, 'An account with this email already exists');

    const hashedPassword = await PasswordService.hash(input.password);

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: 'admin',
        department: input.department,
        permissions: input.permissions || [],
        mustChangePassword: input.mustChangePassword ?? true,
        accountStatus: 'pending_password',
        kycStatus: 'not_submitted',
      },
    });

    await this.logActivity('CREATE_ADMIN', 'User', user.id, 'success');
    return this.formatUserResponse(user);
  }

  // ─── Update Admin ─────────────────────────────────────────────
  static async updateUser(userId: string, input: UpdateUserInput): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');

    const updateData: any = {};
    if (input.name) updateData.name = input.name;
    if (input.department !== undefined) updateData.department = input.department;
    if (input.avatar !== undefined) updateData.avatar = input.avatar;

    const updatedUser = await prisma.user.update({ where: { id: userId }, data: updateData });
    await this.logActivity('UPDATE_ADMIN', 'User', userId, 'success');
    return this.formatUserResponse(updatedUser);
  }

  // ─── Update Permissions ───────────────────────────────────────
  static async updatePermissions(userId: string, permissions: string[]): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');
    if (user.role === 'super_admin') throw new UserError(400, 'Cannot modify super admin permissions');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
    });

    await this.logActivity('UPDATE_PERMISSIONS', 'User', userId, 'success');
    return this.formatUserResponse(updatedUser);
  }

  // ─── Activate Admin ───────────────────────────────────────────
  static async activateUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'active' },
    });

    await this.logActivity('ACTIVATE_ADMIN', 'User', userId, 'success');
    return this.formatUserResponse(updatedUser);
  }

  // ─── Deactivate Admin ─────────────────────────────────────────
  static async deactivateUser(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');
    if (user.role === 'super_admin') throw new UserError(400, 'Cannot deactivate super admin');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { accountStatus: 'deactivated' },
    });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId } });

    await this.logActivity('DEACTIVATE_ADMIN', 'User', userId, 'success');
    return this.formatUserResponse(updatedUser);
  }

  // ─── Delete Admin ─────────────────────────────────────────────
  static async deleteUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UserError(404, 'User not found');
    if (user.role === 'super_admin') throw new UserError(400, 'Cannot delete super admin');

    await prisma.user.delete({ where: { id: userId } });
    await this.logActivity('DELETE_ADMIN', 'User', userId, 'success');
  }

  // ─── Format User Response ─────────────────────────────────────
  static formatUserResponse(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department ?? null,
      avatar: user.avatar ?? null,
      permissions: user.permissions || [],
      accountStatus: user.accountStatus,
      kycStatus: user.kycStatus,
      mustChangePassword: user.mustChangePassword,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      createdAt: user.createdAt.toISOString(),
    };
  }

  // ─── Activity Logger ──────────────────────────────────────────
  private static async logActivity(
    action: string,
    entity: string,
    entityId: string,
    status: 'success' | 'failure',
    changes?: string
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: { action, entity, entityId, status, changes },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
