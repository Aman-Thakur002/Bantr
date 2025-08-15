import { Router } from 'express';
import { z } from 'zod';
import * as messageController from './message.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    text: z.string().min(1).max(4000).optional(),
    attachments: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).optional(),
    replyTo: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    scheduledAt: z.string().datetime().optional(),
  }).refine(data => data.text || (data.attachments && data.attachments.length > 0), {
    message: 'Message must have text or attachments',
  }),
});

const editMessageSchema = z.object({
  body: z.object({
    text: z.string().min(1).max(4000),
  }),
});

const deleteMessageSchema = z.object({
  body: z.object({
    deleteForEveryone: z.boolean().default(false),
  }),
});

const reactSchema = z.object({
  body: z.object({
    emoji: z.string().min(1).max(10),
  }),
});

const markReadSchema = z.object({
  body: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    messageIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  }),
});

const messageIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid message ID'),
  }),
});

const conversationMessagesSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID'),
  }),
  query: z.object({
    limit: z.string().transform(Number).optional(),
    cursor: z.string().optional(),
    search: z.string().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Message CRUD
router.post('/', validate(sendMessageSchema), messageController.sendMessage);
router.patch('/:id', validate(messageIdSchema), validate(editMessageSchema), messageController.editMessage);
router.delete('/:id', validate(messageIdSchema), validate(deleteMessageSchema), messageController.deleteMessage);

// Message interactions
router.post('/:id/react', validate(messageIdSchema), validate(reactSchema), messageController.reactToMessage);
router.delete('/:id/react', validate(messageIdSchema), validate(reactSchema), messageController.removeReaction);

// Read receipts
router.post('/read', validate(markReadSchema), messageController.markAsRead);

// Scheduled messages
router.get('/scheduled', messageController.getScheduledMessages);

// Get conversation messages
router.get('/conversations/:id', validate(conversationMessagesSchema), messageController.getMessages);

export default router;