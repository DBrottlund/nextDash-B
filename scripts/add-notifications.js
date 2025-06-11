const mysql = require('mysql2/promise');

async function addNotificationsTable() {
  console.log('🔔 Adding notifications system to database...');

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

    console.log('📋 Creating notifications table...');

    // Create notifications table
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        action_text VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP NULL,
        expires_at TIMESTAMP NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at),
        INDEX idx_expires_at (expires_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await connection.execute(createTableQuery);
    console.log('✅ Notifications table created');

    // Add some sample notifications for admin users
    console.log('📝 Adding sample notifications...');
    
    // Get admin users
    const [adminUsers] = await connection.execute(
      'SELECT id FROM users WHERE role_id = 1 LIMIT 2'
    );

    for (const admin of adminUsers) {
      const sampleNotifications = [
        {
          title: 'Welcome to NextDash-B!',
          message: 'Your dashboard is now set up and ready to use. Explore the features and customize your experience.',
          type: 'success',
          action_url: '/dashboard/admin/app-settings',
          action_text: 'Customize Settings'
        },
        {
          title: 'System Update Available',
          message: 'A new system update is available with enhanced security features and performance improvements.',
          type: 'info',
          action_url: '#',
          action_text: 'View Details'
        },
        {
          title: 'User Approval Required',
          message: 'New users are waiting for admin approval to access the system.',
          type: 'warning',
          action_url: '/dashboard/users',
          action_text: 'Review Users'
        }
      ];

      for (const notification of sampleNotifications) {
        await connection.execute(
          `INSERT INTO notifications (user_id, title, message, type, action_url, action_text) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [admin.id, notification.title, notification.message, notification.type, notification.action_url, notification.action_text]
        );
      }
    }

    console.log('✅ Sample notifications added');

    // Check final status
    console.log('\n📊 Final notifications table status:');
    const [count] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
    console.log(`   notifications: ${count[0].count} records`);

    // Show sample notifications
    const [notifications] = await connection.execute(
      'SELECT id, title, type, is_read FROM notifications ORDER BY created_at DESC LIMIT 5'
    );
    console.log('\n🔔 Sample notifications:');
    notifications.forEach((notif, index) => {
      const status = notif.is_read ? '✅ Read' : '🔔 Unread';
      console.log(`   ${index + 1}. ${notif.title} (${notif.type}) - ${status}`);
    });

    console.log('\n🎉 Notifications system setup completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

addNotificationsTable();