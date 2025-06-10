const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 Setting up NextDash-B database...');

  // Database configuration
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
    // Connect to database
    console.log('📡 Connecting to database...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!');

    // Read and execute schema
    console.log('📋 Creating database schema...');
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf8');
    
    // Replace database references with environment variable
    const processedSQL = schemaSQL
      .replace(/CREATE DATABASE IF NOT EXISTS nextdash_b;/g, `-- Database already exists: ${process.env.DB_NAME}`)
      .replace(/USE nextdash_b;/g, `-- Using database: ${process.env.DB_NAME}`);
    
    // Split SQL commands and execute them one by one
    const commands = processedSQL.split(';').filter(cmd => cmd.trim().length > 0 && !cmd.trim().startsWith('--'));
    
    for (const command of commands) {
      const trimmedCommand = command.trim();
      if (trimmedCommand && !trimmedCommand.startsWith('--')) {
        try {
          await connection.execute(trimmedCommand);
        } catch (err) {
          console.warn(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }
    console.log('✅ Schema created successfully!');

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
      console.log(`   📄 Processing ${path.basename(seedFile)}...`);
      const seedSQL = fs.readFileSync(path.join(__dirname, seedFile), 'utf8');
      const seedCommands = seedSQL.split(';').filter(cmd => cmd.trim().length > 0);
      
      for (const command of seedCommands) {
        if (command.trim()) {
          await connection.execute(command);
        }
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

// Load environment variables
require('dotenv').config({ path: '.env.local' });

setupDatabase();