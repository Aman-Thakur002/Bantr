import { Router } from 'express';
import * as userController from './user.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  updateProfileSchema,
  searchSchema,
  userIdSchema,
  statusSchema,
} from './user.validation.js';

const router = Router();

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