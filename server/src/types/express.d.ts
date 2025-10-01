import { UserRole } from '../generated/prisma'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: UserRole
      }
    }
  }
}

export {}
