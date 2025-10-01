import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import { ZodError } from 'zod'

import { env } from './config/env'
import { registerRoutes } from './routes'
import { logger } from './utils/logger'

export const createApp = () => {
  const app = express()

  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  )

  // Response compression
  app.use(
    compression({
      filter: (req: express.Request, res: express.Response) => {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      },
      level: 6,
    })
  )

  // CORS configuration
  const allowedOrigins = ['http://localhost:3000', env.frontendUrl].filter(
    Boolean
  )

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true)

        if (allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400, // 24 hours preflight cache
    })
  )

  app.use(express.json({ limit: '1mb' }))

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  registerRoutes(app)

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          issues: err.flatten(),
        })
      }

      logger.error({ err }, 'Unhandled error')
      return res.status(500).json({ message: 'Internal server error' })
    }
  )

  return app
}

export const port = env.port
