import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';

// Helper to authenticate user
async function authenticateUser(request: NextRequest) {
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

  return { user };
}


// GET /api/user/settings - Get user settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Try to get existing settings
    const existingSettings = await db.queryOne(
      'SELECT settings FROM user_settings WHERE user_id = $1',
      [user.id]
    );

    let settings = {};
    if (existingSettings) {
      try {
        settings = JSON.parse(existingSettings.settings);
      } catch (error) {
        console.error('Failed to parse user settings:', error);
        settings = {};
      }
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT /api/user/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Settings object is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const settingsJson = JSON.stringify(settings);

    // Upsert user settings
    await db.execute(
      `INSERT INTO user_settings (user_id, settings, updated_at) 
       VALUES ($1, $2, NOW())
       ON DUPLICATE KEY UPDATE 
       settings = VALUES(settings), 
       updated_at = NOW()`,
      [user.id, settingsJson]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });

  } catch (error) {
    console.error('Update user settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// DELETE /api/user/settings - Reset user settings to defaults
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (authResult.error) return authResult.error;

    const { user } = authResult;

    // Delete user settings (will reset to defaults)
    await db.execute(
      'DELETE FROM user_settings WHERE user_id = $1',
      [user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings reset to defaults',
    });

  } catch (error) {
    console.error('Reset user settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}