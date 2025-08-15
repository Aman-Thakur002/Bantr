import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';

import { config } from './config/env.js';
import { setupSecurity } from './middleware/security.js';
import { defaultLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errors.js';
import routes from './routes.js';

// Initialize the Express application
const app = express();

// Trust the first proxy in front of the app, essential for rate limiting and correct IP detection
// when deployed behind a reverse proxy like Nginx or a load balancer.
app.set('trust proxy', 1);

// Apply a suite of security middleware (Helmet, HPP, etc.)
setupSecurity(app);

// Compress all responses to reduce their size and improve performance.
app.use(compression());

// Log HTTP requests in a development-friendly format.
app.use(morgan('dev'));

// Parse incoming JSON payloads with a 1MB limit.
app.use(express.json({ limit: '1mb' }));
// Parse incoming URL-encoded payloads with a 1MB limit.
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply a default rate limiter to all requests to prevent abuse.
app.use(defaultLimiter);

// In development, serve uploaded files statically from the 'uploads' directory.
// In production, a dedicated file server like S3 or a CDN should be used.
if (config.isDev) {
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}

// Mount the main API routes under the /api/v1 prefix.
app.use('/api/v1', routes);

// Handle 404 errors for any requests that don't match a defined route.
app.use(notFound);

// A global error handler to catch and process all errors passed to next().
app.use(errorHandler);

export default app;