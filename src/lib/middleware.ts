import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';
import { permissions } from './permissions';
import { User, PermissionCheck } from '@/types';
import { HTTP_STATUS, ROUTES } from './constants';

export interface AuthenticatedRequest extends NextRequest {
  user?: User;
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const middleware = {
  // Rate limiting middleware
  rateLimit: (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
    return (req: NextRequest) => {
      const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
      const key = `rate_limit:${ip}`;
      const now = Date.now();
      
      const current = rateLimitStore.get(key);
      
      if (!current || now > current.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return null; // Allow request
      }
      
      if (current.count >= maxRequests) {
        return NextResponse.json(
          { success: false, message: 'Too many requests' },
          { status: 429 }
        );
      }
      
      current.count++;
      return null; // Allow request
    };
  },

  // Authentication middleware
  authenticate: async (req: AuthenticatedRequest): Promise<NextResponse | null> => {
    try {
      const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                   req.cookies.get('auth_token')?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      const payload = auth.verifyToken(token);
      if (!payload) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      // Validate session
      const session = await auth.validateSession(token);
      if (!session) {
        return NextResponse.json(
          { success: false, message: 'Session expired' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      // Get user data
      const user = await auth.getUserById(payload.userId);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      // Attach user to request
      req.user = user;
      return null; // Continue to next middleware/handler
    } catch (error) {
      console.error('Authentication error:', error);
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }
  },

  // Authorization middleware
  authorize: (requiredPermissions: PermissionCheck[]) => {
    return (req: AuthenticatedRequest): NextResponse | null => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      const hasPermission = permissions.hasAllPermissions(req.user, requiredPermissions);
      if (!hasPermission) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: HTTP_STATUS.FORBIDDEN }
        );
      }

      return null; // Continue to next middleware/handler
    };
  },

  // Role-based authorization
  requireRole: (minRoleId: number) => {
    return (req: AuthenticatedRequest): NextResponse | null => {
      if (!req.user) {
        return NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: HTTP_STATUS.UNAUTHORIZED }
        );
      }

      if (req.user.roleId > minRoleId) {
        return NextResponse.json(
          { success: false, message: 'Insufficient role level' },
          { status: HTTP_STATUS.FORBIDDEN }
        );
      }

      return null; // Continue to next middleware/handler
    };
  },

  // Admin only middleware
  requireAdmin: (req: AuthenticatedRequest): NextResponse | null => {
    if (!req.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    if (!permissions.isAdmin(req.user)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    return null; // Continue to next middleware/handler
  },

  // CORS middleware
  cors: (req: NextRequest): NextResponse | null => {
    const response = NextResponse.next();
    
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return null; // Continue to next middleware/handler
  },

  // Combine multiple middlewares
  compose: (...middlewares: Array<(req: any) => Promise<NextResponse | null> | NextResponse | null>) => {
    return async (req: AuthenticatedRequest): Promise<NextResponse | null> => {
      for (const middleware of middlewares) {
        const result = await middleware(req);
        if (result) {
          return result; // Stop chain if middleware returns a response
        }
      }
      return null; // Continue to handler
    };
  },

  // Error handler wrapper
  withErrorHandler: (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        return await handler(req);
      } catch (error: any) {
        console.error('API Error:', error);
        
        // Handle validation errors
        if (error.errors && error.statusCode === 400) {
          return NextResponse.json(
            { success: false, message: 'Validation failed', errors: error.errors },
            { status: HTTP_STATUS.BAD_REQUEST }
          );
        }

        // Handle known errors
        if (error.statusCode) {
          return NextResponse.json(
            { success: false, message: error.message },
            { status: error.statusCode }
          );
        }

        // Handle unknown errors
        return NextResponse.json(
          { success: false, message: 'Internal server error' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }
    };
  }
};

export default middleware;