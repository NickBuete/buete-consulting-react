const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: './prisma/schema.prisma',
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // For migrations, use the direct URL instead of the pooled one
  migrate: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
