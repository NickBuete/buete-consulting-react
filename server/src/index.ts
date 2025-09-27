import { createApp, port } from './app';
import { prisma } from './db/prisma';

const app = createApp();

const server = app.listen(port, () => {
  console.log(`API listening on port ${port}`); // eslint-disable-line no-console
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully.`); // eslint-disable-line no-console
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
