export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation Error');
    this.name = 'ValidationError';
  }
}

export const Validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Password must contain uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Password must contain lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain number' };
    }
    return { valid: true };
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== '';
  },

  minLength: (value: string, length: number): boolean => {
    return value.length >= length;
  },

  maxLength: (value: string, length: number): boolean => {
    return value.length <= length;
  },

  isNumber: (value: any): boolean => {
    return !isNaN(value) && !isNaN(parseFloat(value));
  },

  isPositive: (value: number): boolean => {
    return value > 0;
  },

  isEnum: (value: any, enumValues: any[]): boolean => {
    return enumValues.includes(value);
  },
};

export const validateEmail = (email: string, errors: Record<string, string>): Record<string, string> => {
  if (!Validators.required(email)) {
    errors.email = 'Email is required';
  } else if (!Validators.email(email)) {
    errors.email = 'Invalid email format';
  }
  return errors;
};

export const validatePassword = (password: string, errors: Record<string, string>): Record<string, string> => {
  if (!Validators.required(password)) {
    errors.password = 'Password is required';
  } else {
    const validation = Validators.password(password);
    if (!validation.valid) {
      errors.password = validation.message || 'Invalid password';
    }
  }
  return errors;
};

export const validateName = (name: string, fieldName: string = 'Name', errors: Record<string, string>): Record<string, string> => {
  if (!Validators.required(name)) {
    errors[fieldName.toLowerCase()] = `${fieldName} is required`;
  } else if (Validators.minLength(name, 2) === false) {
    errors[fieldName.toLowerCase()] = `${fieldName} must be at least 2 characters`;
  } else if (Validators.maxLength(name, 100) === false) {
    errors[fieldName.toLowerCase()] = `${fieldName} must not exceed 100 characters`;
  }
  return errors;
};
