'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  DashboardOutlined,
  TrophyOutlined 
} from '@ant-design/icons';

const { Title } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const guestData = localStorage.getItem('guest_data');
    
    if (userData) {
      setUser(JSON.parse(userData));
    } else if (guestData) {
      setUser({ firstName: 'Guest', lastName: 'User', role: 'guest' });
    }
  }, []);

  return (
    <div>
      <div className="mb-6">
        <Title level={2}>
          Welcome back, {user?.firstName || 'User'}!
        </Title>
        <p className="text-gray-600">
          Here's what's happening with your dashboard today.
        </p>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1234}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Sessions"
              value={89}
              prefix={<DashboardOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Teams"
              value={12}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Performance"
              value={93.2}
              prefix={<TrophyOutlined />}
              suffix="%"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Recent Activity" className="h-96">
            <div className="h-full flex items-center justify-center text-gray-500">
              Activity chart will be implemented here
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="h-96">
            <Space direction="vertical" className="w-full">
              <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                Create New User
              </div>
              <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                Manage Roles
              </div>
              <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                View Reports
              </div>
              <div className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                System Settings
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}