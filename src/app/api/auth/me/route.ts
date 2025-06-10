import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { HTTP_STATUS } from '@/lib/constants';

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
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}