import pino from 'pino'

const isDevelopment = process.env.NODE_ENV === 'development'

const loggerOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
}

if (isDevelopment) {
  loggerOptions.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname',
    },
  }
}

export const logger = pino(loggerOptions)

// Child loggers for different contexts
export const dbLogger = logger.child({ context: 'database' })
export const authLogger = logger.child({ context: 'auth' })
export const aiLogger = logger.child({ context: 'ai' })
export const apiLogger = logger.child({ context: 'api' })
