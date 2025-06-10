'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert, Checkbox, Divider, Spin } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { LoginCredentials } from '@/types';

const { Title, Text } = Typography;

interface AdminSettings {
  front_page_mode: string;
  front_page_html: string;
  allow_guest_access: boolean;
  allow_user_signup: boolean;
  app_name: string;
  app_logo_url: string;
}

export default function HomePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated first
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
      return;
    }
    
    fetchSettings();
  }, [router]);

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.data);
      } else {
        // If admin settings fail, use defaults (likely not configured yet)
        setSettings({
          front_page_mode: 'login',
          front_page_html: '',
          allow_guest_access: false,
          allow_user_signup: true,
          app_name: 'NextDash-B',
          app_logo_url: ''
        });
      }
    } catch (error) {
      // Use defaults on error
      setSettings({
        front_page_mode: 'login',
        front_page_html: '',
        allow_guest_access: false,
        allow_user_signup: true,
        app_name: 'NextDash-B',
        app_logo_url: ''
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogin = async (values: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        // Store tokens
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    if (!settings?.allow_guest_access) {
      setError('Guest access is not enabled');
      return;
    }

    // Generate guest fingerprint and redirect
    const guestData = {
      id: `guest_${Date.now()}`,
      role: 'guest',
      permissions: { dashboard: ['read'] }
    };
    
    localStorage.setItem('guest_data', JSON.stringify(guestData));
    router.push('/dashboard');
  };

  // Show loading while fetching settings
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Show custom HTML page if configured
  if (settings?.front_page_mode === 'html' && settings.front_page_html) {
    return (
      <div className="min-h-screen">
        <div 
          dangerouslySetInnerHTML={{ __html: settings.front_page_html }}
          className="h-full"
        />
        
        {/* Login button overlay for admin access */}
        <div className="fixed bottom-4 right-4">
          <Button
            type="primary"
            size="large"
            onClick={() => router.push('/login')}
            style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)' }}
          >
            Login
          </Button>
        </div>
      </div>
    );
  }

  // Default login page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          {settings?.app_logo_url && (
            <img 
              src={settings.app_logo_url} 
              alt={settings.app_name || 'Logo'} 
              className="mx-auto mb-4 h-16 w-auto"
            />
          )}
          <Title level={2} className="mb-2">
            Welcome to {settings?.app_name || 'NextDash-B'}
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-4"
            closable
            onClose={() => setError(null)}
          />
        )}

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item>
              <Link href="/forgot-password" className="text-primary-600 hover:text-primary-500">
                Forgot password?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-12 text-lg"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider>
          <Text type="secondary">Or continue with</Text>
        </Divider>

        <div className="space-y-3">
          <Button 
            icon={<GoogleOutlined />}
            className="w-full h-12"
            size="large"
            disabled
          >
            Continue with Google
          </Button>

          {settings?.allow_guest_access && (
            <Button 
              type="dashed"
              onClick={handleGuestLogin}
              className="w-full h-12"
              size="large"
            >
              Continue as Guest
            </Button>
          )}
        </div>

        {settings?.allow_user_signup && (
          <div className="text-center mt-6">
            <Text type="secondary">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                Sign up
              </Link>
            </Text>
          </div>
        )}

        <div className="text-center mt-4">
          <Text type="secondary" className="text-xs">
            Demo Account: admin@nextdash.com / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
}