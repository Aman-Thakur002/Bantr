import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/passwords.js';
import { generateTokens, verifyRefreshToken } from '../../utils/tokens.js';
import { AppError } from '../../middleware/errors.js';

export async function register({ name, email, phone, password }) {
  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [
      { email: email || null },
      { phone },
    ],
  });

  if (existingUser) {
    throw new AppError('User already exists', 409, 'USER_EXISTS');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
  });

  // Generate tokens
  const tokens = generateTokens({ userId: user._id });

  return {
    user,
    tokens,
  };
}

export async function login({ identifier, password }) {
  // Find user by email or phone
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { phone: identifier },
    ],
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check password
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Generate tokens
  const tokens = generateTokens({ 
    userId: user._id,
    tokenVersion: user.refreshTokenVersion,
  });

  // Update last seen
  user.lastSeenAt = new Date();
  user.status = 'online';
  await user.save();

  return {
    user,
    tokens,
  };
}

export async function refresh(refreshToken) {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);
    if (!user || user.refreshTokenVersion !== decoded.tokenVersion) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Generate new tokens
    const tokens = generateTokens({ 
      userId: user._id,
      tokenVersion: user.refreshTokenVersion,
    });

    return {
      user,
      tokens,
    };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
}

export async function logout(userId) {
  // Invalidate all refresh tokens by incrementing version
  await User.findByIdAndUpdate(userId, {
    $inc: { refreshTokenVersion: 1 },
    status: 'offline',
    lastSeenAt: new Date(),
  });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify current password
  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update password and invalidate all tokens
  await User.findByIdAndUpdate(userId, {
    passwordHash,
    $inc: { refreshTokenVersion: 1 },
  });
}