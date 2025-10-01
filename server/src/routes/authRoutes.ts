import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { UserRole } from '@prisma/client'
import { prisma } from '../db/prisma'
import { signToken } from '../utils/jwt'
import { authenticate } from '../middleware/auth'
import { authLimiter } from '../middleware/rateLimiter'
import { authLogger } from '../utils/logger'

const router = Router()

const registrationSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  role: z
    .nativeEnum(UserRole)
    .default(UserRole.BASIC)
    .refine((value) => value === UserRole.BASIC || value === UserRole.PRO, {
      message: 'Invalid role',
    }),
})

router.post('/register', authLimiter, async (req, res) => {
  try {
    const payload = registrationSchema.parse(req.body ?? {})

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.username }],
      },
    })

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' })
    }

    const passwordHash = await bcrypt.hash(payload.password, 10)

    const user = await prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        passwordHash,
        role: payload.role,
      },
    })

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Invalid registration payload',
        issues: error.flatten(),
      })
    }

    authLogger.error({ error }, 'Registration error')
    return res.status(500).json({ message: 'Internal server error' })
  }
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body ?? {}

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const match = await bcrypt.compare(password, user.passwordHash)

  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role })

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  })
})

router.get('/me', authenticate, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } })

  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  })
})

export const authRouter = router
