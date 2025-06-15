import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

// GET /api/auth/verify-email?token=xxx - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find the verification record
    const verification = await db.queryOne(
      'SELECT * FROM email_verifications WHERE token_hash = ? AND expires_at > NOW()',
      [hashedToken]
    );

    if (!verification) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Update user email_verified status
    await db.execute(
      'UPDATE users SET email_verified = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [verification.user_id]
    );

    // Delete the verification token (one-time use)
    await db.execute(
      'DELETE FROM email_verifications WHERE id = ?',
      [verification.id]
    );

    // Redirect to success page or login
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?verified=true`;
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}