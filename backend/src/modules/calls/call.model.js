import mongoose from 'mongoose';

const callSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    joinedAt: {
      type: Date,
    },
    leftAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['invited', 'joined', 'left', 'declined'],
      default: 'invited',
    },
  }],
  type: {
    type: String,
    enum: ['voice', 'video'],
    required: true,
  },
  status: {
    type: String,
    enum: ['initiated', 'ongoing', 'ended', 'missed'],
    default: 'initiated',
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
  recordingKey: {
    type: String, // For future recording feature
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
callSchema.index({ conversationId: 1, createdAt: -1 });
callSchema.index({ status: 1, createdAt: -1 });

// Methods
callSchema.methods.getDuration = function() {
  if (this.endedAt && this.startedAt) {
    return Math.floor((this.endedAt - this.startedAt) / 1000); // in seconds
  }
  return 0;
};

callSchema.methods.addParticipant = function(userId) {
  const existing = this.participants.find(p => p.userId.equals(userId));
  if (!existing) {
    this.participants.push({ userId, status: 'invited' });
  }
};

callSchema.methods.updateParticipantStatus = function(userId, status, timestamp = new Date()) {
  const participant = this.participants.find(p => p.userId.equals(userId));
  if (participant) {
    participant.status = status;
    if (status === 'joined') {
      participant.joinedAt = timestamp;
    } else if (status === 'left') {
      participant.leftAt = timestamp;
    }
  }
};

export default mongoose.model('Call', callSchema);