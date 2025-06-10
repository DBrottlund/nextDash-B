'use client';

import { Card, Typography, Result, Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const { Title } = Typography;

export default function SettingsPage() {
  return (
    <ProtectedRoute requireRole={2}>
      <div className="p-6">
        <Card>
          <Result
            icon={<SettingOutlined style={{ color: '#1890ff' }} />}
            title="Settings"
            subTitle="User settings and preferences functionality is coming soon. This page will allow users to manage their profile, notifications, and account settings."
            extra={[
              <Button type="primary" key="back" href="/dashboard">
                Back to Dashboard
              </Button>
            ]}
          />
        </Card>
      </div>
    </ProtectedRoute>
  );
}