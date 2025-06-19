import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';

// GET /api/notifications - Get user's notifications
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = ['user_id = $1'];
    let params: any[] = [payload.userId];

    if (isRead !== null && isRead !== undefined) {
      whereConditions.push(`is_read = $${params.length + 1}`);
      params.push(isRead === 'true');
    }

    if (type) {
      whereConditions.push(`type = $${params.length + 1}`);
      params.push(type);
    }

    // Add expiration filter
    whereConditions.push('(expires_at IS NULL OR expires_at > NOW())');

    const whereClause = whereConditions.join(' AND ');

    // Get notifications
    const notifications = await db.query(
      `SELECT 
        id, user_id as userId, title, message, type, is_read as isRead,
        action_url as actionUrl, action_text as actionText,
        created_at as createdAt, read_at as readAt, expires_at as expiresAt
       FROM notifications 
       WHERE ${whereClause}
       ORDER BY created_at DESC 
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const [{ count }] = await db.query(
      `SELECT COUNT(*) as count FROM notifications WHERE ${whereClause}`,
      params
    );

    // Get unread count
    const [{ unreadCount }] = await db.query(
      `SELECT COUNT(*) as unreadCount FROM notifications 
       WHERE user_id = $1 AND is_read = FALSE AND (expires_at IS NULL OR expires_at > NOW())`,
      [payload.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/notifications - Create notification (admin only)
export async function POST(request: NextRequest) {
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

    // Check if user is admin
    const user = await auth.getUserById(payload.userId);
    if (!user || user.roleId !== 1) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: HTTP_STATUS.FORBIDDEN }
      );
    }

    const body = await request.json();
    const { userId, title, message, type = 'info', actionUrl, actionText, expiresAt } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, message: 'User ID and title are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, action_url, action_text, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [userId, title, message, type, actionUrl, actionText, expiresAt]
    );

    return NextResponse.json({
      success: true,
      message: 'Notification created successfully',
      data: { id: result.rows[0].id }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}