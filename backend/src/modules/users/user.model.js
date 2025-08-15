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
    sparse: true,
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
  refreshTokenVersion: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text search index
userSchema.index({ name: 'text' });

// Methods
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