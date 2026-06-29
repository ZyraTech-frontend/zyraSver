// User Management Module - Type Definitions
// Matches the new schema and frontend API documentation exactly

// ============================================
// REQUEST TYPES
// ============================================

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin'; // Only 'admin' can be created via API
  department?: string;
  permissions: string[];
  mustChangePassword?: boolean;
}

export interface UpdateAdminRequest {
  name?: string;
  department?: string;
  avatar?: string;
}

export interface UpdatePermissionsRequest {
  permissions: string[];
}

// ============================================
// RESPONSE TYPES (matches frontend exactly)
// ============================================

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
  createdAt: string;
}

// ============================================
// SERVICE TYPES
// ============================================

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'admin';
  department?: string;
  permissions: string[];
  mustChangePassword?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  department?: string;
  avatar?: string;
}

// ============================================
// ERROR TYPES
// ============================================

export class UserError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'UserError';
  }
}
