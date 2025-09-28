export type UserRole = 'BASIC' | 'PRO' | 'ADMIN';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
