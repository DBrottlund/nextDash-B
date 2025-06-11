const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupWithEnvUsers() {
  console.log('🚀 Setting up NextDash-B database with environment users...');

  // Validate required environment variables
  const requiredVars = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_FIRST_NAME', 'ADMIN_LAST_NAME'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing required environment variable: ${varName}`);
      process.exit(1);
    }
  }

  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    connectTimeout: 60000,
  };

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!');

    console.log('📋 Creating tables in order...');

    // Create tables in dependency order
    const tableCreationOrder = [
      // 1. Roles table (no dependencies)
      `CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        permissions JSON,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // 2. Users table (references roles)
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role_id INT NOT NULL DEFAULT 4,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        avatar_url TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        approved_by INT NULL,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role_id),
        INDEX idx_active (is_active),
        INDEX idx_approved (is_approved)
      )`,

      // 3. User sessions table (references users)
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        refresh_token_hash VARCHAR(255),
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_agent VARCHAR(500),
        ip_address VARCHAR(45),
        INDEX idx_user_id (user_id),
        INDEX idx_token (token_hash),
        INDEX idx_expires (expires_at)
      )`,

      // 4. App settings table (no dependencies)
      `CREATE TABLE IF NOT EXISTS app_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (key_name),
        INDEX idx_public (is_public)
      )`,

      // 5. Menu items table (self-referencing)
      `CREATE TABLE IF NOT EXISTS menu_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        path VARCHAR(255),
        icon VARCHAR(50),
        parent_id INT NULL,
        order_index INT DEFAULT 0,
        enabled BOOLEAN DEFAULT TRUE,
        required_role_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent (parent_id),
        INDEX idx_order (order_index),
        INDEX idx_enabled (enabled)
      )`,

      // 6. Guest users table (no dependencies)
      `CREATE TABLE IF NOT EXISTS guest_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        fingerprint VARCHAR(255) UNIQUE NOT NULL,
        data JSON,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_fingerprint (fingerprint),
        INDEX idx_expires (expires_at)
      )`,

      // 7. Admin settings table (no dependencies)
      `CREATE TABLE IF NOT EXISTS admin_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (setting_key)
      )`,

      // 8. Password reset tokens table (references users)
      `CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires (expires_at)
      )`,

      // 9. Email verification tokens table (references users)
      `CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires (expires_at)
      )`
    ];

    for (const [index, sql] of tableCreationOrder.entries()) {
      try {
        await connection.execute(sql);
        console.log(`   ✅ Table ${index + 1} created`);
      } catch (err) {
        console.warn(`   ⚠️  Table ${index + 1} warning: ${err.message}`);
      }
    }

    console.log('✅ Tables created successfully!');

    // Insert roles
    console.log('👥 Adding roles...');
    const roleInserts = [
      "INSERT IGNORE INTO roles (id, name, description, permissions) VALUES (1, 'Admin', 'Full system access with admin panel', '{\"users\": {\"create\": true, \"read\": true, \"update\": true, \"delete\": true}, \"roles\": {\"create\": true, \"read\": true, \"update\": true, \"delete\": true}, \"settings\": {\"read\": true, \"update\": true}, \"admin\": {\"access\": true}, \"dashboard\": {\"access\": true}}')",
      "INSERT IGNORE INTO roles (id, name, description, permissions) VALUES (2, 'Manager', 'Management access with user management', '{\"users\": {\"create\": true, \"read\": true, \"update\": true, \"delete\": false}, \"roles\": {\"read\": true}, \"settings\": {\"read\": true}, \"dashboard\": {\"access\": true}}')",
      "INSERT IGNORE INTO roles (id, name, description, permissions) VALUES (3, 'User', 'Standard user access', '{\"dashboard\": {\"access\": true}, \"settings\": {\"read\": true}}')",
      "INSERT IGNORE INTO roles (id, name, description, permissions) VALUES (4, 'Guest', 'Limited guest access', '{\"dashboard\": {\"access\": true}}')"
    ];

    for (const insert of roleInserts) {
      try {
        await connection.execute(insert);
        console.log('   ✅ Role added');
      } catch (err) {
        console.log(`   ⚠️  Role warning: ${err.message}`);
      }
    }

    // Generate password hashes and add users from environment
    console.log('👤 Adding admin users from environment...');
    
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    console.log(`   🔒 Hashed password for ${process.env.ADMIN_EMAIL}`);
    
    let admin2PasswordHash = null;
    if (process.env.ADMIN2_EMAIL && process.env.ADMIN2_PASSWORD) {
      admin2PasswordHash = await bcrypt.hash(process.env.ADMIN2_PASSWORD, 12);
      console.log(`   🔒 Hashed password for ${process.env.ADMIN2_EMAIL}`);
    }

    // Insert primary admin user
    try {
      await connection.execute(
        'INSERT IGNORE INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          process.env.ADMIN_EMAIL,
          adminPasswordHash,
          1, // Admin role
          process.env.ADMIN_FIRST_NAME,
          process.env.ADMIN_LAST_NAME,
          true,
          true,
          true // Admin users are automatically approved
        ]
      );
      console.log(`   ✅ Primary admin user added: ${process.env.ADMIN_EMAIL}`);
    } catch (err) {
      console.log(`   ⚠️  Primary admin warning: ${err.message}`);
    }

    // Insert secondary admin user (if provided)
    if (admin2PasswordHash && process.env.ADMIN2_EMAIL) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            process.env.ADMIN2_EMAIL,
            admin2PasswordHash,
            1, // Admin role
            process.env.ADMIN2_FIRST_NAME || 'Admin',
            process.env.ADMIN2_LAST_NAME || 'User',
            true,
            true,
            true // Admin users are automatically approved
          ]
        );
        console.log(`   ✅ Secondary admin user added: ${process.env.ADMIN2_EMAIL}`);
      } catch (err) {
        console.log(`   ⚠️  Secondary admin warning: ${err.message}`);
      }
    }

    // Add admin settings
    console.log('⚙️ Adding admin settings...');
    const adminSettingsInserts = [
      // Theme & Appearance
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('theme_mode', 'light', 'Default theme mode: light or dark')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('css_style', 'default', 'CSS style theme: default, modern, classic, minimal, vibrant')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('app_name', 'NextDash-B', 'Application name')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('app_logo_url', '', 'Application logo URL')",
      
      // Access Control
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('allow_guest_access', 'false', 'Allow guest users to access the system')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('allow_user_signup', 'true', 'Allow new users to sign up')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('require_user_approval', 'false', 'Require admin approval for new user accounts')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('email_verification_required', 'false', 'Require email verification for new accounts')",
      
      // Front Page
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('front_page_mode', 'login', 'Front page mode: login or html')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('front_page_html', '', 'Custom HTML content for front page')",
      
      // Security
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('session_timeout', '24', 'Session timeout in hours')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('max_login_attempts', '5', 'Maximum login attempts before lockout')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('lockout_duration', '30', 'Account lockout duration in minutes')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('password_min_length', '8', 'Minimum password length')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('password_require_special', 'false', 'Require special characters in passwords')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('password_require_numbers', 'false', 'Require numbers in passwords')",
      "INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES ('password_require_uppercase', 'false', 'Require uppercase letters in passwords')"
    ];

    for (const insert of adminSettingsInserts) {
      try {
        await connection.execute(insert);
        console.log('   ✅ Admin setting added');
      } catch (err) {
        console.log(`   ⚠️  Admin setting warning: ${err.message}`);
      }
    }

    // Add legacy app settings for backward compatibility
    console.log('⚙️ Adding app settings...');
    const settingsInserts = [
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('app_name', 'NextDash-B', 'string', 'Application name displayed in header', true)",
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('app_description', 'Modern SaaS Dashboard Boilerplate', 'string', 'Application description', true)",
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('app_logo_url', '/logo.png', 'string', 'URL to application logo', true)",
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('theme_default', 'default', 'string', 'Default theme name', true)",
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('dark_mode_enabled', 'true', 'boolean', 'Enable dark mode toggle', true)",
      "INSERT IGNORE INTO app_settings (key_name, value, type, description, is_public) VALUES ('user_registration_enabled', 'true', 'boolean', 'Allow new user registration', false)"
    ];

    for (const insert of settingsInserts) {
      try {
        await connection.execute(insert);
        console.log('   ✅ App setting added');
      } catch (err) {
        console.log(`   ⚠️  App setting warning: ${err.message}`);
      }
    }

    // Add menu items
    console.log('📋 Adding menu items...');
    const menuInserts = [
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (1, 'Dashboard', '/dashboard', 'DashboardOutlined', NULL, 1, TRUE, 4)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (2, 'Users', '/dashboard/users', 'UserOutlined', NULL, 2, TRUE, 2)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (3, 'Roles', '/dashboard/roles', 'TeamOutlined', NULL, 3, TRUE, 1)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (4, 'Settings', '/dashboard/settings', 'SettingOutlined', NULL, 4, TRUE, 3)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (5, 'Admin', NULL, 'ToolOutlined', NULL, 5, TRUE, 1)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (6, 'App Settings', '/dashboard/admin/app-settings', 'AppstoreOutlined', 5, 1, TRUE, 1)",
      "INSERT IGNORE INTO menu_items (id, name, path, icon, parent_id, order_index, enabled, required_role_id) VALUES (7, 'Menu Config', '/dashboard/admin/menu-config', 'MenuOutlined', 5, 2, TRUE, 1)"
    ];

    for (const insert of menuInserts) {
      try {
        await connection.execute(insert);
        console.log('   ✅ Menu item added');
      } catch (err) {
        console.log(`   ⚠️  Menu warning: ${err.message}`);
      }
    }

    // Final check
    console.log('\n📊 Final database status:');
    const tables = ['roles', 'users', 'admin_settings', 'app_settings', 'menu_items', 'user_sessions', 'guest_users'];
    
    for (const table of tables) {
      try {
        const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${count[0].count} records`);
      } catch (err) {
        console.log(`   ${table}: Table check failed - ${err.message}`);
      }
    }

    // Show created users
    const [users] = await connection.execute('SELECT email, first_name, last_name FROM users ORDER BY id');
    console.log('\n👤 Created admin users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.first_name} ${user.last_name})`);
    });

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🔑 Login credentials:');
    console.log(`   • ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    if (process.env.ADMIN2_EMAIL) {
      console.log(`   • ${process.env.ADMIN2_EMAIL} / ${process.env.ADMIN2_PASSWORD}`);
    }
    
    console.log('\n✨ Features enabled:');
    console.log('   🎨 Dark mode & 5 CSS themes (Default, Modern, Classic, Minimal, Vibrant)');
    console.log('   ⚙️  Comprehensive admin settings dashboard');
    console.log('   👥 User management with approval workflow');
    console.log('   🔐 Role-based access control with granular permissions');
    console.log('   🏠 Dynamic front page with login/HTML toggle');
    console.log('   🔒 Security controls and session management');
    console.log('   🎯 Guest access and signup configuration');
    
    console.log('\n🚀 Run: npm run dev');

    await connection.end();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

require('dotenv').config({ path: '.env.local' });
setupWithEnvUsers();