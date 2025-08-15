import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  avatarUrl: {
    type: String,
    default: null,
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  pinnedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  settings: {
    allowMemberAdd: {
      type: Boolean,
      default: true,
    },
    allowMemberLeave: {
      type: Boolean,
      default: true,
    },
    muteNotifications: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

// Indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ isGroup: 1, members: 1 });

// Methods
conversationSchema.methods.isMember = function(userId) {
  return this.members.includes(userId);
};

conversationSchema.methods.isAdmin = function(userId) {
  return this.admins.includes(userId);
};

conversationSchema.methods.isModerator = function(userId) {
  return this.moderators.includes(userId);
};

conversationSchema.methods.canManage = function(userId) {
  return this.isAdmin(userId) || this.isModerator(userId);
};

export default mongoose.model('Conversation', conversationSchema);