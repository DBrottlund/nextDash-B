-- NextDash-B PostgreSQL Seed Data
-- Insert default data for the application

-- Insert default roles
INSERT INTO roles (name, description, permissions, is_active) VALUES
('Super Admin', 'Full system access', '{"all": true}', true),
('Admin', 'Administrative access', '{"users": {"read": true, "write": true, "delete": true}, "settings": {"read": true, "write": true}, "reports": {"read": true, "write": true}}', true),
('Manager', 'Management level access', '{"users": {"read": true, "write": true}, "reports": {"read": true, "write": true}}', true),
('User', 'Standard user access', '{"profile": {"read": true, "write": true}}', true),
('Guest', 'Limited guest access', '{"profile": {"read": true}}', true);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
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

-- Insert default app settings
INSERT INTO app_settings (key_name, value, type, description, is_public) VALUES
('app_name', 'NextDash-B', 'string', 'Application name', true),
('app_version', '1.0.0', 'string', 'Application version', true),
('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', false),
('registration_enabled', 'true', 'boolean', 'Enable user registration', true),
('email_verification_required', 'false', 'boolean', 'Require email verification', false);

-- Insert default menu items
INSERT INTO menu_items (name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES
('Dashboard', '/dashboard', 'DashboardOutlined', NULL, 1, true, 4),
('Profile', '/dashboard/profile', 'UserOutlined', NULL, 2, true, 4),
('Settings', '/dashboard/settings', 'SettingOutlined', NULL, 3, true, 4),
('Notifications', '/dashboard/notifications', 'BellOutlined', NULL, 4, true, 4),
('Admin', NULL, 'CrownOutlined', NULL, 5, true, 2),
('Users', '/dashboard/users', 'TeamOutlined', 5, 1, true, 2),
('Roles', '/dashboard/roles', 'SafetyOutlined', 5, 2, true, 2),
('App Settings', '/dashboard/admin/app-settings', 'ControlOutlined', 5, 3, true, 1),
('Menu Config', '/dashboard/admin/menu-config', 'MenuOutlined', 5, 4, true, 1);

-- Note: Admin users will be created via environment variables during setup
-- This allows for secure password handling without storing them in SQL files