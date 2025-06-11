import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email';
import { HTTP_STATUS } from '@/lib/constants';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST /api/auth/forgot-password - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email address',
          errors: validation.error.errors
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email } = validation.data;

    // Send password reset email
    const result = await emailService.sendPasswordResetEmail(email);

    if (result.success) {
      // Always return success for security (don't reveal if email exists)
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    } else {
      console.error('Failed to send password reset email:', result.error);
      return NextResponse.json(
        { success: false, message: 'Failed to send password reset email' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}