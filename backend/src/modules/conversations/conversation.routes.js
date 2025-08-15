import { Router } from 'express';
import { z } from 'zod';
import * as conversationController from './conversation.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Validation schemas
const createConversationSchema = z.object({
  body: z.object({
    isGroup: z.boolean().default(false),
    title: z.string().min(1).max(100).optional(),
    members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  }),
});

const updateConversationSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(100).optional(),
    avatarUrl: z.string().url().optional(),
    settings: z.object({
      allowMemberAdd: z.boolean().optional(),
      allowMemberLeave: z.boolean().optional(),
      muteNotifications: z.boolean().optional(),
    }).optional(),
  }),
});

const addMembersSchema = z.object({
  body: z.object({
    members: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/)).min(1),
  }),
});

const assignRoleSchema = z.object({
  body: z.object({
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    role: z.enum(['member', 'moderator', 'admin']),
  }),
});

const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID'),
  }),
});

const memberIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid conversation ID'),
    userId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
  }),
});

const listSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).optional(),
    cursor: z.string().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Conversation CRUD
router.post('/', validate(createConversationSchema), conversationController.createConversation);
router.get('/', validate(listSchema), conversationController.getConversations);
router.get('/:id', validate(conversationIdSchema), conversationController.getConversation);
router.patch('/:id', validate(conversationIdSchema), validate(updateConversationSchema), conversationController.updateConversation);

// Member management
router.post('/:id/members', validate(conversationIdSchema), validate(addMembersSchema), conversationController.addMembers);
router.delete('/:id/members/:userId', validate(memberIdSchema), conversationController.removeMember);

// Role management
router.post('/:id/roles', validate(conversationIdSchema), validate(assignRoleSchema), conversationController.assignRole);

export default router;