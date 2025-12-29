import { Router, Request, Response } from 'express'
import { prisma } from '../db/prisma'
import { dbLogger } from '../utils/logger'

const router = Router()

/**
 * Health check endpoint for monitoring and load balancer
 * Returns 200 if service is healthy, 503 if unhealthy
 */
router.get('/health', async (req: Request, res: Response) => {
  // Debug: Parse DATABASE_URL to see what host is being used
  const url = process.env.DATABASE_URL || ''
  const host = url.split('@')[1]?.split(':')[0] ?? 'missing'
  const hasDbUrl = Boolean(process.env.DATABASE_URL)

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`

    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || 'unknown',
      database: 'connected',
      debug: {
        hasDbUrl,
        host,
      },
    }

    res.status(200).json(healthCheck)
  } catch (error) {
    dbLogger.error({ error }, 'Health check failed')
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      database: 'disconnected',
      debug: {
        hasDbUrl,
        host,
      },
    })
  }
})

/**
 * Readiness check endpoint for container orchestration
 * Returns 200 when service is ready to accept traffic
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if server is ready to accept requests
    await prisma.$queryRaw`SELECT 1`
    res.status(200).send('OK')
  } catch (error) {
    dbLogger.error({ error }, 'Readiness check failed')
    res.status(503).send('Not Ready')
  }
})

/**
 * Liveness check endpoint for container orchestration
 * Returns 200 if the application is running
 */
router.get('/live', (req: Request, res: Response) => {
  // Simple check - if we can respond, we're alive
  res.status(200).send('OK')
})

export default router
