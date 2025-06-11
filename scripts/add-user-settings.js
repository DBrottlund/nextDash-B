const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addUserSettingsTable() {
  console.log('🚀 Adding user_settings table...');

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
    console.log('✅ Connected to database!');

    // Create user_settings table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS user_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          settings JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_settings (user_id)
      );
    `;

    await connection.execute(createTableSQL);
    console.log('✅ user_settings table created successfully!');

    // Create index
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `;

    await connection.execute(createIndexSQL);
    console.log('✅ Index created successfully!');

    await connection.end();
    console.log('🎉 User settings table setup complete!');

  } catch (error) {
    console.error('❌ Error setting up user_settings table:', error);
    process.exit(1);
  }
}

addUserSettingsTable();