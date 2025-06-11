'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Row,
  Col,
  Space,
  message,
  Divider,
  Tabs,
  InputNumber,
  Upload,
  Modal
} from 'antd';
import {
  AppstoreOutlined,
  SaveOutlined,
  ReloadOutlined,
  BulbOutlined,
  BgColorsOutlined,
  SecurityScanOutlined,
  GlobalOutlined,
  SettingOutlined,
  UploadOutlined,
  EyeOutlined,
  TransactionOutlined
} from '@ant-design/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import dynamic from 'next/dynamic';

// Dynamic import for WYSIWYG editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface AdminSettings {
  // Theme & Appearance
  theme_mode: string;
  css_style: string;
  app_name: string;
  app_logo_url: string;

  // Access Control
  allow_guest_access: boolean;
  allow_user_signup: boolean;
  require_user_approval: boolean;
  email_verification_required: boolean;

  // Front Page
  front_page_mode: string;
  front_page_html: string;

  // Transaction Notifications
  transaction_notifications_enabled: boolean;
  transaction_notifications: {
    accountCreated: { email: boolean; inApp: boolean; };
    accountUpdated: { email: boolean; inApp: boolean; };
    accountDeleted: { email: boolean; inApp: boolean; };
    userLogin: { email: boolean; inApp: boolean; };
    passwordChanged: { email: boolean; inApp: boolean; };
    profileUpdated: { email: boolean; inApp: boolean; };
    roleChanged: { email: boolean; inApp: boolean; };
    securityAlert: { email: boolean; inApp: boolean; };
    systemMaintenance: { email: boolean; inApp: boolean; };
    dataExport: { email: boolean; inApp: boolean; };
  };

  // Security
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
  password_min_length: number;
  password_require_special: boolean;
  password_require_numbers: boolean;
  password_require_uppercase: boolean;
}

