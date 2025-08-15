import crypto from 'crypto';
import User from '../users/user.model.js';
import { hashPassword, comparePassword } from '../../utils/passwords.js';
import { generateTokens, verifyRefreshToken } from '../../utils/tokens.js';
import { AppError } from '../../middleware/errors.js';

/**
 * Registers a new user.
 * @param {object} userData - The user data.
 * @param {string} userData.name - The user's name.
 * @param {string} [userData.email] - The user's email (optional).
 * @param {string} userData.phone - The user's phone number.
 * @param {string} userData.password - The user's password.
 * @returns {Promise<object>} The new user and authentication tokens.
 */
export async function register({ name, email, phone, password }) {
  // Check if user already exists with the same email or phone number
  const existingUser = await User.findOne({
    $or: [
      { email: email || null }, // Use null to avoid matching empty strings
      { phone },
    ],
  });

  if (existingUser) {
    throw new AppError('User with this email or phone already exists', 409, 'USER_EXISTS');
  }

  // Hash password for security
  const passwordHash = await hashPassword(password);

  // Create the new user in the database
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

/**
 * Logs a user in.
 * @param {object} credentials - The user's login credentials.
 * @param {string} credentials.identifier - The user's email or phone number.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<object>} The user and authentication tokens.
 */
export async function login({ identifier, password }) {
  // Find user by email or phone number
  const user = await User.findOne({
    $or: [
      { email: identifier },
      { phone: identifier },
    ],
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
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

/**
 * Refreshes authentication tokens.
 * @param {string} refreshToken - The refresh token.
 * @returns {Promise<object>} The user and new authentication tokens.
 */
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

/**
 * Logs a user out by invalidating their refresh tokens.
 * @param {string} userId - The ID of the user to log out.
 */
export async function logout(userId) {
  // Invalidate all refresh tokens by incrementing the token version
  // and update the user's status to offline.
  await User.findByIdAndUpdate(userId, {
    $inc: { refreshTokenVersion: 1 },
    status: 'offline',
    lastSeenAt: new Date(),
  });
}

/**
 * Changes a user's password.
 * @param {string} userId - The ID of the user.
 * @param {object} passwords - The current and new passwords.
 * @param {string} passwords.currentPassword - The user's current password.
 * @param {string} passwords.newPassword - The user's new password.
 */
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

/**
 * Initiates the password reset process for a user.
 * @param {string} identifier - The user's email or phone number.
 * @returns {Promise<string|undefined>} The reset token (for testing/logging) or undefined if user not found.
 */
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

  // In a real application, this token would be sent to the user via email or SMS.
  // For this project, we log it to the console for development purposes.
  console.log(`Password reset token for ${user.name}: ${resetToken}`);

  return resetToken;
}

/**
 * Resets a user's password using a reset token.
 * @param {object} data - The reset data.
 * @param {string} data.token - The password reset token.
 * @param {string} data.newPassword - The new password.
 */
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