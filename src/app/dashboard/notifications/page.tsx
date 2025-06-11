'use client';

import { useState } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  Empty,
  Spin,
  message,
  Pagination,
  Select,
  Input,
  Row,
  Col,
  theme
} from 'antd';
import { 
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import Link from 'next/link';

const { Title, Text } = Typography;
const { Option } = Select;

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
    case 'warning':
      return <WarningOutlined style={{ color: '#faad14' }} />;
    case 'error':
      return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
    default:
      return <InfoCircleOutlined style={{ color: '#1890ff' }} />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'error';
    default: return 'default';
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

export default function NotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications 
  } = useNotifications();

  const [currentPage, setCurrentPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [readFilter, setReadFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = theme.useToken();

  const pageSize = 10;

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    message.success('All notifications marked as read');
  };

  const handleDeleteNotification = async (notificationId: number) => {
    await deleteNotification(notificationId);
    message.success('Notification deleted');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchNotifications({ 
      page, 
      limit: pageSize, 
      type: typeFilter || undefined,
      isRead: readFilter ? readFilter === 'read' : undefined
    });
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchNotifications({ 
      page: 1, 
      limit: pageSize, 
      type: typeFilter || undefined,
      isRead: readFilter ? readFilter === 'read' : undefined
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return notification.title.toLowerCase().includes(query) ||
             notification.message?.toLowerCase().includes(query);
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Title level={2}>
          <BellOutlined style={{ marginRight: '8px' }} />
          Notifications
        </Title>
        <Text type="secondary">
          Manage your notifications and stay updated with important information.
        </Text>
      </div>

      <Card>
        <div className="mb-4">
          <Row gutter={16} justify="space-between" align="middle">
            <Col xs={24} md={12}>
              <Space size="middle">
                <Text strong>
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </Text>
                {unreadCount > 0 && (
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={handleMarkAllRead}
                    icon={<CheckOutlined />}
                  >
                    Mark all read
                  </Button>
                )}
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space className="w-full" style={{ justifyContent: 'flex-end' }}>
                <Input
                  placeholder="Search notifications..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: 200 }}
                />
                <Select
                  placeholder="Type"
                  value={typeFilter}
                  onChange={(value) => {
                    setTypeFilter(value);
                    handleFilterChange();
                  }}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="">All Types</Option>
                  <Option value="info">Info</Option>
                  <Option value="success">Success</Option>
                  <Option value="warning">Warning</Option>
                  <Option value="error">Error</Option>
                </Select>
                <Select
                  placeholder="Status"
                  value={readFilter}
                  onChange={(value) => {
                    setReadFilter(value);
                    handleFilterChange();
                  }}
                  style={{ width: 120 }}
                  allowClear
                >
                  <Option value="">All</Option>
                  <Option value="unread">Unread</Option>
                  <Option value="read">Read</Option>
                </Select>
              </Space>
            </Col>
          </Row>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty 
            description="No notifications found" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <List
              itemLayout="horizontal"
              dataSource={filteredNotifications}
              renderItem={(notification) => (
                <List.Item
                  className={`notification-page-item ${!notification.isRead ? 'notification-page-unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  actions={[
                    <Button
                      key="delete"
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(notification.id);
                      }}
                      danger
                    />
                  ]}
                >
                  <List.Item.Meta
                    avatar={getNotificationIcon(notification.type)}
                    title={
                      <div className="flex justify-between items-start">
                        <Text strong={!notification.isRead} className="text-base">
                          {notification.title}
                        </Text>
                        <Space>
                          <Tag color={getTypeColor(notification.type)}>
                            {notification.type.toUpperCase()}
                          </Tag>
                          {!notification.isRead && (
                            <Tag color="green">NEW</Tag>
                          )}
                        </Space>
                      </div>
                    }
                    description={
                      <div>
                        {notification.message && (
                          <Text type="secondary" className="block mb-2">
                            {notification.message}
                          </Text>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text type="secondary" style={{ fontSize: '13px' }}>
                            {formatDateTime(notification.createdAt)}
                            {notification.isRead && notification.readAt && (
                              <span> • Read {formatDateTime(notification.readAt)}</span>
                            )}
                          </Text>
                          {notification.actionUrl && notification.actionText && notification.actionUrl !== '#' && (
                            <Link href={notification.actionUrl}>
                              <Button type="link" size="small">
                                {notification.actionText}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <div className="mt-6 text-center">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={notifications.length}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) => 
                  `${range[0]}-${range[1]} of ${total} notifications`
                }
              />
            </div>
          </>
        )}
      </Card>

      <style jsx>{`
        :global(.notification-page-item) {
          background: transparent;
          border-left: none;
          padding: 16px;
          margin-bottom: 8px;
          border-radius: ${token.borderRadius}px;
          border: 1px solid ${token.colorBorderSecondary};
          transition: background-color 0.2s, border-color 0.2s;
          cursor: pointer;
        }

        :global(.notification-page-item:hover) {
          background: ${token.colorBgTextHover};
          border-color: ${token.colorBorder};
        }

        :global(.notification-page-unread) {
          background: ${token.colorSuccessBg};
          border-left: 3px solid ${token.colorSuccess};
        }

        :global(.notification-page-unread:hover) {
          background: ${token.colorSuccessBgHover};
        }
      `}</style>
    </div>
  );
}