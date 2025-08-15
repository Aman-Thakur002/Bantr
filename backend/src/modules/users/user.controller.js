import * as userService from './user.service.js';
import { success } from '../../utils/response.js';

export async function getMe(req, res) {
  const user = await userService.getProfile(req.user._id);
  res.json(success(user));
}

export async function updateMe(req, res) {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json(success(user, 'Profile updated successfully'));
}

export async function searchUsers(req, res) {
  const { q: query, limit } = req.query;
  const users = await userService.searchUsers(query, req.user._id, parseInt(limit));
  res.json(success(users));
}

export async function blockUser(req, res) {
  const { id: targetUserId } = req.params;
  const result = await userService.blockUser(req.user._id, targetUserId);
  res.json(success(result));
}

export async function unblockUser(req, res) {
  const { id: targetUserId } = req.params;
  const result = await userService.unblockUser(req.user._id, targetUserId);
  res.json(success(result));
}

export async function getBlockedUsers(req, res) {
  const blockedUsers = await userService.getBlockedUsers(req.user._id);
  res.json(success(blockedUsers));
}

export async function updateStatus(req, res) {
  const { status } = req.body;
  const user = await userService.updateStatus(req.user._id, status);
  res.json(success(user));
}