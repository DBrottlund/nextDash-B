export interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface CreateNotificationData {
  userId: number;
  title: string;
  message?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  actionText?: string;
  expiresAt?: string;
}

export interface NotificationFilters {
  userId?: number;
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}