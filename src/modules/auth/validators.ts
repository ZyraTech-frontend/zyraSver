/**
 * Authentication Module - Input Validators
 * Validates all incoming auth requests
 */

export class AuthValidators {
  /**
   * Validate login request
   */
  static validateLoginRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!body.email) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(body.email)) {
      errors.email = 'Invalid email format';
    }

    if (!body.password) {
      errors.password = 'Password is required';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate refresh token request
   */
  static validateRefreshTokenRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!body.refreshToken) {
      errors.refreshToken = 'Refresh token is required';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate forgot password request
   */
  static validateForgotPasswordRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!body.email) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(body.email)) {
      errors.email = 'Invalid email format';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate reset password request
   */
  static validateResetPasswordRequest(body: any): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (!body.token) {
      errors.token = 'Reset token is required';
    }

    if (!body.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = this.isValidPassword(body.newPassword);
      if (!passwordValidation.valid) {
        errors.newPassword = passwordValidation.message;
      }
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
   * Requirements: min 8 chars, uppercase, lowercase, number, special char
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
