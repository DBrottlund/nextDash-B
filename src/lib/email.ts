import nodemailer from 'nodemailer';
import { db } from './db';
import crypto from 'crypto';

// Email service configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Email template helpers
const getEmailTemplate = (content: string, title: string) => {
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
        .button:hover {
          background-color: #40a9ff;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          font-size: 14px;
          color: #666;
        }
        .warning {
          background-color: #fff2f0;
          border: 1px solid #ffccc7;
          border-radius: 4px;
          padding: 15px;
          margin: 20px 0;
          color: #a8071a;
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
          <p>This email was sent from NextDash-B</p>
          <p>If you didn't request this email, please ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email connection test failed:', error);
      return false;
    }
  }

  // Send raw email
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: `"NextDash-B" <${process.env.FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error('Email send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Send welcome email for new users
  async sendWelcomeEmail(user: {
    email: string;
    firstName: string;
    lastName: string;
    userId?: number;
    requireVerification?: boolean;
  }): Promise<{ success: boolean; error?: string }> {
    console.log('sendWelcomeEmail called with:', { 
      email: user.email, 
      requireVerification: user.requireVerification, 
      userId: user.userId 
    });
    
    let verificationToken = '';
    let verificationUrl = '';
    
    // Generate verification token if required
    if (user.requireVerification && user.userId) {
      console.log('Generating verification token for user:', user.userId);
      verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Store verification token in database
      await db.execute(
        'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.userId, hashedToken, expiresAt]
      );
      
      verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/auth/verify-email?token=${verificationToken}`;
      console.log('Generated verification URL:', verificationUrl);
    } else {
      console.log('No verification required or missing userId');
    }

    const content = `
      <h2>Welcome to NextDash-B, ${user.firstName}!</h2>
      <p>Thank you for joining NextDash-B. Your account has been successfully created.</p>
      
      <p><strong>Account Details:</strong></p>
      <ul>
        <li>Email: ${user.email}</li>
        <li>Name: ${user.firstName} ${user.lastName}</li>
      </ul>
      
      ${user.requireVerification ? `
        <div class="warning">
          <h3>⚠️ Email Verification Required</h3>
          <p><strong>Important:</strong> You must verify your email address before you can access your account.</p>
          <p>Click the button below to verify your email address:</p>
          
          <a href="${verificationUrl}" class="button" style="background-color: #52c41a; border-color: #52c41a;">
            Verify Email Address
          </a>
          
          <p style="font-size: 12px; color: #666; margin-top: 20px;">
            This verification link will expire in 24 hours. If you don't verify your email, you won't be able to log in.
          </p>
        </div>
        
        <p>After verifying your email, you can log in to your dashboard:</p>
      ` : `
        <p>You can now log in to your dashboard and start using all the features available to you:</p>
      `}
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">
        Login to Dashboard
      </a>
      
      <p>If you have any questions or need assistance, feel free to contact our support team.</p>
      
      <p>Best regards,<br>The NextDash-B Team</p>
    `;

    const result = await this.sendEmail({
      to: user.email,
      subject: 'Welcome to NextDash-B!',
      html: getEmailTemplate(content, 'Welcome to NextDash-B'),
      text: `Welcome to NextDash-B, ${user.firstName}! Your account has been created. Login at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
    });

    return {
      success: result.success,
      error: result.error,
    };
  }

  // Generate password reset token and send email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if user exists
      const user = await db.queryOne(
        'SELECT id, email, first_name, last_name FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (!user) {
        // Don't reveal if email exists or not for security
        return { success: true };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store reset token in database
      await db.execute(
        `INSERT INTO password_resets (user_id, token_hash, expires_at, created_at) 
         VALUES (?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE 
         token_hash = VALUES(token_hash), 
         expires_at = VALUES(expires_at), 
         created_at = NOW()`,
        [user.id, resetTokenHash, expiresAt]
      );

      // Create reset URL
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      const content = `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.first_name},</p>
        
        <p>We received a request to reset your password for your NextDash-B account.</p>
        
        <p>Click the button below to reset your password:</p>
        
        <a href="${resetUrl}" class="button">Reset Password</a>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <div class="warning">
          <strong>Important:</strong>
          <ul>
            <li>This link will expire in 15 minutes</li>
            <li>If you didn't request this password reset, please ignore this email</li>
            <li>Your password will not be changed until you click the link above</li>
          </ul>
        </div>
        
        <p>Best regards,<br>The NextDash-B Team</p>
      `;

      const result = await this.sendEmail({
        to: user.email,
        subject: 'Reset Your NextDash-B Password',
        html: getEmailTemplate(content, 'Password Reset'),
        text: `Password reset requested for NextDash-B. Click this link to reset: ${resetUrl} (expires in 15 minutes)`,
      });

      return {
        success: result.success,
        error: result.error,
      };
    } catch (error) {
      console.error('Password reset email error:', error);
      return {
        success: false,
        error: 'Failed to send password reset email',
      };
    }
  }

  // Verify and consume password reset token
  async verifyPasswordResetToken(token: string): Promise<{ 
    success: boolean; 
    userId?: number; 
    error?: string;
  }> {
    try {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find valid token
      const resetRecord = await db.queryOne(
        `SELECT pr.user_id, pr.expires_at, u.email, u.first_name, u.last_name
         FROM password_resets pr
         JOIN users u ON pr.user_id = u.id
         WHERE pr.token_hash = ? AND pr.expires_at > NOW() AND u.is_active = TRUE`,
        [tokenHash]
      );

      if (!resetRecord) {
        return {
          success: false,
          error: 'Invalid or expired reset token',
        };
      }

      return {
        success: true,
        userId: resetRecord.user_id,
      };
    } catch (error) {
      console.error('Password reset token verification error:', error);
      return {
        success: false,
        error: 'Failed to verify reset token',
      };
    }
  }

  // Reset password with token
  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ 
    success: boolean; 
    error?: string;
  }> {
    try {
      // Verify token first
      const tokenVerification = await this.verifyPasswordResetToken(token);
      if (!tokenVerification.success || !tokenVerification.userId) {
        return {
          success: false,
          error: tokenVerification.error || 'Invalid token',
        };
      }

      // Hash new password
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(newPassword, 12);

      // Update password
      await db.execute(
        'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
        [passwordHash, tokenVerification.userId]
      );

      // Delete used reset token
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      await db.execute(
        'DELETE FROM password_resets WHERE token_hash = ?',
        [tokenHash]
      );

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Failed to reset password',
      };
    }
  }

  // Clean up expired password reset tokens (call this periodically)
  async cleanupExpiredTokens(): Promise<void> {
    try {
      await db.execute('DELETE FROM password_resets WHERE expires_at < NOW()');
    } catch (error) {
      console.error('Failed to cleanup expired tokens:', error);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();