import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

// POST /api/upload/avatar - Upload user avatar
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

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

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload an image file.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File too large. Maximum size is 5MB.' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const uniqueId = crypto.randomUUID();
    const fileName = `avatar_${payload.userId}_${uniqueId}.${fileExtension}`;
    
    // Save file to public/uploads/avatars directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);
    
    // Create URL path for the uploaded file
    const avatarUrl = `/uploads/avatars/${fileName}`;
    
    // Update user's avatar in database
    await db.execute(
      'UPDATE users SET avatar_url = ?, updated_at = NOW() WHERE id = ?',
      [avatarUrl, payload.userId]
    );

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        url: avatarUrl
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}