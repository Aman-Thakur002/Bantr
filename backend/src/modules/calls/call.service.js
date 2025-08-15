import Call from './call.model.js';
import Conversation from '../conversations/conversation.model.js';
import { AppError } from '../../middleware/errors.js';

export const initiateCall = async (userId, { conversationId, type }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const existingCall = await Call.findOne({
    conversationId,
    status: { $in: ['initiated', 'ongoing'] },
  });

  if (existingCall) {
    throw new AppError('Call already in progress', 409, 'CALL_IN_PROGRESS');
  }

  const call = await Call.create({
    conversationId,
    type,
    initiatedBy: userId,
    participants: conversation.members.map(memberId => ({
      userId: memberId,
      status: memberId.equals(userId) ? 'joined' : 'invited',
      joinedAt: memberId.equals(userId) ? new Date() : undefined,
    })),
  });

  return await call.populate('participants.userId', 'name avatarUrl');
};

export const joinCall = async (callId, userId) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
  }

  if (call.status === 'ended') {
    throw new AppError('Call has ended', 400, 'CALL_ENDED');
  }

  const participant = call.participants.find(p => p.userId.equals(userId));
  if (!participant) {
    throw new AppError('Not a call participant', 403, 'NOT_PARTICIPANT');
  }

  call.updateParticipantStatus(userId, 'joined');
  
  if (call.status === 'initiated') {
    call.status = 'ongoing';
  }

  await call.save();

  return await call.populate('participants.userId', 'name avatarUrl');
};

export const leaveCall = async (callId, userId) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
  }

  call.updateParticipantStatus(userId, 'left');

  const activeParticipants = call.participants.filter(p => 
    p.status === 'joined' || p.status === 'invited'
  );

  if (activeParticipants.length === 0) {
    call.status = 'ended';
    call.endedAt = new Date();
  }

  await call.save();

  return await call.populate('participants.userId', 'name avatarUrl');
};

export const endCall = async (callId, userId) => {
  const call = await Call.findById(callId);

  if (!call) {
    throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
  }

  const canEnd = call.initiatedBy.equals(userId) || 
                call.participants.some(p => p.userId.equals(userId));

  if (!canEnd) {
    throw new AppError('Cannot end this call', 403, 'CANNOT_END_CALL');
  }

  call.status = 'ended';
  call.endedAt = new Date();

  call.participants.forEach(participant => {
    if (participant.status === 'joined' || participant.status === 'invited') {
      participant.status = 'left';
      participant.leftAt = new Date();
    }
  });

  await call.save();

  return await call.populate('participants.userId', 'name avatarUrl');
};

export const getCall = async (callId, userId) => {
  const call = await Call.findById(callId)
    .populate('participants.userId', 'name avatarUrl')
    .populate('conversationId', 'title isGroup');

  if (!call) {
    throw new AppError('Call not found', 404, 'CALL_NOT_FOUND');
  }

  const isParticipant = call.participants.some(p => p.userId._id.equals(userId));
  if (!isParticipant) {
    throw new AppError('Not a call participant', 403, 'NOT_PARTICIPANT');
  }

  return call;
};

export const getCallHistory = async (userId, { limit = 20, cursor }) => {
  const query = {
    'participants.userId': userId,
    status: 'ended',
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const calls = await Call.find(query)
    .populate('participants.userId', 'name avatarUrl')
    .populate('conversationId', 'title isGroup')
    .populate('initiatedBy', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = calls.length > limit;
  const data = hasMore ? calls.slice(0, -1) : calls;
  const nextCursor = hasMore ? data[data.length - 1].createdAt : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
  };
};

export const handleOffer = async (callId, userId, offer) => {
  const call = await getCall(callId, userId);
  return { message: 'Offer sent', callId, offer };
};

export const handleAnswer = async (callId, userId, answer) => {
  const call = await getCall(callId, userId);
  return { message: 'Answer sent', callId, answer };
};

export const handleIceCandidate = async (callId, userId, candidate) => {
  const call = await getCall(callId, userId);
  return { message: 'ICE candidate sent', callId, candidate };
};