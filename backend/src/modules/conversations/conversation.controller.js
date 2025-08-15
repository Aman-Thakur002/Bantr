import * as conversationService from './conversation.service.js';
import { success, paginated } from '../../utils/response.js';

export async function createConversation(req, res) {
  const { isGroup, title, members } = req.body;
  
  const conversation = await conversationService.createConversation(req.user._id, {
    isGroup,
    title,
    members,
  });

  res.status(201).json(success(conversation, 'Conversation created successfully'));
}

export async function getConversations(req, res) {
  const { limit, cursor } = req.query;
  
  const result = await conversationService.getConversations(
    req.user._id,
    parseInt(limit),
    cursor
  );

  res.json(paginated(result.data, result.pagination));
}

export async function getConversation(req, res) {
  const { id } = req.params;
  
  const conversation = await conversationService.getConversation(id, req.user._id);

  res.json(success(conversation));
}

export async function updateConversation(req, res) {
  const { id } = req.params;
  
  const conversation = await conversationService.updateConversation(
    id,
    req.user._id,
    req.body
  );

  res.json(success(conversation, 'Conversation updated successfully'));
}

export async function addMembers(req, res) {
  const { id } = req.params;
  const { members } = req.body;
  
  const conversation = await conversationService.addMembers(
    id,
    req.user._id,
    members
  );

  res.json(success(conversation, 'Members added successfully'));
}

export async function removeMember(req, res) {
  const { id, userId } = req.params;
  
  const conversation = await conversationService.removeMember(
    id,
    req.user._id,
    userId
  );

  res.json(success(conversation, 'Member removed successfully'));
}

export async function assignRole(req, res) {
  const { id } = req.params;
  const { userId, role } = req.body;
  
  const conversation = await conversationService.assignRole(
    id,
    req.user._id,
    userId,
    role
  );

  res.json(success(conversation, 'Role assigned successfully'));
}