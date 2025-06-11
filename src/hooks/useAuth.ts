'use client';

import { useState, useEffect } from 'react';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (!token || !storedUser) {
        setLoading(false);
        return;
      }

      // Verify token with server
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear storage
          logout();
        }
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }

        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('guest_data');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions[resource]?.includes(action) || false;
  };

  const isAdmin = (): boolean => {
    return user?.roleId === 1 || hasPermission('admin', 'access');
  };

  const isManagerOrAbove = (): boolean => {
    return user ? user.roleId <= 2 : false;
  };

  const canAccessUsers = (): boolean => {
    return hasPermission('users', 'read') || isManagerOrAbove();
  };

  const canManageUsers = (): boolean => {
    return hasPermission('users', 'create') || hasPermission('users', 'update') || hasPermission('users', 'delete');
  };

  const canAccessRoles = (): boolean => {
    return hasPermission('roles', 'read') || isAdmin();
  };

  const canAccessSettings = (): boolean => {
    return user ? user.roleId <= 3 : false; // Allow Admin, Manager, and User
  };

  const refreshUser = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    refreshUser,
    hasPermission,
    isAdmin,
    isManagerOrAbove,
    canAccessUsers,
    canManageUsers,
    canAccessRoles,
    canAccessSettings,
  };
}