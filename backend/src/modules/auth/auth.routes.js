import { Router } from 'express';
import { z } from 'zod';
import * as authController from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100),
    email: z.string().email().optional(),
    phone: z.string().min(10).max(15),
    password: z.string().min(6).max(100),
  }),
});

const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1), // email or phone
    password: z.string().min(1),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    identifier: z.string().min(1), // email or phone
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    newPassword: z.string().min(6).max(100),
  }),
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/password/forgot', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/password/reset', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/password/change', authenticate, validate(changePasswordSchema), authController.changePassword);

export default router;