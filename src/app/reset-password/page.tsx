'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert, Spin } from 'antd';
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const { Title, Text } = Typography;

export default function ResetPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('Invalid reset link');
      router.push('/forgot-password');
      return;
    }

    // Verify token on mount
    verifyToken();
  }, [token, router]);

  const verifyToken = async () => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setTokenValid(true);
      } else {
        message.error(data.message || 'Invalid or expired reset link');
        router.push('/forgot-password');
      }
    } catch (error) {
      message.error('Failed to verify reset link');
      router.push('/forgot-password');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResetSuccess(true);
        message.success(data.message);
      } else {
        message.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      message.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="shadow-lg">
          <div className="text-center py-8">
            <Spin size="large" />
            <Title level={4} className="mt-4">
              Verifying Reset Link...
            </Title>
          </div>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckCircleOutlined className="h-6 w-6 text-green-600" />
              </div>
              <Title level={2} className="text-center">
                Password Reset Successful
              </Title>
              <Text type="secondary" className="text-center block mb-6">
                Your password has been successfully reset. You can now log in with your new password.
              </Text>
              
              <Link href="/login">
                <Button 
                  type="primary"
                  size="large"
                  block
                >
                  Continue to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Title level={2} className="text-center">
            Set New Password
          </Title>
          <Text type="secondary" className="text-center block">
            Enter your new password below.
          </Text>
        </div>

        <Card className="shadow-lg">
          <Alert
            message="Security Requirements"
            description="Your password must be at least 8 characters long."
            type="info"
            showIcon
            className="mb-6"
          />

          <Form
            form={form}
            name="reset-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="password"
              label="New Password"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters long' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm New Password"
              rules={[
                { required: true, message: 'Please confirm your new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Reset Password
              </Button>
            </Form.Item>

            <div className="text-center">
              <Link href="/login">
                <Button 
                  type="link" 
                  icon={<ArrowLeftOutlined />}
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
}