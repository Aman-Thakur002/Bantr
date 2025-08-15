import Attachment from '../../modules/attachments/attachment.model.js';
import { storage } from '../../utils/storage.js';
import sharp from 'sharp';
import logger from '../../config/logger.js';

export async function handleMediaThumbnails() {
  try {
    // Find images without thumbnails
    const imagesWithoutThumbs = await Attachment.find({
      kind: 'image',
      thumbnailKey: { $exists: false },
      width: { $gt: 800 }, // Only create thumbs for large images
    }).limit(10); // Process in small batches

    if (imagesWithoutThumbs.length === 0) {
      return;
    }

   console.log(`Processing thumbnails for ${imagesWithoutThumbs.length} images`);

    for (const attachment of imagesWithoutThumbs) {
      try {
        await generateThumbnail(attachment);
        logger.debug(`Thumbnail generated for attachment ${attachment._id}`);
      } catch (error) {
        logger.error(`Failed to generate thumbnail for ${attachment._id}:`, error);
      }
    }

   console.log('Completed thumbnail generation');
  } catch (error) {
    logger.error('Error in media thumbnail handler:', error);
  }
};

async function generateThumbnail(attachment) {
  try {
    // Check if file exists
    const exists = await storage.exists(attachment.key);
    if (!exists) {
      logger.warn(`Original file not found for attachment ${attachment._id}`);
      return;
    }

    // For local storage, read the file
    // In production with S3, you'd download the file first
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const filePath = path.join(process.cwd(), 'uploads', attachment.key);
    const imageBuffer = await fs.readFile(filePath);

    // Generate thumbnail
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(400, 300, { 
        fit: 'inside', 
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Store thumbnail
    const thumbnailResult = await storage.store(
      thumbnailBuffer,
      `thumb_${attachment.key}`,
      'image/jpeg'
    );

    // Update attachment record
    attachment.thumbnailKey = thumbnailResult.key;
    await attachment.save();

  } catch (error) {
    logger.error(`Error generating thumbnail for ${attachment._id}:`, error);
    throw error;
  }
};