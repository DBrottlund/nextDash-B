-- Default app settings

INSERT INTO app_settings (key_name, value, type, description, is_public) VALUES 
('app_name', 'NextDash-B', 'string', 'Application name displayed in header', true),
('app_description', 'Modern SaaS Dashboard Boilerplate', 'string', 'Application description', true),
('app_logo_url', '/logo.png', 'string', 'URL to application logo', true),
('app_favicon_url', '/favicon.ico', 'string', 'URL to application favicon', true),
('landing_mode', 'login', 'string', 'Landing page mode: login or marketing', false),
('theme_default', 'default', 'string', 'Default theme name', true),
('dark_mode_enabled', 'true', 'boolean', 'Enable dark mode toggle', true),
('user_registration_enabled', 'true', 'boolean', 'Allow new user registration', false),
('guest_access_enabled', 'true', 'boolean', 'Allow guest user access', false),
('email_verification_required', 'false', 'boolean', 'Require email verification for new users', false),
('max_file_upload_size', '5', 'number', 'Maximum file upload size in MB', false),
('session_timeout_minutes', '60', 'number', 'User session timeout in minutes', false);