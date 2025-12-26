import { config } from 'dotenv'
import { z } from 'zod'

// Load .env file if it exists (local development)
// In production (Vercel), environment variables are injected directly into process.env
// so we don't need to load from a file
if (process.env.NODE_ENV !== 'production') {
  const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  config({ path: envFile })
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  FRONTEND_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  LOG_LEVEL: z
    .enum(['trace', 'debug', 'info', 'warn', 'error'])
    .default('info'),
})

const rawEnv = envSchema.safeParse(process.env)

if (!rawEnv.success) {
  // Throw a readable error when required env vars are missing
  throw new Error(`Invalid environment variables: ${rawEnv.error.message}`)
}

export const env = {
  databaseUrl: rawEnv.data.DATABASE_URL,
  port: Number(rawEnv.data.PORT ?? 4000),
  jwtSecret: rawEnv.data.JWT_SECRET,
  frontendUrl: rawEnv.data.FRONTEND_URL,
  nodeEnv: rawEnv.data.NODE_ENV,
  logLevel: rawEnv.data.LOG_LEVEL,
}
