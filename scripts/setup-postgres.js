const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function setupDatabase() {
  let client;
  
  try {
    console.log('🔄 Connecting to PostgreSQL database...');
    client = await pool.connect();
    
    console.log('✅ Connected to PostgreSQL database');
    
    // Read and execute schema
    console.log('📄 Reading PostgreSQL schema...');
    const schemaPath = path.join(__dirname, '..', 'database', 'postgres-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Creating tables...');
    await client.query(schema);
    console.log('✅ Tables created successfully');
    
    // Read and execute seeds
    console.log('📄 Reading seed data...');
    const seedsPath = path.join(__dirname, '..', 'database', 'postgres-seeds.sql');
    const seeds = fs.readFileSync(seedsPath, 'utf8');
    
    console.log('🔄 Inserting seed data...');
    await client.query(seeds);
    console.log('✅ Seed data inserted successfully');
    
    // Create admin users from environment variables
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('🔄 Creating admin user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      
      // Check if admin user already exists
      const existingAdmin = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [process.env.ADMIN_EMAIL]
      );
      
      if (existingAdmin.rows.length === 0) {
        await client.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, email_verified, is_approved)
          VALUES ($1, $2, $3, $4, 1, TRUE, TRUE, TRUE)
        `, [
          process.env.ADMIN_EMAIL,
          hashedPassword,
          process.env.ADMIN_FIRST_NAME || 'Admin',
          process.env.ADMIN_LAST_NAME || 'User'
        ]);
        
        console.log('✅ Admin user created successfully');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
    }
    
    // Create second admin user if configured
    if (process.env.ADMIN2_EMAIL && process.env.ADMIN2_PASSWORD) {
      console.log('🔄 Creating second admin user...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN2_PASSWORD, 12);
      
      // Check if second admin user already exists
      const existingAdmin2 = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [process.env.ADMIN2_EMAIL]
      );
      
      if (existingAdmin2.rows.length === 0) {
        await client.query(`
          INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, email_verified, is_approved)
          VALUES ($1, $2, $3, $4, 2, TRUE, TRUE, TRUE)
        `, [
          process.env.ADMIN2_EMAIL,
          hashedPassword,
          process.env.ADMIN2_FIRST_NAME || 'Derek',
          process.env.ADMIN2_LAST_NAME || 'Admin'
        ]);
        
        console.log('✅ Second admin user created successfully');
      } else {
        console.log('ℹ️  Second admin user already exists');
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    const client = await pool.connect();
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database connection successful');
    console.log('🕐 Server time:', result.rows[0].current_time);
    
    client.release();
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await pool.end();
    return false;
  }
}

// Run setup if called directly
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'test') {
    testConnection()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    setupDatabase()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

module.exports = { setupDatabase, testConnection };