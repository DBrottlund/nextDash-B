-- Migration: Add admin features for settings, themes, and user approval
-- Run this script to add admin features to existing database

-- Add admin_settings table
CREATE TABLE IF NOT EXISTS admin_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
);

-- Add user approval columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS approved_by INT NULL,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL,
ADD INDEX IF NOT EXISTS idx_approved (is_approved);

-- Add foreign key for approved_by (only if column exists and constraint doesn't exist)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
     WHERE CONSTRAINT_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'users' 
     AND CONSTRAINT_NAME = 'fk_users_approved_by') = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL',
    'SELECT "Foreign key already exists"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert default admin settings
INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES
('theme_mode', 'light', 'Default theme mode: light or dark'),
('css_style', 'default', 'CSS style theme: default, modern, classic, minimal, vibrant'),
('allow_guest_access', 'false', 'Allow guest users to access the system'),
('allow_user_signup', 'true', 'Allow new users to sign up'),
('require_user_approval', 'false', 'Require admin approval for new user accounts'),
('front_page_mode', 'login', 'Front page mode: login or html'),
('front_page_html', '', 'Custom HTML content for front page'),
('app_name', 'NextDash-B', 'Application name'),
('app_logo_url', '', 'Application logo URL'),
('email_verification_required', 'false', 'Require email verification for new accounts'),
('session_timeout', '24', 'Session timeout in hours'),
('max_login_attempts', '5', 'Maximum login attempts before lockout'),
('lockout_duration', '30', 'Account lockout duration in minutes'),
('password_min_length', '8', 'Minimum password length'),
('password_require_special', 'false', 'Require special characters in passwords'),
('password_require_numbers', 'false', 'Require numbers in passwords'),
('password_require_uppercase', 'false', 'Require uppercase letters in passwords');

-- Update existing users to be approved by default (for migration)
UPDATE users SET is_approved = TRUE WHERE is_approved = FALSE AND created_at < NOW();