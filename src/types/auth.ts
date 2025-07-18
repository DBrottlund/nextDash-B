import { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  roleId: number;
  iat?: number;
  exp?: number;
}

export interface SessionData {
  id: number;
  userId: number;
  tokenHash: string;
  refreshTokenHash?: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}