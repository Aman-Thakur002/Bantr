import mongoose from 'mongoose';

/**
 * @typedef User
 * @property {string} name.required - User's full name
 * @property {string} email - User's email address (unique, optional)
 * @property {string} phone.required - User's phone number (unique)
 * @property {string} passwordHash.required - Hashed password
 * @property {string} avatarUrl - URL of the user's avatar image
 * @property {string} status - User's online status ('online', 'offline', 'away')
 * @property {string} about - A short bio or status message
 * @property {string} role - User's role ('user', 'moderator', 'admin')
 * @property {Array.<ObjectId>} blockedUsers - List of users blocked by this user
 * @property {object} settings - User-specific settings
 * @property {boolean} settings.readReceipts - If the user sends read receipts
 * @property {boolean} settings.lastSeenVisible - If the user's last seen time is visible
 * @property {string} settings.theme - User's preferred theme ('light', 'dark', 'auto')
 * @property {Date} lastSeenAt - The last time the user was active
 * @property {number} refreshTokenVersion - Incremented to invalidate all refresh tokens
 * @property {string} passwordResetToken - Token for resetting password
 * @property {Date} passwordResetExpires - Expiration date for the password reset token
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    sparse: true, // Allows multiple documents to have a null email
    lowercase: true,
    trim: true,
    index: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'away'],
    default: 'offline',
  },
  about: {
    type: String,
    maxlength: 500,
    default: 'Hey there! I am using NeuroChat.',
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  settings: {
    readReceipts: {
      type: Boolean,
      default: true,
    },
    lastSeenVisible: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto',
    },
  },
  lastSeenAt: {
    type: Date,
    default: Date.now,
  },
  // This version number is incremented to invalidate all of a user's refresh tokens.
  refreshTokenVersion: {
    type: Number,
    default: 0,
  },
  // Hashed token for password reset functionality.
  passwordResetToken: String,
  // Expiration date for the password reset token.
  passwordResetExpires: Date,
}, {
  // Adds createdAt and updatedAt timestamps automatically.
  timestamps: true,
});

// Create a text index on the name field for searching.
userSchema.index({ name: 'text' });

/**
 * Custom toJSON method to control what user data is sent back to the client.
 * This method removes sensitive fields like the password hash and refresh token version.
 */
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokenVersion;
  return user;
};

/**
 * Checks if a given user ID is in the current user's blocked list.
 * @param {string} userId - The ID of the user to check.
 * @returns {boolean} True if the user is blocked, false otherwise.
 */
userSchema.methods.isBlocked = function(userId) {
  return this.blockedUsers.includes(userId);
};

export default mongoose.model('User', userSchema);