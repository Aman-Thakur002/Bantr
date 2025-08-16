import { Router } from 'express';
import Joi from 'joi';
import { suggestReplyController, summarizeConversationController, translateTextController, moderateTextController } from './ai.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { requirePermission } from '../../middleware/rbac.js';

const router = Router();

// Validation schemas
const suggestReplySchema = Joi.object({
  body: Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    messageCount: Joi.number().min(1).max(20).optional(),
  }),
});

const summarizeSchema = Joi.object({
  body: Joi.object({
    conversationId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    messageCount: Joi.number().min(1).max(100).optional(),
  }),
});

const translateSchema = Joi.object({
  body: Joi.object({
    text: Joi.string().min(1).max(4000),
    targetLang: Joi.string().min(2).max(10),
  }),
});

const moderateSchema = Joi.object({
  body: Joi.object({
    text: Joi.string().min(1).max(4000),
  }),
});

// All routes require authentication and AI permissions
router.use(authenticate);
router.use(requirePermission('ai:use'));

// AI features
router.post('/suggest', validate(suggestReplySchema), suggestReplyController);
router.post('/summarize', validate(summarizeSchema), summarizeConversationController);
router.post('/translate', validate(translateSchema), translateTextController);

// Moderation (requires additional permission)
router.post('/moderate', requirePermission('ai:moderate'), validate(moderateSchema), moderateTextController);

export default router;