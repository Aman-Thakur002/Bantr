import { suggestReply, summarizeConversation, translateText, moderateText } from './ai.service.js';
import Message from '../messages/message.model.js';
import Conversation from '../conversations/conversation.model.js';
import { success } from '../../utils/response.js';
import { AppError } from '../../middleware/errors.js';

export async function suggestReplyController(req, res) {
  const { conversationId, messageCount = 5 } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: req.user._id,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const messages = await Message.find({
    conversationId,
    deletedFor: { $ne: req.user._id },
  })
  .populate('senderId', 'name')
  .sort({ createdAt: -1 })
  .limit(messageCount);

  const formattedMessages = messages.reverse().map(msg => ({
    text: msg.text,
    senderName: msg.senderId.name,
  }));

  const suggestion = await suggestReply({
    messages: formattedMessages,
    userContext: { userId: req.user._id },
  });

  res.json(success({ suggestion }, 'Reply suggestion generated'));
};

export async function summarizeConversationController(req, res) {
  const { conversationId, messageCount = 50 } = req.body;

  const conversation = await Conversation.findOne({
    _id: conversationId,
    members: req.user._id,
  });

  if (!conversation) {
    throw new AppError('Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
  }

  const messages = await Message.find({
    conversationId,
    deletedFor: { $ne: req.user._id },
  })
  .populate('senderId', 'name')
  .sort({ createdAt: -1 })
  .limit(messageCount);

  const formattedMessages = messages.reverse().map(msg => ({
    text: msg.text,
    senderName: msg.senderId.name,
  }));

  const summary = await summarizeConversation({
    conversationId,
    messages: formattedMessages,
  });

  res.json(success({ summary }, 'Conversation summary generated'));
};

export async function translateTextController(req, res) {
  const { text, targetLang } = req.body;

  const translatedText = await translateText({
    text,
    targetLang,
  });

  res.json(success({ 
    originalText: text,
    translatedText,
    targetLang,
  }, 'Text translated successfully'));
};

export async function moderateTextController(req, res) {
  const { text } = req.body;

  const moderation = await moderateText({ text });

  res.json(success({
    text,
    moderation,
  }, 'Text moderation completed'));
};