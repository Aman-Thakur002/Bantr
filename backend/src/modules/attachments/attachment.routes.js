import { Router } from 'express';
import multer from 'multer';
import * as attachmentController from './attachment.controller.js';
import { validate } from '../../middleware/validate.js';
import { authenticate } from '../../middleware/auth.js';
import { uploadLimiter } from '../../middleware/rateLimiter.js';
import { config } from '../../config/env.js';
import {
  attachmentIdSchema,
  getUserAttachmentsSchema,
} from './attachment.validation.js';

const router = Router();

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'text/plain',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  },
});

// All routes require authentication
router.use(authenticate);

// File upload (with rate limiting)
router.post('/upload', uploadLimiter, upload.single('file'), attachmentController.uploadFile);

// File management
router.get('/me', validate(getUserAttachmentsSchema), attachmentController.getUserAttachments);
router.get('/:id', validate(attachmentIdSchema), attachmentController.getAttachment);
router.get('/:id/download', validate(attachmentIdSchema), attachmentController.downloadFile);
router.delete('/:id', validate(attachmentIdSchema), attachmentController.deleteAttachment);

export default router;