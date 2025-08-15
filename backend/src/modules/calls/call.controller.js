import * as callService from './call.service.js';
import { success, paginated } from '../../utils/response.js';

export async function initiateCall(req, res) {
  const { conversationId, type } = req.body;
  
  const call = await callService.initiateCall(req.user._id, {
    conversationId,
    type,
  });

  res.status(201).json(success(call, 'Call initiated successfully'));
}

export async function joinCall(req, res) {
  const { id: callId } = req.params;
  
  const call = await callService.joinCall(callId, req.user._id);

  res.json(success(call, 'Joined call successfully'));
}

export async function leaveCall(req, res) {
  const { id: callId } = req.params;
  
  const call = await callService.leaveCall(callId, req.user._id);

  res.json(success(call, 'Left call successfully'));
}

export async function endCall(req, res) {
  const { id: callId } = req.params;
  
  const call = await callService.endCall(callId, req.user._id);

  res.json(success(call, 'Call ended successfully'));
}

export async function getCall(req, res) {
  const { id: callId } = req.params;
  
  const call = await callService.getCall(callId, req.user._id);

  res.json(success(call));
}

export async function getCallHistory(req, res) {
  const { limit, cursor } = req.query;
  
  const result = await callService.getCallHistory(req.user._id, {
    limit: parseInt(limit),
    cursor,
  });

  res.json(paginated(result.data, result.pagination));
}

export async function sendOffer(req, res) {
  const { id: callId } = req.params;
  const { offer } = req.body;
  
  const result = await callService.handleOffer(callId, req.user._id, offer);

  res.json(success(result));
}

export async function sendAnswer(req, res) {
  const { id: callId } = req.params;
  const { answer } = req.body;
  
  const result = await callService.handleAnswer(callId, req.user._id, answer);

  res.json(success(result));
}

export async function sendIceCandidate(req, res) {
  const { id: callId } = req.params;
  const { candidate } = req.body;
  
  const result = await callService.handleIceCandidate(callId, req.user._id, candidate);

  res.json(success(result));
}