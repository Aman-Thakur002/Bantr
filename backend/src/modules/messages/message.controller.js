import * as messageService from './message.service.js';
import { success, paginated } from '../../utils/response.js';

export async function sendMessage(req, res) {
  const { conversationId, text, attachments, replyTo, scheduledAt } = req.body;
  
  const message = await messageService.sendMessage(req.user._id, {
    conversationId,
    text,
    attachments,
    replyTo,
    scheduledAt,
  });

  res.status(201).json(success(message, 'Message sent successfully'));
}

export async function getMessages(req, res) {
  const { id: conversationId } = req.params;
  const { limit, cursor, search } = req.query;
  
  const result = await messageService.getMessages(conversationId, req.user._id, {
    limit: parseInt(limit),
    cursor,
    search,
  });

  res.json(paginated(result.data, result.pagination));
}

export async function editMessage(req, res) {
  const { id: messageId } = req.params;
  const { text } = req.body;
  
  const message = await messageService.editMessage(messageId, req.user._id, { text });

  res.json(success(message, 'Message edited successfully'));
}

export async function deleteMessage(req, res) {
  const { id: messageId } = req.params;
  const { deleteForEveryone } = req.body;
  
  const result = await messageService.deleteMessage(messageId, req.user._id, deleteForEveryone);

  res.json(success(result));
}

export async function reactToMessage(req, res) {
  const { id: messageId } = req.params;
  const { emoji } = req.body;
  
  const result = await messageService.reactToMessage(messageId, req.user._id, emoji);

  res.json(success(result));
}

export async function removeReaction(req, res) {
  const { id: messageId } = req.params;
  const { emoji } = req.body;
  
  const result = await messageService.removeReaction(messageId, req.user._id, emoji);

  res.json(success(result));
}

export async function markAsRead(req, res) {
  const { messageIds, conversationId } = req.body;
  
  const result = await messageService.markMessagesAsRead(
    conversationId,
    req.user._id,
    messageIds
  );

  res.json(success(result));
}

export async function getScheduledMessages(req, res) {
  const messages = await messageService.getScheduledMessages(req.user._id);

  res.json(success(messages));
}