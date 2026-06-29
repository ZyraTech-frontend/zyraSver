/**
 * Rate Limiter Middleware
 * Protects endpoints from abuse and brute-force attacks.
 */

import rateLimit from 'express-rate-limit';

/**
 * Auth endpoints (login, forgot-password)
 * Strict: 5 requests per minute per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many attempts. Please wait 1 minute before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Public form submissions (enrollment, job application, contact, partnership)
 * Medium: 10 requests per hour per IP
 */
export const formSubmissionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many submissions. Please try again in an hour.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API (authenticated users)
 * Relaxed: 100 requests per minute per user
 */
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
