const mysql = require('mysql2/promise');

async function checkTables() {
  console.log('🔍 Checking database tables...');

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
    
    // Show all tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Found ${tables.length} tables:`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${Object.values(table)[0]}`);
    });
    
    if (tables.length === 0) {
      console.log('\n❌ No tables found! Schema creation may have failed.');
      console.log('Let me check for any errors...');
      
      // Try creating tables one by one to see where it fails
      const createTableCommands = [
        'CREATE TABLE IF NOT EXISTS roles (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50) UNIQUE NOT NULL, description TEXT, permissions JSON, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)',
        'CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY AUTO_INCREMENT, email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, role_id INT NOT NULL DEFAULT 4, first_name VARCHAR(100), last_name VARCHAR(100), avatar_url VARCHAR(500), is_active BOOLEAN DEFAULT TRUE, email_verified BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, last_login TIMESTAMP NULL, INDEX idx_email (email), INDEX idx_role (role_id), INDEX idx_active (is_active))'
      ];
      
      for (const [index, command] of createTableCommands.entries()) {
        try {
          await connection.execute(command);
          console.log(`✅ Created table ${index + 1}`);
        } catch (err) {
          console.log(`❌ Failed to create table ${index + 1}: ${err.message}`);
        }
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
checkTables();