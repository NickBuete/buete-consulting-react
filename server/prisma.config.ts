import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
  // For migrations, use the direct URL instead of the pooled one
  migrate: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