export default function AppSettingsPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const { themeMode, cssStyle, setThemeMode, setCSSStyle, reloadSettings } = useTheme();
  const { updateSettings: updateAdminSettings } = useAdminSettings();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        form.setFieldsValue(data.data);
      } else {
        message.error(data.message || 'Failed to fetch settings');
      }
    } catch (error) {
      message.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const values = await form.validateFields();
      
      // Apply theme changes immediately
      if (values.theme_mode !== themeMode) {
        setThemeMode(values.theme_mode);
      }
      if (values.css_style !== cssStyle) {
        setCSSStyle(values.css_style);
      }

      // Use the hook's updateSettings method for real-time updates
      const result = await updateAdminSettings(values);
      
      if (result.success) {
        // Reload theme settings to apply changes immediately
        await reloadSettings();
        message.success('Settings saved successfully');
        setSettings(values);
      } else {
        message.error(result.message || 'Failed to save settings');
      }
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePreview = () => {
    const frontPageHtml = form.getFieldValue('front_page_html');
    setPreviewVisible(true);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const tabItems = [
    {
      key: 'general',
      label: (
        <Space>
          <AppstoreOutlined />
          General
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="app_name"
              label="Application Name"
              rules={[{ required: true, message: 'Please enter application name' }]}
            >
              <Input placeholder="NextDash-B" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="app_logo_url" label="Logo URL">
              <Input placeholder="https://example.com/logo.png" />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'theme',
      label: (
        <Space>
          <BgColorsOutlined />
          Theme & Style
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="theme_mode"
              label="Theme Mode"
              initialValue="light"
            >
              <Select>
                <Option value="light">
                  <Space>
                    <BulbOutlined />
                    Light Mode
                  </Space>
                </Option>
                <Option value="dark">
                  <Space>
                    <BulbOutlined />
                    Dark Mode
                  </Space>
                </Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="css_style"
              label="CSS Style Theme"
              initialValue="default"
            >
              <Select>
                <Option value="default">Default</Option>
                <Option value="modern">Modern</Option>
                <Option value="classic">Classic</Option>
                <Option value="minimal">Minimal</Option>
                <Option value="vibrant">Vibrant</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'access',
      label: (
        <Space>
          <GlobalOutlined />
          Access Control
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="allow_guest_access"
              label="Allow Guest Access"
              valuePropName="checked"
              extra="Allow anonymous users to access certain parts of the system"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="allow_user_signup"
              label="Allow User Signup"
              valuePropName="checked"
              extra="Allow new users to create accounts"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="require_user_approval"
              label="Require User Approval"
              valuePropName="checked"
              extra="New users need admin approval before accessing the system"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email_verification_required"
              label="Email Verification Required"
              valuePropName="checked"
              extra="Users must verify their email before accessing the system"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'security',
      label: (
        <Space>
          <SecurityScanOutlined />
          Security
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={12}>
            <Form.Item
              name="session_timeout"
              label="Session Timeout (hours)"
              rules={[{ type: 'number', min: 1, max: 168 }]}
            >
              <InputNumber min={1} max={168} />
            </Form.Item>
            <Form.Item
              name="max_login_attempts"
              label="Max Login Attempts"
              rules={[{ type: 'number', min: 3, max: 10 }]}
            >
              <InputNumber min={3} max={10} />
            </Form.Item>
            <Form.Item
              name="lockout_duration"
              label="Lockout Duration (minutes)"
              rules={[{ type: 'number', min: 5, max: 1440 }]}
            >
              <InputNumber min={5} max={1440} />
            </Form.Item>
            <Form.Item
              name="password_min_length"
              label="Minimum Password Length"
              rules={[{ type: 'number', min: 6, max: 50 }]}
            >
              <InputNumber min={6} max={50} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="password_require_special"
              label="Require Special Characters"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="password_require_numbers"
              label="Require Numbers"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            <Form.Item
              name="password_require_uppercase"
              label="Require Uppercase Letters"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'frontend',
      label: (
        <Space>
          <SettingOutlined />
          Front Page
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="front_page_mode"
              label="Front Page Mode"
              initialValue="login"
              extra="Choose between login form or custom HTML content"
            >
              <Select>
                <Option value="login">Login Form</Option>
                <Option value="html">Custom HTML</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.front_page_mode !== currentValues.front_page_mode
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('front_page_mode') === 'html' ? (
                  <Form.Item
                    name="front_page_html"
                    label={
                      <Space>
                        Custom HTML Content
                        <Button
                          type="link"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={handlePreview}
                        >
                          Preview
                        </Button>
                      </Space>
                    }
                  >
                    <ReactQuill
                      theme="snow"
                      modules={quillModules}
                      style={{ height: '300px', marginBottom: '50px' }}
                    />
                  </Form.Item>
                ) : null
              }
            </Form.Item>
          </Col>
        </Row>
      ),
    },
    {
      key: 'notifications',
      label: (
        <Space>
          <TransactionOutlined />
          Transaction Notifications
        </Space>
      ),
      children: (
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item
              name="transaction_notifications_enabled"
              label="Enable Transaction Notifications"
              valuePropName="checked"
              extra="Master switch to enable/disable all transaction notifications app-wide"
            >
              <Switch />
            </Form.Item>
            
            <div style={{ marginTop: 24 }}>
              <Title level={4}>Configure Transaction Types</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Enable or disable specific notification types app-wide. Users can only receive notifications for types that are enabled here.
              </Text>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                {/* Account Events */}
                <div>
                  <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>Account Events</Title>
                  
                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Account Created</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When new accounts are created</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountCreated', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountCreated', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Account Updated</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When account information is modified</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountUpdated', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountUpdated', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Account Deleted</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When accounts are removed</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountDeleted', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'accountDeleted', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* Security Events */}
                <div>
                  <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>Security Events</Title>
                  
                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>User Login</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When users log into accounts</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'userLogin', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'userLogin', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Password Changed</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When passwords are updated</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'passwordChanged', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'passwordChanged', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Security Alert</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>Important security warnings</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'securityAlert', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'securityAlert', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                {/* System Events */}
                <div>
                  <Title level={5} style={{ color: '#1890ff', marginBottom: 16 }}>System Events</Title>
                  
                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Profile Updated</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When user profiles change</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'profileUpdated', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'profileUpdated', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Role Changed</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When user permissions are modified</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'roleChanged', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'roleChanged', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>System Maintenance</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>Scheduled downtime and updates</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'systemMaintenance', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'systemMaintenance', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[16, 12]}>
                    <Col span={8}>
                      <strong>Data Export</strong>
                      <div style={{ fontSize: '12px', color: '#666' }}>When data exports are completed</div>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'dataExport', 'email']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable Email
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name={['transaction_notifications', 'dataExport', 'inApp']} valuePropName="checked" style={{ margin: 0 }}>
                        <Switch size="small" /> Enable In-App
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="p-6">
        <Card>
          <Row justify="space-between" align="middle" className="mb-6">
            <Col>
              <Title level={2}>
                <Space>
                  <AppstoreOutlined />
                  App Settings
                </Space>
              </Title>
              <Text type="secondary">Configure global application settings</Text>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchSettings}
                  loading={loading}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                  loading={saveLoading}
                >
                  Save Settings
                </Button>
              </Space>
            </Col>
          </Row>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Tabs
              items={tabItems}
              size="large"
              tabBarStyle={{ marginBottom: 24 }}
            />
          </Form>
        </Card>

        <Modal
          title="Front Page Preview"
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)}>
              Close
            </Button>
          ]}
        >
          <div
            dangerouslySetInnerHTML={{
              __html: form.getFieldValue('front_page_html') || '<p>No content to preview</p>'
            }}
            style={{
              border: '1px solid #d9d9d9',
              padding: '16px',
              borderRadius: '6px',
              minHeight: '200px',
              backgroundColor: '#fafafa'
            }}
          />
        </Modal>
      </div>
    </ProtectedRoute>
  );
}