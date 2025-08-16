import { Router } from 'express';
import * as callController from './call.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import {
  initiateCallSchema,
  callIdSchema,
  getCallHistorySchema,
  sendOfferSchema,
  sendAnswerSchema,
  sendIceCandidateSchema,
} from './call.validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Call management
router.post('/', validate(initiateCallSchema), callController.initiateCall);
router.get('/history', validate(getCallHistorySchema), callController.getCallHistory);
router.get('/:id', validate(callIdSchema), callController.getCall);
router.post('/:id/join', validate(callIdSchema), callController.joinCall);
router.post('/:id/leave', validate(callIdSchema), callController.leaveCall);
router.post('/:id/end', validate(callIdSchema), callController.endCall);

// WebRTC signaling
router.post('/:id/offer', validate(sendOfferSchema), callController.sendOffer);
router.post('/:id/answer', validate(sendAnswerSchema), callController.sendAnswer);
router.post('/:id/candidate', validate(sendIceCandidateSchema), callController.sendIceCandidate);

export default router;