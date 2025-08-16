import Joi from 'joi';

export const createConversationSchema = Joi.object({
  body: Joi.object({
    isGroup: Joi.boolean().required(),
    title: Joi.string().min(1).max(100).when('isGroup', {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    members: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  }),
});

export const conversationIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const getConversationsSchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    cursor: Joi.string().optional(),
  }),
});

export const updateConversationSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    title: Joi.string().min(1).max(100).optional(),
    avatarUrl: Joi.string().uri().optional(),
    settings: Joi.object({
      allowMemberAdd: Joi.boolean().optional(),
      allowMemberLeave: Joi.boolean().optional(),
    }).optional(),
  }),
});

export const addMembersSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    members: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  }),
});

export const removeMemberSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const assignRoleSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    role: Joi.string().valid('admin', 'moderator', 'member').required(),
  }),
});