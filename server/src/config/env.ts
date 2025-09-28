import { config } from 'dotenv';
import { z } from 'zod';

const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
config({ path: envFile });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  PORT: z.string().optional(),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
});

const rawEnv = envSchema.safeParse(process.env);

if (!rawEnv.success) {
  // Throw a readable error when required env vars are missing
  throw new Error(`Invalid environment variables: ${rawEnv.error.message}`);
}

export const env = {
  databaseUrl: rawEnv.data.DATABASE_URL,
  port: Number(rawEnv.data.PORT ?? 4000),
  jwtSecret: rawEnv.data.JWT_SECRET,
};
