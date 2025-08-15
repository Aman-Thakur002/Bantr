import sharp from 'sharp';
import crypto from 'crypto';
import Attachment from './attachment.model.js';
import { storage } from '../../utils/storage.js';
import { AppError } from '../../middleware/errors.js';
import { config } from '../../config/env.js';

const getFileKind = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'audio';
  return 'file';
};

const processImage = async (buffer, key) => {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();
    
    let thumbnailKey = null;
    if (metadata.width > 800 || metadata.height > 600) {
      const thumbnailBuffer = await image
        .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      
      const thumbnailResult = await storage.store(
        thumbnailBuffer,
        `thumb_${key}`,
        'image/jpeg'
      );
      thumbnailKey = thumbnailResult.key;
    }

    return {
      width: metadata.width,
      height: metadata.height,
      thumbnailKey,
    };
  } catch (error) {
    return {};
  }
};

const processVideo = async (buffer) => {
  return {};
};

const processAudio = async (buffer) => {
  return {};
};

export const uploadFile = async (file, userId) => {
  if (file.size > config.maxFileSize) {
    throw new AppError(
      `File size exceeds limit of ${config.MAX_FILE_SIZE_MB}MB`,
      400,
      'FILE_TOO_LARGE'
    );
  }

  const kind = getFileKind(file.mimetype);
  const checksum = crypto.createHash('md5').update(file.buffer).digest('hex');

  const existingFile = await Attachment.findOne({ checksum, uploadedBy: userId });
  if (existingFile) {
    return existingFile;
  }

  const { key, url } = await storage.store(file.buffer, file.originalname, file.mimetype);

  let metadata = {};
  if (kind === 'image') {
    metadata = await processImage(file.buffer, key);
  } else if (kind === 'video') {
    metadata = await processVideo(file.buffer);
  } else if (kind === 'audio') {
    metadata = await processAudio(file.buffer);
  }

  const attachment = await Attachment.create({
    key,
    originalName: file.originalname,
    mime: file.mimetype,
    size: file.size,
    kind,
    checksum,
    uploadedBy: userId,
    ...metadata,
  });

  return attachment;
};

export const getAttachment = async (attachmentId, userId) => {
  const attachment = await Attachment.findById(attachmentId);
  
  if (!attachment) {
    throw new AppError('Attachment not found', 404, 'ATTACHMENT_NOT_FOUND');
  }
  
  return attachment;
};

export const deleteAttachment = async (attachmentId, userId) => {
  const attachment = await Attachment.findOne({
    _id: attachmentId,
    uploadedBy: userId,
  });

  if (!attachment) {
    throw new AppError('Attachment not found', 404, 'ATTACHMENT_NOT_FOUND');
  }

  await storage.delete(attachment.key);
  if (attachment.thumbnailKey) {
    await storage.delete(attachment.thumbnailKey);
  }

  await Attachment.findByIdAndDelete(attachmentId);

  return { message: 'Attachment deleted successfully' };
};

export const getUserAttachments = async (userId, { kind, limit = 20, cursor }) => {
  const query = { uploadedBy: userId };
  
  if (kind) {
    query.kind = kind;
  }
  
  if (cursor) {
    query.createdAt = { $lt: new Date(cursor) };
  }

  const attachments = await Attachment.find(query)
    .sort({ createdAt: -1 })
    .limit(limit + 1);

  const hasMore = attachments.length > limit;
  const data = hasMore ? attachments.slice(0, -1) : attachments;
  const nextCursor = hasMore ? data[data.length - 1].createdAt : null;

  return {
    data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
    },
  };
};