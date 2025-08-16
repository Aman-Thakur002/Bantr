import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4200),
  CLIENT_ORIGIN: Joi.string().default('http://localhost:5173'),
  MONGO_URI: Joi.string().required(),
  JWT_ACCESS_SECRET: Joi.string().min(5).required(),
  JWT_REFRESH_SECRET: Joi.string().min(5).required(),
  JWT_ACCESS_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TTL: Joi.string().default('30d'),
  MAX_FILE_SIZE_MB: Joi.number().default(50),
  AI_PROVIDER: Joi.string().valid('openai', 'gemini', 'qwen', 'deepseek').default('openai'),
  OPENAI_API_KEY: Joi.string().optional(),
  GEMINI_API_KEY: Joi.string().optional(),
  QWEN_API_KEY: Joi.string().optional(),
  DEEPSEEK_API_KEY: Joi.string().optional(),
  
  // Email configuration
  BREVO_API_KEY: Joi.string().optional(),
  SENDGRID_API_KEY: Joi.string().optional(),
  DEFAULT_FROM_EMAIL: Joi.string().email().optional(),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:5173'),
  
  // Feature flags
  FEATURE_REDIS: Joi.boolean().default(false),
  FEATURE_S3: Joi.boolean().default(false),
  FEATURE_BULLMQ: Joi.boolean().default(false),
  
  // Optional configs
  REDIS_URL: Joi.string().optional(),
  MONGO_URI_TEST: Joi.string().optional(),
}).unknown();

const { error, value: env } = envSchema.validate({
  ...process.env,
  PORT: parseInt(process.env.PORT) || 4200,
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50,
  FEATURE_REDIS: process.env.FEATURE_REDIS === 'true',
  FEATURE_S3: process.env.FEATURE_S3 === 'true',
  FEATURE_BULLMQ: process.env.FEATURE_BULLMQ === 'true',
});

if (error) {
  console.error('❌ Invalid environment configuration:', error.details);
  process.exit(1);
}

export const config = {
  ...env,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  maxFileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // Convert to bytes
  mongoUri: env.MONGO_URI,
  port: env.PORT,
  brevoApiKey: env.BREVO_API_KEY,
  sendgridApiKey: env.SENDGRID_API_KEY,
  defaultFromEmail: env.DEFAULT_FROM_EMAIL || 'noreply@bantr.com',
  frontendUrl: env.FRONTEND_URL,
  clientUrl: env.CLIENT_ORIGIN
};