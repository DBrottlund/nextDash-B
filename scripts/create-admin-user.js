const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    
    const email = 'derek@usefulepton.com';
    const password = '117532Uiop!!';
    const firstName = 'Derek';
    const lastName = 'Admin';
    
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists with this email');
      return;
    }
    
    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Insert new admin user
    const result = await pool.query(`
      INSERT INTO users (
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role_id, 
        is_active, 
        is_approved, 
        email_verified,
        created_at, 
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, email, first_name, last_name, role_id
    `, [
      email,
      passwordHash,
      firstName,
      lastName,
      1, // Admin role
      true, // is_active
      true, // is_approved
      true, // email_verified
      new Date(), // created_at
      new Date()  // updated_at
    ]);
    
    console.log('✅ Admin user created successfully:');
    console.log(`  - ID: ${result.rows[0].id}`);
    console.log(`  - Email: ${result.rows[0].email}`);
    console.log(`  - Name: ${result.rows[0].first_name} ${result.rows[0].last_name}`);
    console.log(`  - Role ID: ${result.rows[0].role_id} (Admin)`);
    console.log(`  - Password: ${password}`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

createAdminUser();