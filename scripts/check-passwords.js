const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function checkPasswords() {
  console.log('🔍 Checking user passwords and hashes...');

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
    console.log('✅ Connected to database');

    // Get all users with their password hashes
    const [users] = await connection.execute('SELECT id, email, password_hash, first_name, last_name FROM users');
    
    console.log('\n👥 Users in database:');
    for (const user of users) {
      console.log(`\n📧 ${user.email} (${user.first_name} ${user.last_name})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Hash: ${user.password_hash.substring(0, 20)}...`);
      
      // Test expected passwords
      const expectedPasswords = {
        'admin@nextdash.com': 'admin123',
        'derek@usefulepton.com': '117532Uiop!!'
      };
      
      if (expectedPasswords[user.email]) {
        const expectedPassword = expectedPasswords[user.email];
        console.log(`   Expected password: ${expectedPassword}`);
        
        try {
          const isValid = await bcrypt.compare(expectedPassword, user.password_hash);
          console.log(`   Password validation: ${isValid ? '✅ CORRECT' : '❌ INCORRECT'}`);
          
          if (!isValid) {
            // Generate correct hash for reference
            const correctHash = await bcrypt.hash(expectedPassword, 12);
            console.log(`   Correct hash should be: ${correctHash.substring(0, 20)}...`);
            
            // Try to update the password
            console.log('   🔧 Fixing password hash...');
            await connection.execute(
              'UPDATE users SET password_hash = ? WHERE email = ?',
              [correctHash, user.email]
            );
            console.log('   ✅ Password hash updated');
          }
        } catch (err) {
          console.log(`   ❌ Error checking password: ${err.message}`);
        }
      }
    }

    // Verify fixes
    console.log('\n🔧 Re-checking after fixes...');
    const [updatedUsers] = await connection.execute('SELECT email, password_hash FROM users');
    
    for (const user of updatedUsers) {
      const expectedPasswords = {
        'admin@nextdash.com': 'admin123',
        'derek@usefulepton.com': '117532Uiop!!'
      };
      
      if (expectedPasswords[user.email]) {
        const isValid = await bcrypt.compare(expectedPasswords[user.email], user.password_hash);
        console.log(`${user.email}: ${isValid ? '✅ WORKING' : '❌ STILL BROKEN'}`);
      }
    }

    await connection.end();
    
    console.log('\n🎉 Password check completed!');
    console.log('\n🔑 Try logging in with:');
    console.log('   derek@usefulepton.com / 117532Uiop!!');
    console.log('   admin@nextdash.com / admin123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

require('dotenv').config({ path: '.env.local' });
checkPasswords();