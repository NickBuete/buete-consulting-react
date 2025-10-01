import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '../generated/prisma';
import { env } from '../config/env';

interface TokenPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export const signToken = (payload: TokenPayload, expiresIn: string = '12h'): string => {
  // Cast to any to workaround strict type checking with expiresIn
  return jwt.sign(payload as any, env.jwtSecret, { expiresIn } as any);
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (decoded && typeof decoded === 'object' && 'sub' in decoded && 'email' in decoded && 'role' in decoded) {
      return decoded as unknown as TokenPayload;
    }
    return null;
  } catch (error) {
    return null;
  }
};
