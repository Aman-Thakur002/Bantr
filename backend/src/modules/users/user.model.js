import mongoose from 'mongoose';

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
    enum: ['user', 'admin'],
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
  magicLink: {
    type: String,
    default: 0,
  },
  otp: {
    type: String,
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


userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.refreshTokenVersion;
  return user;
};

userSchema.methods.isBlocked = function(userId) {
  return this.blockedUsers.includes(userId);
};

export default mongoose.model('User', userSchema);