'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface UserSettings {
  // App-specific settings that can be added later
  notifications: {
    email: boolean;
    inApp: boolean;
  };
  transactionNotifications: {
    accountCreated: {
      email: boolean;
      inApp: boolean;
    };
    accountUpdated: {
      email: boolean;
      inApp: boolean;
    };
    accountDeleted: {
      email: boolean;
      inApp: boolean;
    };
    userLogin: {
      email: boolean;
      inApp: boolean;
    };
    passwordChanged: {
      email: boolean;
      inApp: boolean;
    };
    profileUpdated: {
      email: boolean;
      inApp: boolean;
    };
    roleChanged: {
      email: boolean;
      inApp: boolean;
    };
    securityAlert: {
      email: boolean;
      inApp: boolean;
    };
    systemMaintenance: {
      email: boolean;
      inApp: boolean;
    };
    dataExport: {
      email: boolean;
      inApp: boolean;
    };
  };
  preferences: {
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
  };
  ui: {
    compactMode: boolean;
    showWelcomeMessage: boolean;
    defaultView: string;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    email: true,
    inApp: true,
  },
  transactionNotifications: {
    accountCreated: {
      email: true,
      inApp: true,
    },
    accountUpdated: {
      email: true,
      inApp: true,
    },
    accountDeleted: {
      email: true,
      inApp: true,
    },
    userLogin: {
      email: true,
      inApp: true,
    },
    passwordChanged: {
      email: true,
      inApp: true,
    },
    profileUpdated: {
      email: true,
      inApp: true,
    },
    roleChanged: {
      email: true,
      inApp: true,
    },
    securityAlert: {
      email: true,
      inApp: true,
    },
    systemMaintenance: {
      email: true,
      inApp: true,
    },
    dataExport: {
      email: true,
      inApp: true,
    },
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
  },
  ui: {
    compactMode: false,
    showWelcomeMessage: true,
    defaultView: 'dashboard',
  },
  privacy: {
    profileVisible: true,
    activityVisible: false,
  },
};

export function useUserSettings() {
  const { user, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [isAuthenticated, user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user) {
        // Load from database for authenticated users
        await loadFromDatabase();
      } else {
        // Load from localStorage for guests
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load user settings:', error);
      // Fallback to default settings
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const deepMerge = (target: any, source: any): any => {
    const result = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  const loadFromDatabase = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          // Deep merge with defaults to ensure all fields exist and new defaults apply
          setSettings(deepMerge(defaultSettings, data.settings));
        } else {
          setSettings(defaultSettings);
        }
      } else {
        // Fallback to localStorage if API fails
        loadFromLocalStorage();
      }
    } catch (error) {
      console.error('Failed to load settings from database:', error);
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('user_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Deep merge with defaults to ensure all fields exist and new defaults apply
        setSettings(deepMerge(defaultSettings, parsedSettings));
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Failed to parse settings from localStorage:', error);
      setSettings(defaultSettings);
    }
  };

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      if (isAuthenticated && user) {
        // Save to database for authenticated users
        await saveToDatabase(updatedSettings);
      } else {
        // Save to localStorage for guests
        saveToLocalStorage(updatedSettings);
      }
      
      setSettings(updatedSettings);
      return { success: true };
    } catch (error) {
      console.error('Failed to save user settings:', error);
      return { success: false, message: 'Failed to save settings' };
    } finally {
      setSaving(false);
    }
  };

  const saveToDatabase = async (settingsToSave: UserSettings) => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/user/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ settings: settingsToSave }),
    });

    if (!response.ok) {
      // If database save fails, fallback to localStorage
      console.warn('Database save failed, falling back to localStorage');
      saveToLocalStorage(settingsToSave);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to save to database');
    }
  };

  const saveToLocalStorage = (settingsToSave: UserSettings) => {
    localStorage.setItem('user_settings', JSON.stringify(settingsToSave));
  };

  const resetSettings = async () => {
    return await saveSettings(defaultSettings);
  };

  const updateNotificationSettings = async (notifications: Partial<UserSettings['notifications']>) => {
    return await saveSettings({
      notifications: { ...settings.notifications, ...notifications }
    });
  };

  const updatePreferences = async (preferences: Partial<UserSettings['preferences']>) => {
    return await saveSettings({
      preferences: { ...settings.preferences, ...preferences }
    });
  };

  const updateUISettings = async (ui: Partial<UserSettings['ui']>) => {
    return await saveSettings({
      ui: { ...settings.ui, ...ui }
    });
  };

  const updatePrivacySettings = async (privacy: Partial<UserSettings['privacy']>) => {
    return await saveSettings({
      privacy: { ...settings.privacy, ...privacy }
    });
  };

  const updateTransactionNotifications = async (transactionNotifications: Partial<UserSettings['transactionNotifications']>) => {
    return await saveSettings({
      transactionNotifications: { ...settings.transactionNotifications, ...transactionNotifications }
    });
  };

  // Getter functions for easy access
  const isGuestMode = !isAuthenticated;
  const storageType = isAuthenticated ? 'database' : 'localStorage';

  return {
    settings,
    loading,
    saving,
    isGuestMode,
    storageType,
    loadSettings,
    saveSettings,
    resetSettings,
    updateNotificationSettings,
    updateTransactionNotifications,
    updatePreferences,
    updateUISettings,
    updatePrivacySettings,
  };
}