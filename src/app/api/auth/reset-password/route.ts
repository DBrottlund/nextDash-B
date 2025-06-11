import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { HTTP_STATUS } from '@/lib/constants';
import { z } from 'zod';

const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

// GET /api/auth/reset-password?token=xxx - Verify reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const validation = verifyTokenSchema.safeParse({ token });
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid token',
          errors: validation.error.errors
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Verify token
    const result = await emailService.verifyPasswordResetToken(validation.data.token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Token is valid',
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Invalid or expired token' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

  } catch (error) {
    console.error('Reset password token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resetPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input',
          errors: validation.error.errors
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { token, password } = validation.data;

    // Reset password
    const result = await emailService.resetPasswordWithToken(token, password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to reset password' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}