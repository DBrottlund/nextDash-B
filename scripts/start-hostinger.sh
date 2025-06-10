#!/bin/sh
# Hostinger startup script - runs both app and worker in single container

echo "🚀 Starting NextDash-B for Hostinger..."

# Wait for external database to be available
echo "⏳ Waiting for database connection..."
timeout=60
while [ $timeout -gt 0 ]; do
    if node -e "
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: false,
      connectTimeout: 10000
    });
    console.log('✅ Database connected');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
})();
" 2>/dev/null; then
        echo "✅ Database is ready"
        break
    fi
    echo "⏳ Database not ready, retrying in 2 seconds... ($timeout seconds remaining)"
    sleep 2
    timeout=$((timeout - 2))
done

if [ $timeout -le 0 ]; then
    echo "❌ Database connection timeout. Starting anyway..."
fi

# Start worker in background if enabled
if [ "$WORKER_ENABLED" = "true" ]; then
    echo "🔧 Starting background worker..."
    node worker/src/index.js &
    WORKER_PID=$!
    echo "✅ Worker started with PID $WORKER_PID"
fi

# Start the main application
echo "🌐 Starting Next.js application..."
exec node server.js