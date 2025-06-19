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

// POST /api/users/[id]/approve - Approve a user
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'update' });
    if (authResult.error) return authResult.error;
    
    const approver = authResult.user;
    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user exists
    const users = await db.query(
      'SELECT id, email, is_approved FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const user = users[0];

    if (user.is_approved) {
      return NextResponse.json(
        { success: false, message: 'User is already approved' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Approve the user
    await db.query(
      `UPDATE users 
       SET is_approved = TRUE, approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2`,
      [approver.id, userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
    });

  } catch (error) {
    console.error('Approve user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/users/[id]/approve - Revoke user approval
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'users', action: 'update' });
    if (authResult.error) return authResult.error;

    const userId = parseInt(params.id);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Check if user exists
    const users = await db.query(
      'SELECT id, email, is_approved FROM users WHERE id = $1',
      [userId]
    );

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const user = users[0];

    if (!user.is_approved) {
      return NextResponse.json(
        { success: false, message: 'User is not currently approved' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Revoke approval
    await db.query(
      `UPDATE users 
       SET is_approved = FALSE, approved_by = NULL, approved_at = NULL, updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({
      success: true,
      message: 'User approval revoked successfully',
    });

  } catch (error) {
    console.error('Revoke user approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}