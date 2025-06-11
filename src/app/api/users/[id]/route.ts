import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { updateUserSchema, validateSchema } from '@/lib/validation';
import { HTTP_STATUS } from '@/lib/constants';
import { permissions } from '@/lib/permissions';
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

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'read' });
    if (authResult.error) return authResult.error;

    // Additional check: Only Manager (role_id <= 2) and above can view user details
    if (!permissions.isManagerOrAbove(authResult.user!)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Manager role or higher required.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const user = await db.queryOne(
      `SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt, 
        u.updated_at as updatedAt, u.last_login as lastLogin,
        r.name as roleName, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?`,
      [userId]
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Parse permissions if they exist
    if (user.permissions) {
      user.permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'update' });
    if (authResult.error) return authResult.error;

    // Additional check: Only Manager (role_id <= 2) and above can update users
    if (!permissions.isManagerOrAbove(authResult.user!)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Manager role or higher required.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const body = await request.json();
    const validation = validateSchema(updateUserSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: validation.errors },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user exists and get their role for permission check
    const existingUser = await db.queryOne('SELECT id, role_id FROM users WHERE id = ?', [userId]);
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Role hierarchy check: Cannot update users with higher permissions
    if (existingUser.role_id < authResult.user!.roleId) {
      return NextResponse.json(
        { success: false, message: 'You cannot update users with higher permissions than your own role.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const updateData = validation.data!;

    // If roleId is being updated, check role hierarchy
    if (updateData.roleId !== undefined) {
      // Target role must have equal or lower permissions (higher or equal role_id)
      if (updateData.roleId < authResult.user!.roleId) {
        return NextResponse.json(
          { success: false, message: 'You cannot assign roles with higher permissions than your own role.' },
          { status: HTTP_STATUS.FORBIDDEN }
        );
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key === 'firstName' ? 'first_name' : 
                     key === 'lastName' ? 'last_name' :
                     key === 'roleId' ? 'role_id' :
                     key === 'isActive' ? 'is_active' :
                     key === 'emailVerified' ? 'email_verified' :
                     key === 'avatarUrl' ? 'avatar_url' : key;
        updateFields.push(`${dbKey} = ?`);
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // If email is being updated, check for conflicts
    if (updateData.email) {
      const emailConflict = await db.queryOne(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [updateData.email, userId]
      );
      if (emailConflict) {
        return NextResponse.json(
          { success: false, message: 'Email already exists' },
          { status: HTTP_STATUS.CONFLICT }
        );
      }
    }

    // Update user
    updateValues.push(userId);
    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      updateValues
    );

    // Get updated user
    const updatedUser = await db.queryOne(
      `SELECT 
        u.id, u.email, u.first_name as firstName, u.last_name as lastName,
        u.role_id as roleId, u.avatar_url as avatarUrl, u.is_active as isActive,
        u.email_verified as emailVerified, u.created_at as createdAt, 
        u.updated_at as updatedAt, u.last_login as lastLogin,
        r.name as roleName
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?`,
      [userId]
    );

    // Send account updated transaction notification
    if (updatedUser) {
      transactionNotificationService.sendTransactionNotification({
        userId: updatedUser.id,
        transactionType: 'accountUpdated',
        title: 'Account Updated',
        message: `Your account information has been updated by an administrator.`,
        data: {
          updatedFields: Object.keys(updateData),
          updatedBy: authResult.user!.id,
        },
      }).catch(error => {
        console.error('Failed to send account updated notification:', error);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'delete' });
    if (authResult.error) return authResult.error;
    
    const currentUser = authResult.user!;

    // Additional check: Only Admin (role_id = 1) can delete users
    if (!permissions.isAdmin(currentUser)) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin role required for user deletion.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Prevent self-deletion
    if (currentUser.id === userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user exists and get their role for permission check
    const userToDelete = await db.queryOne('SELECT id, email, role_id FROM users WHERE id = ?', [userId]);
    if (!userToDelete) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Role hierarchy check: Cannot delete users with higher permissions
    if (userToDelete.role_id < currentUser.roleId) {
      return NextResponse.json(
        { success: false, message: 'You cannot delete users with higher permissions than your own role.' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Delete user (this will cascade delete sessions due to foreign key)
    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}