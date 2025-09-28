import jwt from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';
import { env } from '../config/env';

interface TokenPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export const signToken = (payload: TokenPayload, expiresIn: string = '12h') => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
};
