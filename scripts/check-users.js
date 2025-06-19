const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await pool.query('SELECT id, email, first_name, last_name, role_id, is_active, email_verified, is_approved FROM users');
    
    if (users.rows.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.rows.length} users:`);
      users.rows.forEach(user => {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name}) - Role: ${user.role_id}, Active: ${user.is_active}, Approved: ${user.is_approved}`);
      });
    }
    
    // Also check roles
    const roles = await pool.query('SELECT id, name FROM roles ORDER BY id');
    console.log(`\n📋 Roles available:`);
    roles.rows.forEach(role => {
      console.log(`  - ID: ${role.id}, Name: ${role.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers();