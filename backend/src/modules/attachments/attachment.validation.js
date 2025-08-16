import Joi from 'joi';

export const attachmentIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const getUserAttachmentsSchema = Joi.object({
  query: Joi.object({
    kind: Joi.string().valid('image', 'video', 'audio', 'file').optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    cursor: Joi.string().optional(),
  }),
});