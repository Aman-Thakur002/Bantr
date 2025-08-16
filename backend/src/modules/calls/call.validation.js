import Joi from 'joi';

export const initiateCallSchema = Joi.object({
  body: Joi.object({
    conversationId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    type: Joi.string().valid('audio', 'video').required(),
  }),
});

export const callIdSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
});

export const getCallHistorySchema = Joi.object({
  query: Joi.object({
    limit: Joi.number().integer().min(1).max(100).optional(),
    cursor: Joi.string().optional(),
  }),
});

export const sendOfferSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    offer: Joi.object().required(),
  }),
});

export const sendAnswerSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    answer: Joi.object().required(),
  }),
});

export const sendIceCandidateSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  }),
  body: Joi.object({
    candidate: Joi.object().required(),
  }),
});