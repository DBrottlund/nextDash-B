'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spin, Result, Button } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: {
    resource: string;
    action: string;
  };
  requireRole?: number; // Minimum role level (1=Admin, 2=Manager, etc.)
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requirePermission,
  requireRole
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return null; // useEffect will handle redirect
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you need admin privileges to access this page."
          extra={
            <Button type="primary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  // Check specific permission requirement
  if (requirePermission && !hasPermission(requirePermission.resource, requirePermission.action)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have permission to access this page."
          extra={
            <Button type="primary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  // Check role level requirement
  if (requireRole && user.roleId > requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Result
          status="403"
          title="403"
          subTitle="Sorry, you don't have sufficient role privileges to access this page."
          extra={
            <Button type="primary" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return <>{children}</>;
}