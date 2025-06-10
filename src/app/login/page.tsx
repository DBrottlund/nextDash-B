'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert, Checkbox, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { LoginCredentials } from '@/types';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
    // Generate guest fingerprint and redirect
    const guestData = {
      id: `guest_${Date.now()}`,
      role: 'guest',
      permissions: { dashboard: ['read'] }
    };
    
    localStorage.setItem('guest_data', JSON.stringify(guestData));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">Welcome Back</Title>
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
          >
            Continue with Google
          </Button>

          <Button 
            type="dashed"
            onClick={handleGuestLogin}
            className="w-full h-12"
            size="large"
          >
            Continue as Guest
          </Button>
        </div>

        <div className="text-center mt-6">
          <Text type="secondary">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary-600 hover:text-primary-500 font-medium">
              Sign up
            </Link>
          </Text>
        </div>

        <div className="text-center mt-4">
          <Text type="secondary" className="text-xs">
            Demo Account: admin@nextdash.com / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
}