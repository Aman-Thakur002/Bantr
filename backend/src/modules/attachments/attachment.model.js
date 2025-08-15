import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mime: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  kind: {
    type: String,
    enum: ['image', 'video', 'audio', 'file'],
    required: true,
  },
  // Image/Video specific
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  // Audio/Video specific
  duration: {
    type: Number, // in seconds
  },
  checksum: {
    type: String,
  },
  thumbnailKey: {
    type: String, // For video thumbnails
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Indexes
attachmentSchema.index({ uploadedBy: 1, createdAt: -1 });
attachmentSchema.index({ kind: 1 });

// Methods
attachmentSchema.methods.getUrl = function() {
  return `/uploads/${this.key}`;
};

attachmentSchema.methods.getThumbnailUrl = function() {
  if (this.thumbnailKey) {
    return `/uploads/${this.thumbnailKey}`;
  }
  return null;
};

export default mongoose.model('Attachment', attachmentSchema);