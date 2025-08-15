import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('8080'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(5, 'JWT_ACCESS_SECRET must be at least 5 characters'),
  JWT_REFRESH_SECRET: z.string().min(5, 'JWT_REFRESH_SECRET must be at least 5 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  MAX_FILE_SIZE_MB: z.string().transform(Number).default('50'),
  AI_PROVIDER: z.enum(['openai', 'gemini', 'qwen', 'deepseek']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  QWEN_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  
  // Feature flags
  FEATURE_REDIS: z.string().transform(val => val === 'true').default('false'),
  FEATURE_S3: z.string().transform(val => val === 'true').default('false'),
  FEATURE_BULLMQ: z.string().transform(val => val === 'true').default('false'),
  
  // Optional configs
  REDIS_URL: z.string().optional(),
  MONGO_URI_TEST: z.string().optional(),
});

let env;
try {
  env = envSchema.parse(process.env);
} catch (error) {
  console.log(error);
  console.error('❌ Invalid environment configuration:');
  process.exit(1);
}

export const config = {
  ...env,
  isDev: env.NODE_ENV === 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  maxFileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024, // Convert to bytes
  mongoUri: env.MONGO_URI,
  port : env.PORT
};
