import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { HTTP_STATUS } from '@/lib/constants';

// GET /api/settings/public - Get public admin settings that all users can see
export async function GET(request: NextRequest) {
  try {
    // List of settings that are safe to expose to all authenticated users
    const publicSettings = [
      'app_name',
      'app_logo_url', 
      'theme_mode',
      'css_style',
      'allow_guest_access',
      'allow_user_signup',
      'front_page_mode'
    ];

    const placeholders = publicSettings.map((_, index) => `$${index + 1}`).join(',');
    const settings = await db.query(
      `SELECT setting_key, setting_value FROM admin_settings WHERE setting_key IN (${placeholders})`,
      publicSettings
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
    console.error('Get public settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}