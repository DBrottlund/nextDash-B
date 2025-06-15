import { db } from './db';
import { emailService } from './email';

// Transaction notification types
export type TransactionType = 
  | 'accountCreated' 
  | 'accountUpdated' 
  | 'accountDeleted'
  | 'userLogin'
  | 'passwordChanged'
  | 'profileUpdated'
  | 'roleChanged'
  | 'securityAlert'
  | 'systemMaintenance'
  | 'dataExport';

// App-level notification configuration
export interface AppNotificationConfig {
  enabled: boolean;
  transactionNotifications: {
    [key in TransactionType]: {
      email: boolean;
      inApp: boolean;
      description: string;
      emailTemplate?: string;
    };
  };
}

// Default app-level configuration
const defaultAppConfig: AppNotificationConfig = {
  enabled: true,
  transactionNotifications: {
    accountCreated: {
      email: true,
      inApp: true,
      description: 'User account has been created',
    },
    accountUpdated: {
      email: true,
      inApp: true,
      description: 'User account information has been updated',
    },
    accountDeleted: {
      email: true,
      inApp: true,
      description: 'User account has been deleted',
    },
    userLogin: {
      email: false,
      inApp: false,
      description: 'User has logged into their account',
    },
    passwordChanged: {
      email: true,
      inApp: true,
      description: 'User password has been changed',
    },
    profileUpdated: {
      email: false,
      inApp: true,
      description: 'User profile information has been updated',
    },
    roleChanged: {
      email: true,
      inApp: true,
      description: 'User role or permissions have been changed',
    },
    securityAlert: {
      email: true,
      inApp: true,
      description: 'Security-related alerts and warnings',
    },
    systemMaintenance: {
      email: true,
      inApp: true,
      description: 'System maintenance and downtime notifications',
    },
    dataExport: {
      email: true,
      inApp: true,
      description: 'Data export requests and completion',
    },
  },
};

// Transaction notification service
export class TransactionNotificationService {
  // Get app-level notification configuration
  async getAppNotificationConfig(): Promise<AppNotificationConfig> {
    try {
      // Get the main enabled flag
      const enabledSetting = await db.queryOne(
        'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
        ['transaction_notifications_enabled']
      );
      
      const enabled = enabledSetting?.setting_value === 'true';
      
      // Get individual transaction notification settings
      const transactionSettings = await db.queryOne(
        'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
        ['transaction_notifications']
      );
      
      let transactionNotifications = defaultAppConfig.transactionNotifications;
      if (transactionSettings) {
        const parsed = JSON.parse(transactionSettings.setting_value);
        transactionNotifications = parsed;
      }

      return {
        enabled,
        transactionNotifications
      };
    } catch (error) {
      console.error('Error getting app notification config:', error);
      return defaultAppConfig;
    }
  }

  // Update app-level notification configuration
  async updateAppNotificationConfig(config: AppNotificationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      await db.execute(
        `INSERT INTO admin_settings (setting_key, setting_value, updated_at) 
         VALUES (?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         setting_value = VALUES(setting_value), 
         updated_at = NOW()`,
        ['transaction_notifications', JSON.stringify(config)]
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating app notification config:', error);
      return { success: false, error: 'Failed to update configuration' };
    }
  }

  // Get user's notification preferences
  async getUserNotificationSettings(userId: number): Promise<any> {
    try {
      const userSettings = await db.queryOne(
        'SELECT settings FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (userSettings) {
        const settings = JSON.parse(userSettings.settings);
        return settings.transactionNotifications || {};
      }

      // Return default settings if user hasn't set any
      const defaultSettings = {
        accountCreated: { email: true, inApp: true },
        accountUpdated: { email: true, inApp: true },
        accountDeleted: { email: true, inApp: true },
        userLogin: { email: true, inApp: true },
        passwordChanged: { email: true, inApp: true },
        profileUpdated: { email: true, inApp: true },
        roleChanged: { email: true, inApp: true },
        securityAlert: { email: true, inApp: true },
        systemMaintenance: { email: true, inApp: true },
        dataExport: { email: true, inApp: true },
      };

      return defaultSettings;
    } catch (error) {
      console.error('Error getting user notification settings:', error);
      return {};
    }
  }

  // Send transaction notification
  async sendTransactionNotification(params: {
    userId: number;
    transactionType: TransactionType;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
    actionText?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const { userId, transactionType, title, message, data, actionUrl, actionText } = params;

      // Get app-level configuration
      const appConfig = await this.getAppNotificationConfig();
      
      // Check if notifications are enabled app-wide
      if (!appConfig.enabled) {
        return { success: true }; // Silently skip if disabled
      }

      // Check if this transaction type is enabled app-wide
      const appTransactionConfig = appConfig.transactionNotifications[transactionType];
      if (!appTransactionConfig) {
        return { success: true }; // Skip if transaction type not configured
      }

      // Get user's notification preferences
      const userSettings = await this.getUserNotificationSettings(userId);
      const userTransactionSettings = userSettings[transactionType] || { email: true, inApp: true };

      // Get user details
      const user = await db.queryOne(
        'SELECT email, first_name, last_name FROM users WHERE id = ? AND is_active = TRUE',
        [userId]
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const results = [];

      // Check if email verification is required (for accountCreated, skip email if verification required)
      let skipEmail = false;
      if (transactionType === 'accountCreated') {
        const emailVerificationRequired = await db.queryOne(
          'SELECT setting_value FROM admin_settings WHERE setting_key = ?',
          ['email_verification_required']
        );
        skipEmail = emailVerificationRequired?.setting_value === 'true';
      }

      // Send email notification if enabled at both app and user level and not skipped
      if (appTransactionConfig.email && userTransactionSettings.email && !skipEmail) {
        try {
          const emailResult = await this.sendTransactionEmail({
            to: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            transactionType,
            title,
            message,
            data,
            actionUrl,
            actionText,
          });
          results.push({ type: 'email', success: emailResult.success, error: emailResult.error });
        } catch (error) {
          results.push({ type: 'email', success: false, error: 'Email sending failed' });
        }
      }

      // Send in-app notification if enabled at both app and user level
      if (appTransactionConfig.inApp && userTransactionSettings.inApp) {
        try {
          const inAppResult = await this.createInAppNotification({
            userId,
            type: this.getNotificationType(transactionType),
            title,
            message,
            actionUrl,
            actionText,
            data,
          });
          results.push({ type: 'inApp', success: inAppResult.success, error: inAppResult.error });
        } catch (error) {
          results.push({ type: 'inApp', success: false, error: 'In-app notification failed' });
        }
      }

      const hasFailures = results.some(r => !r.success);
      return { 
        success: !hasFailures, 
        error: hasFailures ? 'Some notifications failed to send' : undefined 
      };

    } catch (error) {
      console.error('Error sending transaction notification:', error);
      return { success: false, error: 'Failed to send notifications' };
    }
  }

  // Send transaction email
  private async sendTransactionEmail(params: {
    to: string;
    firstName: string;
    lastName: string;
    transactionType: TransactionType;
    title: string;
    message: string;
    data?: any;
    actionUrl?: string;
    actionText?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { to, firstName, lastName, transactionType, title, message, actionUrl, actionText } = params;

    const content = `
      <h2>${title}</h2>
      <p>Hello ${firstName},</p>
      
      <p>${message}</p>
      
      ${actionUrl && actionText ? `
        <p>
          <a href="${actionUrl}" class="button" style="display: inline-block; padding: 12px 24px; background-color: #1890ff; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; margin: 20px 0;">
            ${actionText}
          </a>
        </p>
      ` : ''}
      
      <p>If you have any questions or concerns, please contact our support team.</p>
      
      <p>Best regards,<br>The NextDash-B Team</p>
    `;

    return await emailService.sendEmail({
      to,
      subject: title,
      html: this.getEmailTemplate(content, title),
      text: `${title}\n\nHello ${firstName},\n\n${message}\n\n${actionUrl ? `Link: ${actionUrl}` : ''}\n\nBest regards,\nThe NextDash-B Team`,
    });
  }

  // Create in-app notification
  private async createInAppNotification(params: {
    userId: number;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    actionText?: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      await db.execute(
        `INSERT INTO notifications (user_id, type, title, message, action_url, action_text)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          params.userId,
          params.type,
          params.title,
          params.message,
          params.actionUrl || null,
          params.actionText || null,
        ]
      );

      return { success: true };
    } catch (error) {
      console.error('Error creating in-app notification:', error);
      return { success: false, error: 'Failed to create notification' };
    }
  }

  // Get notification type for in-app notifications
  private getNotificationType(transactionType: TransactionType): string {
    const typeMap: Record<TransactionType, string> = {
      accountCreated: 'success',
      accountUpdated: 'info',
      accountDeleted: 'warning',
      userLogin: 'info',
      passwordChanged: 'success',
      profileUpdated: 'info',
      roleChanged: 'warning',
      securityAlert: 'error',
      systemMaintenance: 'warning',
      dataExport: 'success',
    };

    return typeMap[transactionType] || 'info';
  }

  // Email template helper
  private getEmailTemplate(content: string, title: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1890ff;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1890ff;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1890ff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-weight: 500;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">NextDash-B</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>This is an automated notification from NextDash-B</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Export singleton instance
export const transactionNotificationService = new TransactionNotificationService();