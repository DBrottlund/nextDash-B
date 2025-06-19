import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';
import { permissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

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

// GET /api/admin/settings - Get all admin settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'admin', action: 'access' });
    if (authResult.error) return authResult.error;

    const settings = await db.query(
      'SELECT setting_key, setting_value, description FROM admin_settings ORDER BY setting_key'
    );

    // Convert array to object for easier frontend consumption
    const settingsObject: Record<string, any> = {};
    settings.forEach((setting: any) => {
      try {
        // Try to parse JSON values
        settingsObject[setting.setting_key] = JSON.parse(setting.setting_value);
      } catch {
        // If not JSON, keep as string
        settingsObject[setting.setting_key] = setting.setting_value;
      }
    });

    return NextResponse.json({
      success: true,
      data: settingsObject,
    });

  } catch (error) {
    console.error('Get admin settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// PUT /api/admin/settings - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request, { resource: 'admin', action: 'access' });
    if (authResult.error) return authResult.error;

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Settings object is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Sync the simple account_created_email_enabled field with the nested structure
    if (settings.account_created_email_enabled !== undefined) {
      if (!settings.transaction_notifications || typeof settings.transaction_notifications !== 'object') {
        settings.transaction_notifications = {
          accountCreated: { email: false, inApp: true },
          accountUpdated: { email: true, inApp: true },
          accountDeleted: { email: true, inApp: true },
          userLogin: { email: false, inApp: false },
          passwordChanged: { email: true, inApp: true },
          profileUpdated: { email: false, inApp: true },
          roleChanged: { email: true, inApp: true },
          securityAlert: { email: true, inApp: true },
          systemMaintenance: { email: true, inApp: true },
          dataExport: { email: true, inApp: true },
        };
      }
      
      if (!settings.transaction_notifications.accountCreated) {
        settings.transaction_notifications.accountCreated = { email: false, inApp: true };
      }
      
      settings.transaction_notifications.accountCreated.email = settings.account_created_email_enabled;
    }

    // Special handling for email verification requirement
    if (settings.email_verification_required === true) {
      // Ensure transaction notifications are enabled at the top level
      settings.transaction_notifications_enabled = true;
      settings.account_created_email_enabled = true;
      
      // Auto-enable Account Created email notifications when email verification is required
      if (settings.transaction_notifications && typeof settings.transaction_notifications === 'object') {
        if (settings.transaction_notifications.accountCreated) {
          settings.transaction_notifications.accountCreated.email = true;
        } else {
          settings.transaction_notifications.accountCreated = { email: true, inApp: true };
        }
      } else {
        // If transaction_notifications doesn't exist, create it with account created email enabled
        settings.transaction_notifications = {
          accountCreated: { email: true, inApp: true },
          accountUpdated: { email: true, inApp: true },
          accountDeleted: { email: true, inApp: true },
          userLogin: { email: false, inApp: false },
          passwordChanged: { email: true, inApp: true },
          profileUpdated: { email: false, inApp: true },
          roleChanged: { email: true, inApp: true },
          securityAlert: { email: true, inApp: true },
          systemMaintenance: { email: true, inApp: true },
          dataExport: { email: true, inApp: true },
        };
      }
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      await db.query(
        `INSERT INTO admin_settings (setting_key, setting_value, updated_at) 
         VALUES ($1, $2, NOW())
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = NOW()`,
        [key, stringValue]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });

  } catch (error) {
    console.error('Update admin settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}