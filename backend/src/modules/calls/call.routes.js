import { Router } from 'express';
import { z } from 'zod';
import * as callController from './call.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Validation schemas
const initiateCallSchema = z.object({
  body: z.object({
    conversationId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    type: z.enum(['voice', 'video']),
  }),
});

const callIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid call ID'),
  }),
});

const offerSchema = z.object({
  body: z.object({
    offer: z.object({
      type: z.string(),
      sdp: z.string(),
    }),
  }),
});

const answerSchema = z.object({
  body: z.object({
    answer: z.object({
      type: z.string(),
      sdp: z.string(),
    }),
  }),
});

const candidateSchema = z.object({
  body: z.object({
    candidate: z.object({
      candidate: z.string(),
      sdpMLineIndex: z.number(),
      sdpMid: z.string(),
    }),
  }),
});

const historySchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).optional(),
    cursor: z.string().optional(),
  }),
});

// All routes require authentication
router.use(authenticate);

// Call management
router.post('/', validate(initiateCallSchema), callController.initiateCall);
router.get('/history', validate(historySchema), callController.getCallHistory);
router.get('/:id', validate(callIdSchema), callController.getCall);
router.post('/:id/join', validate(callIdSchema), callController.joinCall);
router.post('/:id/leave', validate(callIdSchema), callController.leaveCall);
router.post('/:id/end', validate(callIdSchema), callController.endCall);

// WebRTC signaling
router.post('/:id/offer', validate(callIdSchema), validate(offerSchema), callController.sendOffer);
router.post('/:id/answer', validate(callIdSchema), validate(answerSchema), callController.sendAnswer);
router.post('/:id/candidate', validate(callIdSchema), validate(candidateSchema), callController.sendIceCandidate);

export default router;