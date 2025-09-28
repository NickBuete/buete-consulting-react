import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  sub: number;
  email: string;
  role: string;
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
