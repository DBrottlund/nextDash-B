const mysql = require('mysql2/promise');

async function fixAvatarColumn() {
  console.log('🔧 Fixing avatar_url column to support base64 images...');

  require('dotenv').config({ path: '.env.local' });

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

    console.log('📋 Updating avatar_url column type...');

    // Change column from VARCHAR(500) to TEXT to support long base64 strings
    await connection.execute(
      'ALTER TABLE users MODIFY COLUMN avatar_url TEXT'
    );
    
    console.log('✅ avatar_url column updated to TEXT type');

    // Check the column definition
    const [columns] = await connection.execute(
      'DESCRIBE users'
    );
    
    const avatarColumn = columns.find(col => col.Field === 'avatar_url');
    console.log('📊 Avatar column info:', avatarColumn);

    console.log('\n🎉 Avatar column fix completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

fixAvatarColumn();