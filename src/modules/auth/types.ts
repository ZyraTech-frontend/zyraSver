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

// ─── Responses (match frontend exactly) ──────────────────────

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string | null;
  avatar?: string | null;
  permissions: string[];
  accountStatus: string;
  kycStatus: string;
  mustChangePassword: boolean;
  lastLogin?: string | null;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
}

// ─── Service Types ────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
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
