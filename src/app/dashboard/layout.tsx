'use client';

import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Typography, Spin, Switch, Tooltip } from 'antd';
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  ToolOutlined,
  AppstoreOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import NotificationsDropdown from '@/components/NotificationsDropdown';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { user, loading, isAuthenticated, logout, canAccessUsers, canAccessRoles, canAccessSettings, isAdmin } = useAuth();
  const { themeMode, toggleThemeMode } = useTheme();
  const { settings: adminSettings } = useAdminSettings();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Build menu items based on user permissions
  const buildMenuItems = () => {
    const items: any[] = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link href="/dashboard">Dashboard</Link>,
      },
    ];

    // Add Users menu if user has permission
    if (canAccessUsers()) {
      items.push({
        key: '/dashboard/users',
        icon: <UserOutlined />,
        label: <Link href="/dashboard/users">Users</Link>,
      });
    }

    // Add Roles menu if user has permission (admin only)
    if (canAccessRoles()) {
      items.push({
        key: '/dashboard/roles',
        icon: <TeamOutlined />,
        label: <Link href="/dashboard/roles">Roles</Link>,
      });
    }

    // Add Settings menu if user has permission
    if (canAccessSettings()) {
      items.push({
        key: '/dashboard/settings',
        icon: <SettingOutlined />,
        label: <Link href="/dashboard/settings">Settings</Link>,
      });
    }

    // Add Admin menu if user is admin
    if (isAdmin()) {
      items.push({
        key: 'admin',
        icon: <ToolOutlined />,
        label: <span>Admin</span>,
        children: [
          {
            key: '/dashboard/admin/app-settings',
            icon: <AppstoreOutlined />,
            label: <Link href="/dashboard/admin/app-settings">App Settings</Link>,
          },
        ],
      });
    }

    return items;
  };

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'profile':
        router.push('/dashboard/profile');
        break;
      case 'settings':
        router.push('/dashboard/settings');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <Layout className="min-h-screen">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="shadow-lg"
        theme="light"
      >
        <div className="p-4 text-center border-b">
          <Title level={4} className="m-0">
            {collapsed ? 
              (adminSettings.app_name ? adminSettings.app_name.substring(0, 2).toUpperCase() : 'ND') : 
              (adminSettings.app_name || 'NextDash-B')
            }
          </Title>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={buildMenuItems()}
          className="border-0"
        />
      </Sider>
      
      <Layout>
        <Header className="bg-white shadow-sm px-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-lg"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
              <Switch
                checkedChildren={<BulbFilled />}
                unCheckedChildren={<BulbOutlined />}
                checked={themeMode === 'dark'}
                onChange={toggleThemeMode}
                size="default"
              />
            </Tooltip>
            
            <NotificationsDropdown />
            
            <Dropdown 
              menu={{ 
                items: userMenuItems,
                onClick: ({ key }) => handleMenuClick(key)
              }} 
              placement="bottomRight"
            >
              <div className="flex items-center space-x-2 cursor-pointer">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1px solid #d9d9d9'
                    }}
                    onError={(e) => {
                      // Fallback to default avatar on error
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Avatar icon={<UserOutlined />} />
                )}
                <span className="hidden md:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="p-6" style={{ background: 'transparent' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}