import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { loginSchema, validateSchema } from '@/lib/validation';
import { HTTP_STATUS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = validateSchema(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid input data',
          errors: validation.errors 
        },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const { email, password } = validation.data!;

    // Get user by email
    const user = await auth.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Verify password
    const isValidPassword = await auth.verifyPassword(password, (user as any).passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: HTTP_STATUS.UNAUTHORIZED }
      );
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    const token = auth.generateToken(payload);
    const refreshToken = auth.generateRefreshToken(payload);

    // Create session
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    await auth.createSession(user.id, token, refreshToken, userAgent, ipAddress);

    // Update last login
    await auth.updateLastLogin(user.id);

    // Remove password hash from response
    const { passwordHash, ...userResponse } = user as any;

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      refreshToken,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}