'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Switch,
  Select,
  Button,
  Row,
  Col,
  Space,
  message,
  Divider,
  Tabs,
  Alert,
  Spin
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ReloadOutlined,
  BellOutlined,
  GlobalOutlined,
  EyeOutlined,
  UserOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const { settings, loading, saving, isGuestMode, storageType, saveSettings, resetSettings } = useUserSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('notifications');

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
    }
  }, [settings, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const result = await saveSettings(values);
      
      if (result.success) {
        message.success('Settings saved successfully');
      } else {
        message.error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      message.error('Please check your inputs');
    }
  };

  const handleReset = async () => {
    const result = await resetSettings();
    if (result.success) {
      form.setFieldsValue(settings);
      message.success('Settings reset to defaults');
    } else {
      message.error('Failed to reset settings');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireRole={3}>
        <div className="p-6 flex justify-center items-center min-h-64">
          <Spin size="large" />
        </div>
      </ProtectedRoute>
    );
  }

  const tabItems = [
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Notification Preferences" size="small">
              <Form.Item
                name={['notifications', 'email']}
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={['notifications', 'inApp']}
                label="In-App Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'transactions',
      label: (
        <span>
          <TransactionOutlined /> Transaction Alerts
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Transaction Notification Settings" size="small">
              <p style={{ marginBottom: 16, color: '#666' }}>
                Configure which transaction events trigger notifications. You can choose to receive notifications via email and/or in-app alerts.
              </p>
              
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Account Events */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>Account Events</h4>
                  

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Account Updated</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When account information is modified</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'accountUpdated', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'accountUpdated', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Account Deleted</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When an account is removed</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'accountDeleted', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'accountDeleted', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Security Events */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>Security Events</h4>
                  
                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>User Login</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When someone logs into your account</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'userLogin', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'userLogin', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Password Changed</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When your password is updated</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'passwordChanged', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'passwordChanged', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Security Alert</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>Important security warnings</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'securityAlert', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'securityAlert', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Profile & System Events */}
                <div>
                  <h4 style={{ margin: '0 0 12px 0', color: '#1890ff' }}>Profile & System Events</h4>
                  
                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Profile Updated</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When profile information changes</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'profileUpdated', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'profileUpdated', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Role Changed</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When user permissions are modified</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'roleChanged', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'roleChanged', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>System Maintenance</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>Scheduled downtime and updates</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'systemMaintenance', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'systemMaintenance', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 8]} style={{ marginBottom: 12 }}>
                    <Col span={12}>
                      <strong>Data Export</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When data exports are completed</div>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'dataExport', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Email
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item name={['transactionNotifications', 'dataExport', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'preferences',
      label: (
        <span>
          <GlobalOutlined /> Preferences
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Application Preferences" size="small">
              <Form.Item
                name={['preferences', 'language']}
                label="Language"
              >
                <Select>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['preferences', 'timezone']}
                label="Timezone"
              >
                <Select>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">Eastern Time</Option>
                  <Option value="America/Chicago">Central Time</Option>
                  <Option value="America/Denver">Mountain Time</Option>
                  <Option value="America/Los_Angeles">Pacific Time</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['preferences', 'dateFormat']}
                label="Date Format"
              >
                <Select>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name={['preferences', 'currency']}
                label="Currency"
              >
                <Select>
                  <Option value="USD">USD ($)</Option>
                  <Option value="EUR">EUR (€)</Option>
                  <Option value="GBP">GBP (£)</Option>
                  <Option value="JPY">JPY (¥)</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'ui',
      label: (
        <span>
          <EyeOutlined /> Interface
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="User Interface Settings" size="small">
              <Form.Item
                name={['ui', 'compactMode']}
                label="Compact Mode"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={['ui', 'showWelcomeMessage']}
                label="Show Welcome Messages"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={['ui', 'defaultView']}
                label="Default View"
              >
                <Select>
                  <Option value="dashboard">Dashboard</Option>
                  <Option value="users">Users</Option>
                  <Option value="settings">Settings</Option>
                </Select>
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'privacy',
      label: (
        <span>
          <UserOutlined /> Privacy
        </span>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Card title="Privacy Settings" size="small">
              <Form.Item
                name={['privacy', 'profileVisible']}
                label="Profile Visible to Others"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
              <Form.Item
                name={['privacy', 'activityVisible']}
                label="Activity Visible to Others"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <ProtectedRoute requireRole={3}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Title level={2}>
            <SettingOutlined style={{ marginRight: '8px' }} />
            User Settings
          </Title>
          <Text type="secondary">
            Manage your personal preferences and application settings.
          </Text>
        </div>

        {isGuestMode && (
          <Alert
            message="Guest Mode"
            description="You are browsing as a guest. Your settings will be saved locally and won't sync across devices."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Card>
          <div className="mb-4 flex justify-between items-center">
            <Text type="secondary">
              Settings stored in: <strong>{storageType}</strong>
              {user && (
                <span> for user: <strong>{user.firstName} {user.lastName}</strong></span>
              )}
            </Text>
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
                disabled={saving}
              >
                Reset to Defaults
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={handleSave}
                loading={saving}
              >
                Save Settings
              </Button>
            </Space>
          </div>

          <Divider />

          <Form
            form={form}
            layout="vertical"
            initialValues={settings}
            onValuesChange={() => {}} // Real-time validation if needed
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
            />
          </Form>
        </Card>
      </div>
    </ProtectedRoute>
  );
}