// Authentication Module - Business Logic Service

import { prisma } from '../../shared/config/database';
import { PasswordService } from '../../shared/utils/password';
import { JwtService } from '../../shared/utils/jwt';
import { LoginInput, UserResponse, LoginResponse, AuthError } from './types';

export class AuthService {
  // ─── Login ────────────────────────────────────────────────────
  static async login(input: LoginInput): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      throw new AuthError(401, 'Invalid email or password. Please check your credentials and try again.', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await PasswordService.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new AuthError(401, 'Invalid email or password. Please check your credentials and try again.', 'INVALID_CREDENTIALS');
    }

    // Block deactivated accounts
    if (user.accountStatus === 'deactivated') {
      throw new AuthError(403, 'Your account has been deactivated. Please contact your administrator.', 'ACCOUNT_DEACTIVATED');
    }

    // Generate single token (frontend stores as 'token' in localStorage)
    const token = JwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    const refreshToken = JwtService.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    // Create / update session
    await prisma.session.upsert({
      where: { refreshToken: refreshToken },
      create: {
        userId: user.id,
        token,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      update: {
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update lastLogin
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    await this.logActivity(user.id, 'LOGIN', 'User', user.id, 'success');

    return {
      token,
      user: this.formatUserResponse(user),
    };
  }

  // ─── Refresh Token ────────────────────────────────────────────
  static async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const payload = JwtService.verifyRefreshToken(refreshToken);
    if (!payload) throw new AuthError(401, 'Invalid or expired refresh token', 'TOKEN_EXPIRED');

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) throw new AuthError(401, 'User not found', 'UNAUTHORIZED');
    if (user.accountStatus === 'deactivated') {
      throw new AuthError(403, 'Account deactivated', 'ACCOUNT_DEACTIVATED');
    }

    const newToken = JwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    });

    // Update session
    await prisma.session.updateMany({
      where: { userId: user.id },
      data: { token: newToken },
    });

    return { token: newToken };
  }

  // ─── Get Current User ─────────────────────────────────────────
  static async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError(404, 'User not found', 'NOT_FOUND');
    return this.formatUserResponse(user);
  }

  // ─── Logout ───────────────────────────────────────────────────
  static async logout(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } });
    await this.logActivity(userId, 'LOGOUT', 'User', userId, 'success');
  }

  // ─── Change Password ──────────────────────────────────────────
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError(404, 'User not found', 'NOT_FOUND');

    const isCurrentValid = await PasswordService.compare(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new AuthError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
    }

    const hashedNewPassword = await PasswordService.hash(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        mustChangePassword: false,
        accountStatus: user.accountStatus === 'pending_password' ? 'active' : user.accountStatus,
      },
    });

    await this.logActivity(userId, 'CHANGE_PASSWORD', 'User', userId, 'success');
    return this.formatUserResponse(updatedUser);
  }

  // ─── Submit KYC ───────────────────────────────────────────────
  static async submitKyc(
    userId: string,
    documentUrl: string,
    documentType: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AuthError(404, 'User not found', 'NOT_FOUND');

    // Upsert KYC record
    await prisma.kYC.upsert({
      where: { userId },
      create: { userId, documentUrl, documentType, status: 'pending' },
      update: { documentUrl, documentType, status: 'pending' },
    });

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: 'pending' },
    });

    await this.logActivity(userId, 'SUBMIT_KYC', 'KYC', userId, 'success');
  }

  // ─── Forgot Password ──────────────────────────────────────────
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Don't reveal if email exists

    // TODO: Generate reset token and send email via SendGrid/Mailgun
    await this.logActivity(user.id, 'FORGOT_PASSWORD', 'User', user.id, 'success');
  }

  // ─── Reset Password ───────────────────────────────────────────
  static async resetPassword(_token: string, _newPassword: string): Promise<void> {
    // TODO: Implement after settings module (needs email provider config)
    throw new AuthError(501, 'Password reset via email is not yet configured', 'NOT_IMPLEMENTED');
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
    };
  }

  // ─── Activity Logger ──────────────────────────────────────────
  private static async logActivity(
    userId: string,
    action: string,
    entity: string,
    entityId: string,
    status: 'success' | 'failure'
  ): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: { userId, action, entity, entityId, status },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }
}
