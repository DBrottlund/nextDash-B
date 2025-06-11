'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Spin, Row, Col, Divider, Typography } from 'antd';
import { UserOutlined, UploadOutlined, EditOutlined, SaveOutlined, EyeOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import type { UploadProps } from 'antd';

const { Title, Text } = Typography;

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
  });

  useEffect(() => {
    if (user) {
      const data = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || '',
      };
      
      // Only update if this is the first time or if the user data has a newer avatar
      setProfileData(prevData => {
        // If no previous data, set initial data
        if (!prevData.email) {
          return data;
        }
        
        // If user data has an avatar and it's different from current, use the newer one
        if (user.avatarUrl && user.avatarUrl !== prevData.avatarUrl) {
          return data;
        }
        
        // Otherwise keep existing profile data
        return prevData;
      });
      
      // Always update form with user data for other fields
      form.setFieldsValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatarUrl: form.getFieldValue('avatarUrl') || user.avatarUrl || ''
      });
    }
  }, [user, form]);

  const handleSave = async (values: ProfileData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Profile updated successfully');
        setProfileData(values);
        setEditing(false);
        // Refresh user data to update changes in header
        refreshUser();
      } else {
        message.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue(profileData);
    setEditing(false);
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    action: '/api/upload/avatar',
    accept: 'image/*',
    headers: {
      authorization: `Bearer ${localStorage.getItem('auth_token')}`,
    },
    beforeUpload(file) {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return false;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setLoading(true);
      }
      if (info.file.status === 'done') {
        if (info.file.response?.success) {
          const newAvatarUrl = info.file.response.data.url;
          setProfileData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
          form.setFieldValue('avatarUrl', newAvatarUrl);
          message.success('Avatar uploaded successfully');
          
          // Delay the refresh to allow the database update to complete
          setTimeout(() => {
            refreshUser();
          }, 1000);
        } else {
          message.error(info.file.response?.message || 'Upload failed');
        }
        setLoading(false);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
        setLoading(false);
      }
    },
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Title level={2}>Profile</Title>
        <Text type="secondary">Manage your account information and preferences</Text>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-center">
              {profileData.avatarUrl ? (
                <div style={{ margin: '0 auto 16px auto', width: 120, height: 120 }}>
                  <img
                    src={profileData.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #d9d9d9'
                    }}
                    onError={(e) => {
                      // Fallback to default avatar
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  className="mb-4"
                />
              )}
              
              <Title level={4} className="mb-2">
                {profileData.firstName} {profileData.lastName}
              </Title>
              
              <Text type="secondary" className="block mb-4">
                {profileData.email}
              </Text>

              {editing && (
                <Upload {...uploadProps} showUploadList={false}>
                  <Button icon={<UploadOutlined />} loading={loading}>
                    Upload Avatar
                  </Button>
                </Upload>
              )}
            </div>
          </Card>

          <Card className="mt-4">
            <Title level={5}>Account Information</Title>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text type="secondary">Role:</Text>
                <Text>{user?.roleName || 'User'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Status:</Text>
                <Text>{user?.isActive ? 'Active' : 'Inactive'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Email Verified:</Text>
                <Text>{user?.emailVerified ? 'Yes' : 'No'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">Member Since:</Text>
                <Text>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title="Profile Details"
            extra={
              !editing ? (
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={() => form.submit()}
                    loading={loading}
                  >
                    Save Changes
                  </Button>
                </div>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              disabled={!editing}
            >
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      { required: true, message: 'Please enter your first name' },
                      { min: 2, message: 'First name must be at least 2 characters' },
                    ]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      { required: true, message: 'Please enter your last name' },
                      { min: 2, message: 'Last name must be at least 2 characters' },
                    ]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email address' },
                ]}
              >
                <Input placeholder="Enter your email address" disabled />
              </Form.Item>

              <Form.Item
                label="Avatar URL"
                name="avatarUrl"
              >
                <Input placeholder="Avatar image URL (optional)" />
              </Form.Item>
            </Form>
          </Card>

          <Card className="mt-4" title="Security">
            <div className="space-y-4">
              <div>
                <Title level={5}>Password</Title>
                <Text type="secondary" className="block mb-2">
                  Change your password to keep your account secure
                </Text>
                <Button type="default">
                  Change Password
                </Button>
              </div>
              
              <Divider />
              
              <div>
                <Title level={5}>Two-Factor Authentication</Title>
                <Text type="secondary" className="block mb-2">
                  Add an extra layer of security to your account
                </Text>
                <Button type="default" disabled>
                  Enable 2FA (Coming Soon)
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}