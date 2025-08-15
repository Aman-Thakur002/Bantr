import { config } from '../config/env.js';
import logger from '../config/logger.js';
import { error } from '../utils/response.js';

export const createAppError = (message, statusCode = 500, code = 'GENERIC_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  Error.captureStackTrace(error, createAppError);
  return error;
};

export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'GENERIC_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  let { statusCode = 500, message, code = 'INTERNAL_ERROR' } = err;

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: config.isDev ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
    code = 'VALIDATION_ERROR';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'INVALID_ID';
  } else if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate field value';
    code = 'DUPLICATE_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  }

  // Don't leak error details in production
  if (!config.isDev && statusCode === 500) {
    message = 'Something went wrong';
  }

  res.status(statusCode).json(error(message, code));
}

export function notFound(req, res) {
  res.status(404).json(error('Route not found', 'NOT_FOUND'));
}
