const mysql = require('mysql2/promise');

async function completeSetup() {
  console.log('🔧 Completing database setup...');

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

    // Add app settings
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
        console.log('   ✅ Setting added');
      } catch (err) {
        console.log(`   ⚠️  Setting warning: ${err.message}`);
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
    const tables = ['roles', 'users', 'app_settings', 'menu_items'];
    
    for (const table of tables) {
      const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   ${table}: ${count[0].count} records`);
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Admin accounts ready:');
    console.log('   • admin@nextdash.com / admin123');
    console.log('   • derek@usefulepton.com / 117532Uiop!!');
    console.log('\n🚀 Run: npm run dev');

    await connection.end();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
completeSetup();