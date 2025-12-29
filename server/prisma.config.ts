const { defineConfig } = require('prisma/config');

module.exports = defineConfig({
  schema: './prisma/schema.prisma',
  // Remove datasources - connection is handled by adapter at runtime
  // For migrations, use the direct URL
  migrate: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
