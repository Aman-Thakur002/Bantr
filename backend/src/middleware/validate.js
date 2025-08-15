import { z } from 'zod';
import { AppError } from './errors.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new AppError(message, 400, 'VALIDATION_ERROR');
      }
      throw error;
    }
  };
}