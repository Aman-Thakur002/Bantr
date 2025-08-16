import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    about: Joi.string().max(500).optional(),
    avatarUrl: Joi.string().uri().optional(),
    settings: Joi.object({
      readReceipts: Joi.boolean().optional(),
      lastSeenVisible: Joi.boolean().optional(),
      theme: Joi.string().valid('light', 'dark', 'auto').optional(),
    }).optional(),
  }),
});

export const searchSchema = Joi.object({
  query: Joi.object({
    q: Joi.string().min(1).required(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
});

export const userIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const statusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string().valid('online', 'offline', 'away').required(),
  }),
});