import { Router } from 'express';
import * as conversationController from './conversation.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  createConversationSchema,
  conversationIdSchema,
  getConversationsSchema,
  updateConversationSchema,
  addMembersSchema,
  removeMemberSchema,
  assignRoleSchema,
} from './conversation.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Conversation CRUD
router.post('/', validate(createConversationSchema), conversationController.createConversation);
router.get('/', validate(getConversationsSchema), conversationController.getConversations);
router.get('/:id', validate(conversationIdSchema), conversationController.getConversation);
router.patch('/:id', validate(updateConversationSchema), conversationController.updateConversation);

// Member management
router.post('/:id/members', validate(addMembersSchema), conversationController.addMembers);
router.delete('/:id/members/:userId', validate(removeMemberSchema), conversationController.removeMember);

// Role management
router.post('/:id/roles', validate(assignRoleSchema), conversationController.assignRole);

export default router;