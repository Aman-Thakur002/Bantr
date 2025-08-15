import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { config } from '../config/env.js';

export function setupSecurity(app) {
  // Helmet for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Prevent XSS attacks
  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = xss(req.body[key]);
        }
      }
    }
    next();
  });

  // Prevent NoSQL injection attacks
  app.use(mongoSanitize());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());
}