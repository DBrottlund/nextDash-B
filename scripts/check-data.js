const mysql = require('mysql2/promise');

async function checkData() {
  console.log('🔍 Checking database data...');

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
    
    // Check all tables and their data
    const tables = ['roles', 'users', 'app_settings', 'menu_items'];
    
    for (const table of tables) {
      try {
        const [rows] = await connection.execute(`SELECT * FROM ${table}`);
        console.log(`\n📋 Table: ${table}`);
        console.log(`   Records: ${rows.length}`);
        
        if (table === 'users' && rows.length > 0) {
          rows.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (Role: ${user.role_id})`);
          });
        } else if (table === 'roles' && rows.length > 0) {
          rows.forEach((role, index) => {
            console.log(`   ${index + 1}. ${role.name} (ID: ${role.id})`);
          });
        } else if (rows.length > 0) {
          console.log(`   Sample: ${JSON.stringify(rows[0], null, 2)}`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${table}: ${err.message}`);
      }
    }
    
    // If users table is empty, let's try to add users manually
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (userCount[0].count === 0) {
      console.log('\n🔧 Users table is empty. Adding users manually...');
      
      // Check if roles exist first
      const [roleCount] = await connection.execute('SELECT COUNT(*) as count FROM roles');
      if (roleCount[0].count === 0) {
        console.log('   Adding roles first...');
        const roleInserts = [
          "INSERT INTO roles (id, name, description, permissions) VALUES (1, 'Admin', 'Full system access', '{\"users\": [\"create\", \"read\", \"update\", \"delete\"], \"roles\": [\"create\", \"read\", \"update\", \"delete\"], \"settings\": [\"read\", \"update\"], \"admin\": [\"access\"]}')",
          "INSERT INTO roles (id, name, description, permissions) VALUES (2, 'Manager', 'Management access', '{\"users\": [\"create\", \"read\", \"update\"], \"dashboard\": [\"read\"]}')",
          "INSERT INTO roles (id, name, description, permissions) VALUES (3, 'User', 'Standard access', '{\"dashboard\": [\"read\"]}')",
          "INSERT INTO roles (id, name, description, permissions) VALUES (4, 'Guest', 'Limited access', '{\"dashboard\": [\"read\"]}')"
        ];
        
        for (const roleInsert of roleInserts) {
          try {
            await connection.execute(roleInsert);
            console.log('   ✅ Role added');
          } catch (err) {
            console.log(`   ⚠️  Role warning: ${err.message}`);
          }
        }
      }
      
      // Add users
      const userInserts = [
        "INSERT INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified) VALUES ('admin@nextdash.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2lFUrmV5WW', 1, 'Admin', 'User', TRUE, TRUE)",
        "INSERT INTO users (email, password_hash, role_id, first_name, last_name, is_active, email_verified) VALUES ('derek@usefulepton.com', '$2b$12$8YQqkzV7oQUGvGXaFKLsKeZYS9xzKwNhvXwrQcQjGZJhOhYXc9Hte', 1, 'Derek', 'Brottlund', TRUE, TRUE)"
      ];
      
      for (const userInsert of userInserts) {
        try {
          await connection.execute(userInsert);
          console.log('   ✅ User added');
        } catch (err) {
          console.log(`   ⚠️  User warning: ${err.message}`);
        }
      }
      
      // Check again
      const [newUserCount] = await connection.execute('SELECT * FROM users');
      console.log(`\n✅ Users table now has ${newUserCount.length} records:`);
      newUserCount.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
      });
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
checkData();