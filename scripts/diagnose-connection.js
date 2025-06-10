const mysql = require('mysql2/promise');

async function diagnoseConnection() {
  console.log('🔍 Advanced Database Connection Diagnosis');
  console.log('=========================================');

  // Test different password variations
  const passwords = [
    '117532NextDashB',      // Current password
    '117532nextdashb',      // Lowercase
    '117532NEXTDASHB',      // Uppercase
    'NextDashB117532',      // Reversed
  ];

  // Test different user variations
  const users = [
    'u400736858_nextdashb',     // Current user
    'u400736858_nextdash',      // Without 'b'
    'u400736858_nextDashB',     // Camel case
    'nextdashb',                // Short form
  ];

  const host = 'srv574.hstgr.io';
  const database = 'u400736858_nextdashb';

  console.log(`\n📊 Testing Connection Matrix:`);
  console.log(`Host: ${host}`);
  console.log(`Database: ${database}`);
  console.log(`Your IP: 129.222.125.144`);
  console.log('');

  let successCount = 0;

  for (const user of users) {
    for (const password of passwords) {
      const config = {
        host,
        port: 3306,
        user,
        password,
        database,
        ssl: false,
        connectTimeout: 10000, // Shorter timeout for faster testing
      };

      try {
        console.log(`🔑 Testing: ${user} / ${password.slice(0, 3)}***${password.slice(-3)}`);
        
        const connection = await mysql.createConnection(config);
        
        // Test query
        const [rows] = await connection.execute('SELECT VERSION() as version, USER() as current_user');
        
        console.log('✅ SUCCESS!');
        console.log(`   MySQL Version: ${rows[0].version}`);
        console.log(`   Current User: ${rows[0].current_user}`);
        console.log(`   Working Config:`);
        console.log(`     User: ${user}`);
        console.log(`     Password: ${password}`);
        
        // Check privileges
        try {
          const [privs] = await connection.execute('SHOW GRANTS');
          console.log(`   Privileges: ${privs.length} grants found`);
        } catch (err) {
          console.log(`   Privileges: Could not check (${err.message})`);
        }
        
        await connection.end();
        successCount++;
        
        // If we found a working combination, update env suggestion
        if (successCount === 1) {
          console.log('\n🎉 WORKING CREDENTIALS FOUND!');
          console.log('Update your .env.local with:');
          console.log(`DB_USER="${user}"`);
          console.log(`DB_PASSWORD="${password}"`);
        }
        
      } catch (error) {
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
          console.log('❌ Access denied');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
          console.log('❌ Database not found');
        } else if (error.code === 'ETIMEDOUT') {
          console.log('❌ Timeout');
        } else {
          console.log(`❌ Error: ${error.code || error.message}`);
        }
      }
    }
  }

  console.log(`\n📈 Summary: ${successCount} successful connections found`);
  
  if (successCount === 0) {
    console.log('\n🚨 No working combinations found. Possible issues:');
    console.log('   1. Remote MySQL not properly enabled');
    console.log('   2. IP not whitelisted correctly');
    console.log('   3. User/password incorrect');
    console.log('   4. Database name incorrect');
    console.log('   5. Hostinger firewall blocking connection');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Log into Hostinger control panel');
    console.log('   2. Go to MySQL Databases');
    console.log('   3. Check exact username and reset password');
    console.log('   4. Go to Remote MySQL and verify IP whitelist');
    console.log('   5. Try using % (wildcard) for all IPs temporarily');
  }
}

diagnoseConnection().catch(console.error);