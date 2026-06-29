/**
 * Express Request Type Augmentation
 * Extends Express Request to include the authenticated user payload.
 * This eliminates all (req as any).user casts throughout the codebase.
 */

import { TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export {};
