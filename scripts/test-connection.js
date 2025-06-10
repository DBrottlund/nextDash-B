const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Testing database connection...');

  // Try multiple configurations
  const configs = [
    {
      name: 'Primary Config',
      host: 'srv574.hstgr.io',
      port: 3306,
      user: 'u400736858_nextdashb',
      password: '117532NextDashB',
      database: 'u400736858_nextdashb',
      ssl: false,
      connectTimeout: 60000,
    },
    {
      name: 'Alternative Host 1',
      host: 'mysql.hostinger.com',
      port: 3306,
      user: 'u400736858_nextdashb',
      password: '117532NextDashB',
      database: 'u400736858_nextdashb',
      ssl: false,
      connectTimeout: 60000,
    },
    {
      name: 'Alternative Host 2',
      host: 'mysql.srv1090.hstgr.io',
      port: 3306,
      user: 'u400736858_nextdashb',
      password: '117532NextDashB',
      database: 'u400736858_nextdashb',
      ssl: false,
      connectTimeout: 60000,
    }
  ];

  for (const config of configs) {
    try {
      console.log(`\n📡 Testing ${config.name}...`);
      console.log(`   Host: ${config.host}`);
      console.log(`   User: ${config.user}`);
      console.log(`   Database: ${config.database}`);
      
      const connection = await mysql.createConnection(config);
      console.log('✅ Connection successful!');
      
      // Test a simple query
      const [rows] = await connection.execute('SELECT 1 as test');
      console.log('✅ Query test successful:', rows);
      
      // Show existing tables (if any)
      try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 Existing tables:', tables.length);
      } catch (err) {
        console.log('📋 No tables found or error checking tables');
      }
      
      await connection.end();
      console.log(`✅ ${config.name} connection test completed successfully!`);
      console.log(`\n🎉 Working configuration found! Update your .env.local with:`);
      console.log(`DB_HOST="${config.host}"`);
      return;
      
    } catch (error) {
      console.error(`❌ ${config.name} failed:`, error.message);
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.log('   → Access denied (credentials or IP issue)');
      } else if (error.code === 'ENOTFOUND') {
        console.log('   → Host not found');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('   → Connection timeout');
      }
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('💡 Troubleshooting:');
  console.log('   1. Double-check database password in Hostinger');
  console.log('   2. Ensure Remote MySQL is enabled');
  console.log('   3. Verify your IP is whitelisted');
  console.log('   4. Contact Hostinger support for correct host/credentials');
}

testConnection();