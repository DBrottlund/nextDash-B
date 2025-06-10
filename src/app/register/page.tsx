'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Input, Button, Card, Typography, Alert, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import Link from 'next/link';

const { Title, Text } = Typography;

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (values: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <div className="text-center">
            <Title level={2} className="mb-4 text-green-600">Registration Successful!</Title>
            <Text>Your account has been created. You will be redirected to the login page shortly.</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <Title level={2} className="mb-2">Create Account</Title>
          <Text type="secondary">Join NextDash-B today</Text>
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
          name="register"
          onFinish={handleRegister}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[
              { required: true, message: 'Please enter your first name' },
              { min: 2, message: 'First name must be at least 2 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your first name"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[
              { required: true, message: 'Please enter your last name' },
              { min: 2, message: 'Last name must be at least 2 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Enter your last name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Enter your email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
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
              placeholder="Confirm your password"
            />
          </Form.Item>

          <Form.Item
            name="acceptTerms"
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Please accept the terms and conditions'))
              }
            ]}
          >
            <Checkbox>
              I agree to the <Link href="/terms" className="text-primary-600 hover:text-primary-500">Terms and Conditions</Link>
            </Checkbox>
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-full h-12 text-lg"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-6">
          <Text type="secondary">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:text-primary-500 font-medium">
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}