'use client';

import { useState } from 'react';
import { 
  Dropdown, 
  Badge, 
  Button, 
  List, 
  Typography, 
  Empty, 
  Divider, 
  Space,
  message,
  Spin,
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
  EyeOutlined
} from '@ant-design/icons';
import { useNotifications } from '@/hooks/useNotifications';
import { Notification } from '@/types/notification';
import Link from 'next/link';

const { Text } = Typography;

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

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

export default function NotificationsDropdown() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { token } = theme.useToken();

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    
    if (notification.actionUrl && notification.actionUrl !== '#') {
      setDropdownOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    message.success('All notifications marked as read');
  };

  const handleDeleteNotification = async (notificationId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    message.success('Notification deleted');
  };

  const notificationsList = (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <div className="notifications-header-content">
          <Text strong className="notifications-title">Notifications</Text>
          {unreadCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              onClick={handleMarkAllRead}
              icon={<CheckOutlined />}
              className="mark-all-read-btn"
            >
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="notifications-loading">
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <div className="notifications-empty">
          <Empty 
            description="No notifications" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={notifications.slice(0, 10)}
          split={false}
          className="notifications-list"
          renderItem={(notification) => (
            <List.Item
              className={`notification-item ${!notification.isRead ? 'notification-unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
              actions={[
                <Button
                  key="delete"
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDeleteNotification(notification.id, e)}
                  className="notification-delete-btn"
                />
              ]}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(notification.type)}
                title={
                  <div className="notification-title-row">
                    <Text strong={!notification.isRead} className="notification-title">
                      {notification.title}
                    </Text>
                    <Text type="secondary" className="notification-time">
                      {formatTimeAgo(notification.createdAt)}
                    </Text>
                  </div>
                }
                description={
                  <div className="notification-content">
                    {notification.message && (
                      <Text type="secondary" className="notification-message">
                        {notification.message}
                      </Text>
                    )}
                    {notification.actionUrl && notification.actionText && notification.actionUrl !== '#' && (
                      <div className="notification-action">
                        <Link href={notification.actionUrl}>
                          <Button type="link" size="small" className="notification-action-btn">
                            {notification.actionText}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}

      {notifications.length > 10 && (
        <>
          <Divider style={{ margin: 0 }} />
          <div className="notifications-footer">
            <Link href="/dashboard/notifications">
              <Button type="link" icon={<EyeOutlined />} className="view-all-btn">
                View all notifications
              </Button>
            </Link>
          </div>
        </>
      )}

      <style jsx>{`
        .notifications-dropdown {
          width: 380px;
          max-height: calc(100vh - 80px);
          overflow: auto;
          background: ${token.colorBgElevated};
          border-radius: ${token.borderRadius}px;
          box-shadow: ${token.boxShadowSecondary};
        }

        .notifications-header {
          padding: 16px 20px;
          border-bottom: 1px solid ${token.colorBorderSecondary};
          background: ${token.colorBgElevated};
        }

        .notifications-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .notifications-title {
          color: ${token.colorText};
          font-size: 14px;
          font-weight: 600;
        }

        .mark-all-read-btn {
          color: ${token.colorPrimary};
          font-size: 12px;
          padding: 0;
          height: auto;
        }

        .notifications-loading,
        .notifications-empty {
          padding: 24px 20px;
          text-align: center;
          background: ${token.colorBgElevated};
        }

        .notifications-list {
          background: ${token.colorBgElevated};
        }

        .notification-item {
          padding: 16px 24px;
          background: ${token.colorBgElevated};
          border-left: none;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .notification-item:hover {
          background: ${token.colorBgTextHover};
        }

        :global(.ant-spin-nested-loading .ant-spin-container) {
          position: relative;
          transition: opacity 0.3s;
          padding: 0 12px;
        }

        :global(.notifications-dropdown-overlay) {
          border-radius: ${token.borderRadius}px;
          overflow: hidden;
        }

        :global(.notifications-dropdown-overlay .ant-dropdown-menu) {
          padding: 0;
          border-radius: ${token.borderRadius}px;
          overflow: hidden;
          box-shadow: ${token.boxShadowSecondary};
        }

        .notification-unread {
          background: ${token.colorSuccessBg};
          border-left: 3px solid ${token.colorSuccess};
          padding-left: 21px;
        }

        .notification-unread:hover {
          background: ${token.colorSuccessBgHover};
        }

        .notification-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .notification-title {
          font-size: 14px;
          color: ${token.colorText};
          line-height: 1.4;
          flex: 1;
          margin-right: 8px;
        }

        .notification-time {
          font-size: 12px;
          color: ${token.colorTextSecondary};
          white-space: nowrap;
        }

        .notification-content {
          margin-top: 4px;
        }

        .notification-message {
          font-size: 13px;
          color: ${token.colorTextSecondary};
          line-height: 1.4;
          display: block;
        }

        .notification-action {
          margin-top: 8px;
        }

        .notification-action-btn {
          padding: 0;
          height: auto;
          font-size: 12px;
          color: ${token.colorPrimary};
        }

        .notification-delete-btn {
          color: ${token.colorError};
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .notification-delete-btn:hover {
          opacity: 1;
        }

        .notifications-footer {
          padding: 16px 20px;
          text-align: center;
          background: ${token.colorBgElevated};
          border-top: 1px solid ${token.colorBorderSecondary};
        }

        .view-all-btn {
          color: ${token.colorPrimary};
          font-size: 13px;
        }
      `}</style>
    </div>
  );

  return (
    <Dropdown
      overlay={notificationsList}
      trigger={['click']}
      placement="bottomRight"
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      overlayClassName="notifications-dropdown-overlay"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button 
          type="text" 
          icon={<BellOutlined />} 
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        />
      </Badge>
    </Dropdown>
  );
}