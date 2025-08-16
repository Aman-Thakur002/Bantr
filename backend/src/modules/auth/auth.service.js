import crypto from 'crypto';
import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/passwords.js';
import { generateTokens, verifyRefreshToken } from '../../utils/tokens.js';
import { AppError } from '../../middleware/errors.js';
import { sendPasswordReset } from '../../services/email/index.js';

//--------------------<< register user >>---------------------
export async function register({ name, email, phone, password }) {
  
  const existingUser = await User.findOne({
    $or: [
      { email: email || null }, // Use null to avoid matching empty strings
      { phone },
    ],
  });

  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 409, 'USER_EXISTS');
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
  });

  const tokens = generateTokens({ userId: user._id, tokenVersion: user.refreshTokenVersion });

  return {
    user,
    tokens,
  };
}

//--------------<< login user >>---------------------
export async function login({ identifier, password }) {
  // Find user by email or phone number
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { phone: identifier },
    ],
  });

  if (!user) {
    throw new AppError('Invalid credentials', 404, 'INVALID_CREDENTIALS');
  }

  // Compare the provided password with the stored hash
  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Generate new access and refresh tokens
  const tokens = generateTokens({ 
    userId: user._id,
    tokenVersion: user.refreshTokenVersion,
  });

  // Update user's online status and last seen timestamp
  user.lastSeenAt = new Date();
  user.status = 'online';
  await user.save();

  return {
    user,
    tokens,
  };
}

//---------------<< refresh tokens >>---------------------
export async function refresh(refreshToken) {
  try {
    // Verify the refresh token's validity
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.userId);
    // Ensure the user exists and the token version is correct
    if (!user || user.refreshTokenVersion !== decoded.tokenVersion) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    // Issue a new set of tokens
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

//----------------<< logout user >>---------------------
export async function logout(userId) {
  // Invalidate all refresh tokens by incrementing the token version
  // and update the user's status to offline.
  await User.findByIdAndUpdate(userId, {
    $inc: { refreshTokenVersion: 1 },
    status: 'offline',
    lastSeenAt: new Date(),
  });
}

//------------------<< change password >>---------------------
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  // Verify the user's current password
  const isValidPassword = await comparePassword(currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Hash the new password
  const passwordHash = await hashPassword(newPassword);

  // Update the password and invalidate all existing tokens
  await User.findByIdAndUpdate(userId, {
    passwordHash,
    $inc: { refreshTokenVersion: 1 },
  });
}

//--------------<< forgot password >>---------------------
export async function forgotPassword(identifier) {
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) {
    // To prevent user enumeration attacks, we don't reveal if the user was found.
    return;
  }

  // Generate a secure random token
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash the token before storing it in the database for security
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set the token to expire in 10 minutes
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Send password reset email
  if (user.email) {
    await sendPasswordReset(user.email, resetToken);
  }

  return resetToken;
}

//------------------<< reset password >>---------------------
export async function resetPassword({ token, newPassword }) {
  // Hash the incoming token to match the one stored in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find the user by the hashed token and ensure the token has not expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400, 'INVALID_TOKEN');
  }

  // Set the new password
  user.passwordHash = await hashPassword(newPassword);

  // Clear the password reset fields so the token cannot be reused
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Invalidate all active sessions by incrementing the refresh token version
  user.refreshTokenVersion += 1;

  await user.save();
}