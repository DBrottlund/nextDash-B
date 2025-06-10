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

// GET /api/roles/[id] - Get a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'roles', action: 'read' });
    if (authResult.error) return authResult.error;

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const roles = await db.query(
      `SELECT 
        id, name, description, permissions, is_active as isActive,
        created_at as createdAt, updated_at as updatedAt
      FROM roles 
      WHERE id = ?`,
      [roleId]
    );

    if (roles.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const role = {
      ...roles[0],
      permissions: typeof roles[0].permissions === 'string' ? JSON.parse(roles[0].permissions) : roles[0].permissions
    };

    return NextResponse.json({
      success: true,
      data: role,
    });

  } catch (error) {
    console.error('Get role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT /api/roles/[id] - Update a role
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'roles', action: 'update' });
    if (authResult.error) return authResult.error;

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if it's a system role (Admin, Manager, User) - prevent editing system roles
    if (roleId <= 3) {
      return NextResponse.json(
        { success: false, message: 'System roles cannot be modified' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { name, description, permissions: rolePermissions, isActive } = body;

    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, message: 'Name and description are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if role exists
    const existingRole = await db.query(
      'SELECT id FROM roles WHERE id = ?',
      [roleId]
    );

    if (existingRole.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if role name already exists (excluding current role)
    const duplicateRole = await db.query(
      'SELECT id FROM roles WHERE name = ? AND id != ?',
      [name, roleId]
    );

    if (duplicateRole.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Role name already exists' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update role
    await db.query(
      `UPDATE roles 
       SET name = ?, description = ?, permissions = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, description, JSON.stringify(rolePermissions || {}), isActive, roleId]
    );

    const updatedRole = await db.query(
      `SELECT 
        id, name, description, permissions, is_active as isActive,
        created_at as createdAt, updated_at as updatedAt
      FROM roles WHERE id = ?`,
      [roleId]
    );

    const roleWithParsedPermissions = {
      ...updatedRole[0],
      permissions: typeof updatedRole[0].permissions === 'string' ? JSON.parse(updatedRole[0].permissions) : updatedRole[0].permissions
    };

    return NextResponse.json({
      success: true,
      data: roleWithParsedPermissions,
      message: 'Role updated successfully',
    });

  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'roles', action: 'delete' });
    if (authResult.error) return authResult.error;

    const roleId = parseInt(params.id);
    if (isNaN(roleId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if it's a system role (Admin, Manager, User) - prevent deleting system roles
    if (roleId <= 3) {
      return NextResponse.json(
        { success: false, message: 'System roles cannot be deleted' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Check if role exists
    const existingRole = await db.query(
      'SELECT id FROM roles WHERE id = ?',
      [roleId]
    );

    if (existingRole.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Role not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Check if role is being used by any users
    const usersWithRole = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE role_id = ? AND is_active = TRUE',
      [roleId]
    );

    if (usersWithRole[0].count > 0) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete role: role is assigned to active users' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Soft delete role
    await db.query(
      'UPDATE roles SET is_active = FALSE, updated_at = NOW() WHERE id = ?',
      [roleId]
    );

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });

  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}