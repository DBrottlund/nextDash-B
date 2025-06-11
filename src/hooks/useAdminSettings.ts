'use client';

import { useState, useEffect } from 'react';

interface AdminSettings {
  app_name?: string;
  app_logo_url?: string;
  theme_mode?: string;
  css_style?: string;
  allow_guest_access?: boolean;
  allow_user_signup?: boolean;
  require_user_approval?: boolean;
  front_page_mode?: string;
  front_page_html?: string;
  [key: string]: any;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // Try public settings first (for basic info like app name)
      const response = await fetch('/api/settings/public');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch settings');
      }
    } catch (err) {
      setError('Failed to fetch admin settings');
      console.error('Admin settings fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AdminSettings>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ settings: newSettings }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state immediately
        setSettings(prev => ({ ...prev, ...newSettings }));
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      console.error('Admin settings update error:', err);
      return { success: false, message: 'Failed to update settings' };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    updateSettings,
  };
}