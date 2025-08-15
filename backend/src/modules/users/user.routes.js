import { Router } from 'express';
import { z } from 'zod';
import * as userController from './user.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Validation schemas
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    about: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional(),
    settings: z.object({
      readReceipts: z.boolean().optional(),
      lastSeenVisible: z.boolean().optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
    }).optional(),
  }),
});

const searchSchema = z.object({
  query: z.object({
    q: z.string().min(1),
    limit: z.string().transform(Number).optional(),
  }),
});

const userIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['online', 'offline', 'away']),
  }),
});

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/me', userController.getMe);
router.patch('/me', validate(updateProfileSchema), userController.updateMe);
router.patch('/me/status', validate(statusSchema), userController.updateStatus);

// Search routes
router.get('/search', validate(searchSchema), userController.searchUsers);

// Blocking routes
router.get('/blocked', userController.getBlockedUsers);
router.post('/block/:id', validate(userIdSchema), userController.blockUser);
router.delete('/block/:id', validate(userIdSchema), userController.unblockUser);

export default router;