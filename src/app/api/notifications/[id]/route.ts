import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';

// PUT /api/notifications/[id] - Mark notification as read/unread
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const payload = auth.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const notificationId = parseInt(params.id);
    const body = await request.json();
    const { isRead } = body;

    if (typeof isRead !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'isRead must be a boolean' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify notification belongs to user
    const notification = await db.queryOne(
      'SELECT id, user_id FROM notifications WHERE id = $1',
      [notificationId]
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (notification.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Update notification
    await db.execute(
      `UPDATE notifications 
       SET is_read = $1, read_at = ${isRead ? 'NOW()' : 'NULL'}
       WHERE id = $2`,
      [isRead, notificationId]
    );

    return NextResponse.json({
      success: true,
      message: `Notification marked as ${isRead ? 'read' : 'unread'}`
    });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/notifications/[id] - Delete notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const payload = auth.verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    const notificationId = parseInt(params.id);

    // Verify notification belongs to user
    const notification = await db.queryOne(
      'SELECT id, user_id FROM notifications WHERE id = $1',
      [notificationId]
    );

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    if (notification.user_id !== payload.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    // Delete notification
    await db.execute('DELETE FROM notifications WHERE id = $1', [notificationId]);

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}