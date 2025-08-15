import Message from './message.model.js';
import Conversation from '../conversations/conversation.model.js';
import { AppError } from '../../middleware/errors.js';
import { createCursorPagination } from '../../utils/pagination.js';

export const sendMessage = async (userId, { conversationId, text, attachments, replyTo, scheduledAt }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const messageData = {
    conversationId,
    senderId: userId,
    text,
    attachments: attachments || [],
    replyTo,
    scheduledAt,
    status: scheduledAt ? 'pending' : 'sent',
  };

  const message = await Message.create(messageData);

  if (!scheduledAt) {
    conversation.lastMessageAt = new Date();
    await conversation.save();
  }

  const populatedMessage = await Message.findById(message._id)
    .populate('senderId', 'name avatarUrl')
    .populate('attachments')
    .populate('replyTo', 'text senderId')
    .populate('replyTo.senderId', 'name avatarUrl');

  return populatedMessage;
};

export const getMessages = async (conversationId, userId, { limit = 50, cursor, search }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const query = {
    conversationId,
    deletedFor: { $ne: userId },
    status: { $ne: 'pending' },
  };

  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const messages = await Message.find(query)
    .populate('senderId', 'name avatarUrl')
    .populate('attachments')
    .populate('replyTo', 'text senderId')
    .populate('replyTo.senderId', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  return createCursorPagination(messages, limit, 'createdAt');
};

export const editMessage = async (messageId, userId, { text }) => {
  const message = await Message.findOne({
    _id: messageId,
    senderId: userId,
  });

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  const hoursSinceCreated = (Date.now() - message.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreated > 24) {
    throw new AppError('Message can only be edited within 24 hours', 400, 'EDIT_TIME_EXPIRED');
  }

  message.text = text;
  message.edited = true;
  message.editedAt = new Date();
  await message.save();

  return await Message.findById(messageId)
    .populate('senderId', 'name avatarUrl')
    .populate('attachments')
    .populate('replyTo', 'text senderId')
    .populate('replyTo.senderId', 'name avatarUrl');
};

export const deleteMessage = async (messageId, userId, deleteForEveryone = false) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  const conversation = await Conversation.findOne({
    _id: message.conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (deleteForEveryone) {
    const canDeleteForEveryone = message.senderId.equals(userId) || 
                                conversation.canManage(userId);

    if (!canDeleteForEveryone) {
      throw new AppError('Insufficient permissions', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    message.deletedFor = conversation.members;
  } else {
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }
  }

  await message.save();

  return { message: 'Message deleted successfully' };
};

export const reactToMessage = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  const conversation = await Conversation.findOne({
    _id: message.conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  if (message.isDeletedFor(userId)) {
    throw new AppError('Cannot react to deleted message', 400, 'MESSAGE_DELETED');
  }

  const reactionAdded = message.addReaction(userId, emoji);
  await message.save();

  return {
    message: reactionAdded ? 'Reaction added' : 'Reaction updated',
    reactions: message.reactions,
  };
};

export const removeReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new AppError('Message not found', 404, 'MESSAGE_NOT_FOUND');
  }

  const reactionRemoved = message.removeReaction(userId, emoji);
  if (!reactionRemoved) {
    throw new AppError('Reaction not found', 404, 'REACTION_NOT_FOUND');
  }

  await message.save();

  return {
    message: 'Reaction removed',
    reactions: message.reactions,
  };
};

export const markMessagesAsRead = async (conversationId, userId, messageIds) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: userId,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  await Message.updateMany(
    {
      _id: { $in: messageIds },
      conversationId,
      senderId: { $ne: userId },
      'readBy.userId': { $ne: userId },
    },
    {
      $push: {
        readBy: {
          userId,
          readAt: new Date(),
        },
      },
    }
  );

  return { message: 'Messages marked as read' };
};

export const getScheduledMessages = async (userId) => {
  const messages = await Message.find({
    senderId: userId,
    status: 'pending',
    scheduledAt: { $ne: null },
  })
  .populate('conversationId', 'title isGroup')
  .populate('attachments')
  .sort({ scheduledAt: 1 });

  return messages;
};