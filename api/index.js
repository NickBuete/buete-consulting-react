// Vercel serverless function wrapper for Express app
const { createApp } = require('../server/dist/app');

// Create the Express app
const app = createApp();

// Export as Vercel serverless function
module.exports = app;
