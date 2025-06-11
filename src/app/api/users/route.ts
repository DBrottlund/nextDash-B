import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createUserSchema, userFiltersSchema, validateSchema } from '@/lib/validation';
import { HTTP_STATUS } from '@/lib/constants';
import { permissions } from '@/lib/permissions';
import { emailService } from '@/lib/email';
import { transactionNotificationService } from '@/lib/notifications';

// Helper to authenticate and authorize requests
async function authenticateRequest(request: NextRequest, requiredPermission: { resource: string; action: string }) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
               request.cookies.get('auth_token')?.value;

  if (!token) {
    return { error: NextResponse.json({ success: false, message: 'Authentication required' }, { status: HTTP_STATUS.UNAUTHORIZED }) };
  }

  const payload = auth.verifyToken(token);
  if (!payload) {
    return { error: NextResponse.json({ success: false, message: 'Invalid token' }, { status: HTTP_STATUS.UNAUTHORIZED }) };
  }

  const user = await auth.getUserById(payload.userId);
  if (!user) {
    return { error: NextResponse.json({ success: false, message: 'User not found' }, { status: HTTP_STATUS.UNAUTHORIZED }) };
  }

  if (!permissions.hasPermission(user, requiredPermission.resource, requiredPermission.action)) {
    return { error: NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: HTTP_STATUS.FORBIDDEN }) };
  }

  return { user };
}

// GET /api/users - List users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'read' });
    if (authResult.error) return authResult.error;

    // Additional check: Only Manager (role_id <= 2) and above can access users list
    if (!permissions.isManagerOrAbove(authResult.user!)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Manager role or higher required.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      role: searchParams.get('role') ? parseInt(searchParams.get('role')!) : undefined,
      active: searchParams.get('active') ? searchParams.get('active') === 'true' : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 100),
    };

    const validation = validateSchema(userFiltersSchema, filters);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid filters', errors: validation.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const validFilters = validation.data!;
    const offset = ((validFilters.page ?? 1) - 1) * (validFilters.limit ?? 10);

    // Build query
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (validFilters.role !== undefined) {
      whereClause += ' AND u.role_id = ?';
      params.push(validFilters.role);
    }

    if (validFilters.active !== undefined) {
      whereClause += ' AND u.is_active = ?';
      params.push(validFilters.active);
    }

    if (validFilters.search) {
      whereClause += ' AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
      const searchParam = `%${validFilters.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
    `;
    const [countResult] = await db.query<{ total: number }>(countQuery, params);
    const total = countResult.total;

    // Get users
    const usersQuery = `
      SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt, 
        u.updated_at as updatedAt, u.last_login as lastLogin,
        r.name as roleName
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;
    params.push(validFilters.limit, offset);
    
    const users = await db.query(usersQuery, params);

    const totalPages = Math.ceil(total / (validFilters.limit ?? 10));

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page: validFilters.page,
        limit: validFilters.limit,
        total,
        totalPages,
      },
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'create' });
    if (authResult.error) return authResult.error;

    // Additional check: Only Manager (role_id <= 2) and above can create users
    if (!permissions.isManagerOrAbove(authResult.user!)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Manager role or higher required.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const body = await request.json();
    const validation = validateSchema(createUserSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: validation.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email, password, firstName, lastName, roleId } = validation.data!;

    // Role hierarchy check: Users can only create users with equal or lower permissions
    // Lower role_id = higher permissions, so target roleId must be >= current user's roleId
    if (roleId < authResult.user!.roleId) {
      return NextResponse.json(
        { success: false, message: 'You cannot create users with higher permissions than your own role.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Check if user already exists
    const existingUser = await auth.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: HTTP_STATUS.CONFLICT }
      );
    }

    // Hash password
    const passwordHash = await auth.hashPassword(password);

    // Create user
    const result = await db.execute(
      `INSERT INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified)
       VALUES (?, ?, ?, ?, ?, TRUE, FALSE)`,
      [email, passwordHash, roleId, firstName, lastName]
    );

    // Get created user
    const newUser = await db.queryOne(
      `SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt,
        r.name as roleName
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?`,
      [result.insertId]
    );

    // Get admin settings to check if email verification is required
    const emailVerificationRequired = await db.queryOne(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
      ['email_verification_required']
    );
    const requireVerification = emailVerificationRequired?.setting_value === 'true';

    // Send welcome email and transaction notification (don't block response if they fail)
    if (newUser) {
      console.log(`Creating user ${newUser.email}, requireVerification: ${requireVerification}`);
      
      // Always send the welcome email with verification logic
      emailService.sendWelcomeEmail({
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        userId: newUser.id,
        requireVerification: requireVerification,
      }).then(result => {
        console.log('Welcome email result:', result);
      }).catch(error => {
        console.error('Failed to send welcome email:', error);
      });

      // Only send transaction notification if verification is NOT required (to avoid duplicate emails)
      if (!requireVerification) {
        transactionNotificationService.sendTransactionNotification({
          userId: newUser.id,
          transactionType: 'accountCreated',
          title: 'Welcome to NextDash-B!',
          message: `Your account has been successfully created. Welcome to NextDash-B, ${newUser.firstName}!`,
          data: {
            userId: newUser.id,
            email: newUser.email,
            roleName: newUser.roleName,
          },
        }).catch(error => {
          console.error('Failed to send account created notification:', error);
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    }, { status: HTTP_STATUS.CREATED });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}