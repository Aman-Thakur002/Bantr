import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    trim: true,
    maxlength: 4000,
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment',
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emoji: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  edited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  deletedFor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  }],
  scheduledAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'sent',
  },
}, {
  timestamps: true,
});

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ scheduledAt: 1, status: 1 });
messageSchema.index({ text: 'text' }); // Text search

// Methods
messageSchema.methods.isDeletedFor = function(userId) {
  return this.deletedFor.includes(userId);
};

messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.userId.equals(userId));
};

messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReaction = this.reactions.find(r => 
    r.userId.equals(userId) && r.emoji === emoji
  );
  
  if (existingReaction) {
    return false; // Already reacted with this emoji
  }

  // Remove any existing reaction from this user
  this.reactions = this.reactions.filter(r => !r.userId.equals(userId));
  
  // Add new reaction
  this.reactions.push({ userId, emoji });
  return true;
};

messageSchema.methods.removeReaction = function(userId, emoji) {
  const initialLength = this.reactions.length;
  this.reactions = this.reactions.filter(r => 
    !(r.userId.equals(userId) && r.emoji === emoji)
  );
  return this.reactions.length < initialLength;
};

export default mongoose.model('Message', messageSchema);