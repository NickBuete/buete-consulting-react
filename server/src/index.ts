import { createApp, port } from './app'
import { prisma } from './db/prisma'
import { logger } from './utils/logger'

const app = createApp()

const server = app.listen(port, () => {
  logger.info({ port }, 'API server started')
})

const gracefulShutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully')
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('Database disconnected')
    process.exit(0)
  })
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
