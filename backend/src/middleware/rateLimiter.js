import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';

export function createRateLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100, // requests per window
    message: {
      success: false,
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => config.isTest, // Skip rate limiting in tests
    ...options,
  });
}

// Default rate limiter
export const defaultLimiter = createRateLimiter();

// Strict rate limiter for auth endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
});

// Lenient rate limiter for file uploads
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
});