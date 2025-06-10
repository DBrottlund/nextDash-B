const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupSimple() {
  console.log('🚀 Setting up NextDash-B database (Simple)...');

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
        avatar_url VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_role (role_id),
        INDEX idx_active (is_active)
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

    // Insert seed data
    console.log('🌱 Inserting seed data...');
    
    const seedFiles = [
      '../database/seeds/roles.sql',
      '../database/seeds/admin_user.sql',
      '../database/seeds/derek_user.sql',
      '../database/seeds/app_settings.sql',
      '../database/seeds/menu_items.sql'
    ];

    for (const seedFile of seedFiles) {
      try {
        console.log(`   📄 Processing ${path.basename(seedFile)}...`);
        const seedSQL = fs.readFileSync(path.join(__dirname, seedFile), 'utf8');
        const seedCommands = seedSQL.split(';').filter(cmd => cmd.trim().length > 0);
        
        for (const command of seedCommands) {
          const trimmedCommand = command.trim();
          if (trimmedCommand && !trimmedCommand.startsWith('--')) {
            await connection.execute(trimmedCommand);
          }
        }
        console.log(`   ✅ ${path.basename(seedFile)} completed`);
      } catch (err) {
        console.warn(`   ⚠️  ${path.basename(seedFile)} warning: ${err.message}`);
      }
    }

    console.log('✅ Seed data inserted successfully!');
    console.log('');
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('📝 Admin accounts created:');
    console.log('   Default Admin: admin@nextdash.com / admin123');
    console.log('   Derek Admin: derek@usefulepton.com / 117532Uiop!!');
    console.log('');
    console.log('🚀 You can now run: npm run dev');

    await connection.end();
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

require('dotenv').config({ path: '.env.local' });
setupSimple();