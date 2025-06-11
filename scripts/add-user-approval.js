const mysql = require('mysql2/promise');

async function addUserApprovalColumns() {
  console.log('🚀 Adding user approval columns to existing users table...');

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

    console.log('📋 Adding approval columns to users table...');

    // Add the missing columns
    const alterQueries = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_by INT NULL',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL',
      'ALTER TABLE users ADD INDEX IF NOT EXISTS idx_approved (is_approved)'
    ];

    for (const query of alterQueries) {
      try {
        await connection.execute(query);
        console.log(`   ✅ ${query.split(' ')[3]} column added`);
      } catch (err) {
        if (err.message.includes('Duplicate column name') || err.message.includes('Duplicate key name')) {
          console.log(`   ⚠️  Column/Index already exists: ${err.message}`);
        } else {
          console.log(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }

    // Update existing admin users to be approved
    console.log('👤 Updating existing admin users...');
    try {
      const [result] = await connection.execute(
        'UPDATE users SET is_approved = TRUE WHERE role_id = 1 AND is_approved = FALSE'
      );
      console.log(`   ✅ Updated ${result.affectedRows} admin users to approved status`);
    } catch (err) {
      console.log(`   ⚠️  Update warning: ${err.message}`);
    }

    // Add foreign key constraint
    console.log('🔗 Adding foreign key constraint...');
    try {
      await connection.execute(
        'ALTER TABLE users ADD CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL'
      );
      console.log('   ✅ Foreign key constraint added');
    } catch (err) {
      if (err.message.includes('Duplicate foreign key constraint name')) {
        console.log('   ⚠️  Foreign key constraint already exists');
      } else {
        console.log(`   ⚠️  Foreign key warning: ${err.message}`);
      }
    }

    // Check final status
    console.log('\n📊 Final users table status:');
    const [users] = await connection.execute(
      'SELECT email, first_name, last_name, is_approved, role_id FROM users ORDER BY id'
    );
    
    users.forEach((user, index) => {
      const status = user.is_approved ? '✅ Approved' : '⏳ Pending';
      const role = user.role_id === 1 ? 'Admin' : user.role_id === 2 ? 'Manager' : user.role_id === 3 ? 'User' : 'Guest';
      console.log(`   ${index + 1}. ${user.email} (${user.first_name} ${user.last_name}) - ${role} - ${status}`);
    });

    console.log('\n🎉 User approval system setup completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

addUserApprovalColumns();