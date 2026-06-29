/**
 * User Management Module - Input Validators
 * Validates all incoming user management requests
 */

export class UserValidators {
  /**
   * Validate create admin user request
   * Frontend sends: name, email, password, role, department, permissions, mustChangePassword
   */
  static validateCreateUserRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!body.name || typeof body.name !== 'string') {
      errors.name = 'Name is required';
    }

    if (!body.email) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(body.email)) {
      errors.email = 'Invalid email format';
    }

    if (!body.password) {
      errors.password = 'Password is required';
    } else {
      const passwordCheck = this.isValidPassword(body.password);
      if (!passwordCheck.valid) {
        errors.password = passwordCheck.message;
      }
    }

    // Only 'admin' role can be created via API (super_admin cannot be created via API)
    if (!body.role) {
      errors.role = 'Role is required';
    } else if (body.role !== 'admin') {
      errors.role = 'Only admin role can be created via API';
    }

    if (!body.permissions || !Array.isArray(body.permissions) || body.permissions.length === 0) {
      errors.permissions = 'At least one permission is required';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate update user request (partial update)
   */
  static validateUpdateUserRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (body.email && !this.isValidEmail(body.email)) {
      errors.email = 'Invalid email format';
    }

    if (body.name !== undefined && typeof body.name !== 'string') {
      errors.name = 'Name must be a string';
    }

    if (body.department !== undefined && typeof body.department !== 'string') {
      errors.department = 'Department must be a string';
    }

    if (body.permissions !== undefined && !Array.isArray(body.permissions)) {
      errors.permissions = 'Permissions must be an array';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private static isValidPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
    }
    return { valid: true, message: 'Password is valid' };
  }
}
