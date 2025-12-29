import { createApp, port } from './app'
import { prisma } from './db/prisma'
import { logger } from './utils/logger'
import { initializeScheduledJobs, startAllJobs } from './services/scheduler/cronScheduler'

const app = createApp()

const server = app.listen(port, () => {
  logger.info({ port }, 'API server started')

  // Initialize and start scheduled jobs
  initializeScheduledJobs()
  startAllJobs()
})

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully')

  // Stop scheduled jobs first
  const { stopAllJobs } = await import('./services/scheduler/cronScheduler')
  stopAllJobs()

  server.close(async () => {
    await prisma.$disconnect()
    logger.info('Database disconnected')
    process.exit(0)
  })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
