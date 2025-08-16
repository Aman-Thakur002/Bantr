import Joi from 'joi';

export const sendMessageSchema = Joi.object({
  body: Joi.object({
    conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    text: Joi.string().min(1).max(5000).optional(),
    attachments: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(),
    replyTo: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    scheduledAt: Joi.date().iso().optional(),
  }),
});

export const getMessagesSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    cursor: Joi.string().optional(),
    search: Joi.string().optional(),
  }),
});

export const messageIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const editMessageSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    text: Joi.string().min(1).max(5000).required(),
  }),
});

export const deleteMessageSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    deleteForEveryone: Joi.boolean().optional(),
  }),
});

export const reactToMessageSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    emoji: Joi.string().min(1).max(10).required(),
  }),
});

export const markAsReadSchema = Joi.object({
  body: Joi.object({
    messageIds: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).required(),
    conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});