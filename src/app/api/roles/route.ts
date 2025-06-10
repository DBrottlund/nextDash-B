import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';
import { permissions } from '@/lib/permissions';

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

// GET /api/roles - List all roles
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'roles', action: 'read' });
    if (authResult.error) return authResult.error;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const includeInactive = url.searchParams.get('includeInactive') === 'true';

    const offset = (page - 1) * limit;

    let whereClause = includeInactive ? 'WHERE 1=1' : 'WHERE is_active = TRUE';
    let queryParams: any[] = [];

    if (search) {
      whereClause += includeInactive ? ' AND' : ' AND';
      whereClause += ' (name LIKE ? OR description LIKE ?)';
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total FROM roles ${whereClause}`;
    const countResult = await db.query(countQuery, queryParams);
    const total = countResult[0].total;

    const roles = await db.query(
      `SELECT 
        id, name, description, permissions, is_active as isActive,
        created_at as createdAt, updated_at as updatedAt
      FROM roles
      ${whereClause}
      ORDER BY id ASC
      LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    // Parse permissions JSON
    const rolesWithParsedPermissions = roles.map(role => ({
      ...role,
      permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
    }));

    return NextResponse.json({
      success: true,
      data: rolesWithParsedPermissions,
      pagination: {
        current: page,
        pageSize: limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get roles error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'roles', action: 'create' });
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { name, description, permissions: rolePermissions, isActive = true } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if role name already exists
    const existingRole = await db.query(
      'SELECT id FROM roles WHERE name = ?',
      [name]
    );

    if (existingRole.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Role name already exists' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Create role
    const result: any = await db.query(
      `INSERT INTO roles (name, description, permissions, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [name, description, JSON.stringify(rolePermissions || {}), isActive]
    );

    const newRole = await db.query(
      `SELECT 
        id, name, description, permissions, is_active as isActive,
        created_at as createdAt, updated_at as updatedAt
      FROM roles WHERE id = ?`,
      [result.insertId]
    );

    const roleWithParsedPermissions = {
      ...newRole[0],
      permissions: typeof newRole[0].permissions === 'string' ? JSON.parse(newRole[0].permissions) : newRole[0].permissions
    };

    return NextResponse.json({
      success: true,
      data: roleWithParsedPermissions,
      message: 'Role created successfully',
    }, { status: HTTP_STATUS.CREATED });

  } catch (error) {
    console.error('Create role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}