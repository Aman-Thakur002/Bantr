import Conversation from './conversation.model.js';
import Message from '../messages/message.model.js';
import { AppError } from '../../middleware/errors.js';

export const createConversation = async (userId, { isGroup, title, members }) => {
  if (!isGroup && members.length === 1) {
    const existingConversation = await Conversation.findOne({
      isGroup: false,
      members: { $all: [userId, members[0]], $size: 2 },
    });

    if (existingConversation) {
      return existingConversation;
    }
  }

  const conversationData = {
    isGroup,
    members: [userId, ...members],
  };

  if (isGroup) {
    conversationData.title = title;
    conversationData.admins = [userId];
  }

  const conversation = await Conversation.create(conversationData);
  return await conversation.populate('members', 'name avatarUrl status');
};

export const getConversations = async (userId, limit = 20, cursor) => {
  const query = { members: userId };
  
  if (cursor) {
    query.lastMessageAt = { $lt: new Date(cursor) };
  }

  const conversations = await Conversation.find(query)
    .populate('members', 'name avatarUrl status')
    .populate('admins', 'name avatarUrl')
    .populate('moderators', 'name avatarUrl')
    .sort({ lastMessageAt: -1 })
    .limit(limit + 1);

  const hasMore = conversations.length > limit;
  const data = hasMore ? conversations.slice(0, -1) : conversations;
  const nextCursor = hasMore ? data[data.length - 1].lastMessageAt : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
  };
};

export const getConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  })
  .populate('members', 'name avatarUrl status lastSeenAt')
  .populate('admins', 'name avatarUrl')
  .populate('moderators', 'name avatarUrl');

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  return conversation;
};

export const updateConversation = async (conversationId, userId, updates) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (conversation.isGroup && !conversation.canManage(userId)) {
    throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  const allowedUpdates = ['title', 'avatarUrl', 'settings'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).populate('members', 'name avatarUrl status');

  return updatedConversation;
};

export const addMembers = async (conversationId, userId, memberIds) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (!conversation.isGroup) {
    throw new AppError('Cannot add members to 1:1 conversation', 400, 'INVALID_OPERATION');
  }

  if (!conversation.canManage(userId) && !conversation.settings.allowMemberAdd) {
    throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  const newMembers = memberIds.filter(id => !conversation.members.includes(id));
  
  if (newMembers.length === 0) {
    throw new AppError('All users are already members', 400, 'ALREADY_MEMBERS');
  }

  conversation.members.push(...newMembers);
  await conversation.save();

  return await conversation.populate('members', 'name avatarUrl status');
};

export const removeMember = async (conversationId, userId, targetUserId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (!conversation.isGroup) {
    throw new AppError('Cannot remove members from 1:1 conversation', 400, 'INVALID_OPERATION');
  }

  const canRemove = conversation.canManage(userId) || 
                   (userId === targetUserId && conversation.settings.allowMemberLeave);

  if (!canRemove) {
    throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  conversation.members = conversation.members.filter(id => !id.equals(targetUserId));
  conversation.admins = conversation.admins.filter(id => !id.equals(targetUserId));
  conversation.moderators = conversation.moderators.filter(id => !id.equals(targetUserId));

  await conversation.save();

  return await conversation.populate('members', 'name avatarUrl status');
};

export const assignRole = async (conversationId, userId, targetUserId, role) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (!conversation.isGroup) {
    throw new AppError('Cannot assign roles in 1:1 conversation', 400, 'INVALID_OPERATION');
  }

  if (!conversation.isAdmin(userId)) {
    throw new AppError('Only admins can assign roles', 403, 'INSUFFICIENT_PERMISSIONS');
  }

  if (!conversation.members.includes(targetUserId)) {
    throw new AppError('User is not a member', 400, 'NOT_A_MEMBER');
  }

  conversation.admins = conversation.admins.filter(id => !id.equals(targetUserId));
  conversation.moderators = conversation.moderators.filter(id => !id.equals(targetUserId));

  if (role === 'admin') {
    conversation.admins.push(targetUserId);
  } else if (role === 'moderator') {
    conversation.moderators.push(targetUserId);
  }

  await conversation.save();

  return await conversation.populate('members', 'name avatarUrl status');
};