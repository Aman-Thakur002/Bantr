import * as attachmentService from './attachment.service.js';
import { success, paginated } from '../../utils/response.js';
import { AppError } from '../../middleware/errors.js';

export async function uploadFile(req, res) {
  if (!req.file) {
    throw new AppError('No file provided', 400, 'NO_FILE');
  }

  const attachment = await attachmentService.uploadFile(req.file, req.user._id);

  res.status(201).json(success(attachment, 'File uploaded successfully'));
}

export async function getAttachment(req, res) {
  const { id } = req.params;
  
  const attachment = await attachmentService.getAttachment(id, req.user._id);

  res.json(success(attachment));
}

export async function downloadFile(req, res) {
  const { id } = req.params;
  
  const attachment = await attachmentService.getAttachment(id, req.user._id);
  
  res.redirect(attachment.getUrl());
}

export async function deleteAttachment(req, res) {
  const { id } = req.params;
  
  const result = await attachmentService.deleteAttachment(id, req.user._id);

  res.json(success(result));
}

export async function getUserAttachments(req, res) {
  const { kind, limit, cursor } = req.query;
  
  const result = await attachmentService.getUserAttachments(req.user._id, {
    kind,
    limit: parseInt(limit),
    cursor,
  });

  res.json(paginated(result.data, result.pagination));
}