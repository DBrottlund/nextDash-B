'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        message.success(data.message);
      } else {
        message.error(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      message.error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <MailOutlined className="h-6 w-6 text-green-600" />
              </div>
              <Title level={2} className="text-center">
                Check Your Email
              </Title>
              <Text type="secondary" className="text-center block mb-6">
                We've sent a password reset link to your email address.
                Please check your inbox and follow the instructions.
              </Text>
              
              <Alert
                message="Email Sent Successfully"
                description="If you don't see the email, please check your spam folder. The reset link will expire in 15 minutes."
                type="success"
                showIcon
                className="mb-6"
              />

              <div className="space-y-4">
                <Button
                  type="default"
                  onClick={() => setEmailSent(false)}
                  block
                >
                  Send Another Email
                </Button>
                
                <Link href="/login">
                  <Button 
                    type="primary"
                    icon={<ArrowLeftOutlined />}
                    block
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
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
            Reset Your Password
          </Title>
          <Text type="secondary" className="text-center block">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </div>

        <Card className="shadow-lg">
          <Form
            form={form}
            name="forgot-password"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email Address"
              rules={[
                { required: true, message: 'Please enter your email address' },
                { type: 'email', message: 'Please enter a valid email address' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="your.email@example.com"
                autoComplete="email"
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
                Send Reset Link
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

        <div className="text-center">
          <Text type="secondary" className="text-sm">
            Remember your password?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
}