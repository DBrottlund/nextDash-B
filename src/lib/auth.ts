const jwt = require('jsonwebtoken');
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { JWTPayload, User, SessionData } from '@/types';
import { db } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

export const auth = {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  // Verify password
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

  // Generate JWT token
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload as any, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN as string });
  },

  // Generate refresh token
  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload as any, JWT_REFRESH_SECRET as string, { expiresIn: JWT_REFRESH_EXPIRES_IN as string });
  },

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
    } catch (error) {
      return null;
    }
  },

  // Verify refresh token
  verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET as string) as JWTPayload;
    } catch (error) {
      return null;
    }
  },

  // Hash token for storage
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  },

  // Get user by email with role information
  async getUserByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt, 
        u.updated_at as updatedAt, u.last_login as lastLogin, u.password_hash,
        r.name as roleName, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1 AND u.is_active = TRUE
    `;
    
    const user = await db.queryOne<any>(query, [email]);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.roleName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLogin: user.lastLogin,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
      passwordHash: user.password_hash
    } as User & { passwordHash: string };
  },

  // Get user by ID
  async getUserById(id: number): Promise<User | null> {
    const query = `
      SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt, 
        u.updated_at as updatedAt, u.last_login as lastLogin,
        r.name as roleName, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1 AND u.is_active = TRUE
    `;
    
    const user = await db.queryOne<any>(query, [id]);
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      roleName: user.roleName,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || user.createdAt,
      lastLogin: user.lastLogin,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions
    } as User;
  },

  // Create user session
  async createSession(userId: number, token: string, refreshToken?: string, userAgent?: string, ipAddress?: string): Promise<number> {
    const tokenHash = this.hashToken(token);
    const refreshTokenHash = refreshToken ? this.hashToken(refreshToken) : null;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const result = await db.execute(
      'INSERT INTO user_sessions (user_id, token_hash, refresh_token_hash, expires_at, user_agent, ip_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [userId, tokenHash, refreshTokenHash, expiresAt, userAgent, ipAddress]
    );

    return result.rows[0].id;
  },

  // Validate session
  async validateSession(token: string): Promise<SessionData | null> {
    const tokenHash = this.hashToken(token);
    const session = await db.queryOne<SessionData>(
      'SELECT * FROM user_sessions WHERE token_hash = $1 AND expires_at > NOW()',
      [tokenHash]
    );

    return session;
  },

  // Delete session
  async deleteSession(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await db.execute('DELETE FROM user_sessions WHERE token_hash = $1', [tokenHash]);
  },

  // Delete all user sessions
  async deleteUserSessions(userId: number): Promise<void> {
    await db.execute('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
  },

  // Update last login
  async updateLastLogin(userId: number): Promise<void> {
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
  },

  // Clean expired sessions
  async cleanExpiredSessions(): Promise<void> {
    await db.execute('DELETE FROM user_sessions WHERE expires_at < NOW()');
  }
};

export default auth;