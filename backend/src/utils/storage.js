import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/env.js';

class LocalStorage {
  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async store(buffer, originalName, mimeType) {
    const ext = path.extname(originalName);
    const key = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, key);
    
    await fs.writeFile(filePath, buffer);
    
    return {
      key,
      path: filePath,
      url: `/uploads/${key}`,
    };
  }

  async delete(key) {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async exists(key) {
    const filePath = path.join(this.uploadDir, key);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key) {
    return `/uploads/${key}`;
  }
}

// S3-ready interface for future implementation
class S3Storage {
  async store(buffer, originalName, mimeType) {
    throw new Error('S3 storage not implemented');
  }

  async delete(key) {
    throw new Error('S3 storage not implemented');
  }

  async exists(key) {
    throw new Error('S3 storage not implemented');
  }

  getUrl(key) {
    throw new Error('S3 storage not implemented');
  }
}

export const storage = config.FEATURE_S3 ? new S3Storage() : new LocalStorage();