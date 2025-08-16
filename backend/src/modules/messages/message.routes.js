import { Router } from 'express';
import * as messageController from './message.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  sendMessageSchema,
  getMessagesSchema,
  messageIdSchema,
  editMessageSchema,
  deleteMessageSchema,
  reactToMessageSchema,
  markAsReadSchema,
} from './message.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Message CRUD
router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.patch('/:id', validate(editMessageSchema), messageController.editMessage);
router.delete('/:id', validate(deleteMessageSchema), messageController.deleteMessage);

// Message interactions
router.post('/:id/react', validate(reactToMessageSchema), messageController.reactToMessage);
router.delete('/:id/react', validate(reactToMessageSchema), messageController.removeReaction);

// Read receipts
router.post('/read', validate(markAsReadSchema), messageController.markAsRead);

// Scheduled messages
router.get('/scheduled', messageController.getScheduledMessages);

// Get conversation messages
router.get('/conversations/:id', validate(getMessagesSchema), messageController.getMessages);

export default router;