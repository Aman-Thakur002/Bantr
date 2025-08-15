import User from './user.model.js';
import { AppError } from '../../middleware/errors.js';

export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

export const updateProfile = async (userId, updates) => {
  const allowedUpdates = ['name', 'about', 'avatarUrl', 'settings'];
  const filteredUpdates = {};
  
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};

export const searchUsers = async (query, currentUserId, limit = 20) => {
  const searchRegex = new RegExp(query, 'i');
  
  const users = await User.find({
    _id: { $ne: currentUserId },
    $or: [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ],
  })
  .select('name email phone avatarUrl status lastSeenAt')
  .limit(limit);

  return users;
};

export const blockUser = async (userId, targetUserId) => {
  if (userId === targetUserId) {
    throw new AppError('Cannot block yourself', 400, 'INVALID_OPERATION');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (user.isBlocked(targetUserId)) {
    throw new AppError('User already blocked', 400, 'ALREADY_BLOCKED');
  }

  user.blockedUsers.push(targetUserId);
  await user.save();

  return { message: 'User blocked successfully' };
};

export const unblockUser = async (userId, targetUserId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (!user.isBlocked(targetUserId)) {
    throw new AppError('User not blocked', 400, 'NOT_BLOCKED');
  }

  user.blockedUsers = user.blockedUsers.filter(id => !id.equals(targetUserId));
  await user.save();

  return { message: 'User unblocked successfully' };
};

export const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId)
    .populate('blockedUsers', 'name avatarUrl');
  
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user.blockedUsers;
};

export const updateStatus = async (userId, status) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { 
      status,
      lastSeenAt: status === 'offline' ? new Date() : undefined,
    },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
};