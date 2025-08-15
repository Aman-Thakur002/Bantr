import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { config } from './config/env.js';
import { setupSecurity } from './middleware/security.js';
import { defaultLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errors.js';
import routes from './routes.js';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
setupSecurity(app);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
app.use(defaultLimiter);

// Static file serving for uploads (development only)
if (config.isDev) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;