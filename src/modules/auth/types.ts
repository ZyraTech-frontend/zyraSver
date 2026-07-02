// Authentication Module - Type Definitions

// ─── Requests ────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  department?: string;
}

export interface UpdateNotificationsRequest {
  notificationPreferences: Record<string, boolean>;
}

export interface Verify2FARequest {
  token: string;
}

// ─── Responses (match frontend exactly) ──────────────────────

export interface UserResponse {
  id: string;
  name: string; // Deprecated, but kept for compatibility
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  email: string;
  role: string;
  department?: string | null;
  avatar?: string | null;
  permissions: string[];
  twoFactorEnabled: boolean;
  notificationPreferences?: any;
  accountStatus: string;
  kycStatus: string;
  mustChangePassword: boolean;
  lastLogin?: string | null;
}

export interface LoginResponse {
  token?: string;
  user?: UserResponse;
  requires2FA?: boolean;
  tempToken?: string;
}

// ─── Service Types ────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

// ─── Error Types ──────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AuthError';
  }
}
