#!/bin/bash
# NextDash-B Hostinger Docker Setup Script

set -e

echo "🏭 NextDash-B Hostinger Docker Setup"
echo "===================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from Hostinger template..."
    cp .env.hostinger .env
    echo "✅ .env file created. Please update it with your actual values."
    echo ""
    echo "🔧 Required updates in .env file:"
    echo "   1. NEXT_PUBLIC_APP_URL=https://yourdomain.com"
    echo "   2. Database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)"
    echo "   3. JWT secrets (run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "   4. SMTP configuration"
    echo "   5. Admin user details"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Validate required environment variables
source .env

required_vars=("NEXT_PUBLIC_APP_URL" "DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]] || [[ "${!var}" == *"generate-"* ]] || [[ "${!var}" == *"yourdomain"* ]]; then
        echo "❌ Please update $var in .env file"
        exit 1
    fi
done

echo "✅ Environment validation passed"

# Test database connection first
echo "🔍 Testing database connection..."
if ! docker run --rm --env-file .env node:18-alpine sh -c "
npm install mysql2 -g && node -e \"
const mysql = require('mysql2/promise');
(async () => {
  try {
    const connection = await mysql.createConnection({
      host: '$DB_HOST',
      port: $DB_PORT,
      user: '$DB_USER',
      password: '$DB_PASSWORD',
      database: '$DB_NAME',
      ssl: false,
      connectTimeout: 30000
    });
    console.log('✅ Database connection successful');
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
})();
\""; then
    echo ""
    echo "❌ Database connection failed!"
    echo "🔧 Troubleshooting:"
    echo "   1. Verify Remote MySQL is enabled in Hostinger"
    echo "   2. Check if your server IP is whitelisted"
    echo "   3. Confirm database credentials are correct"
    echo "   4. Try using % (wildcard) in Remote MySQL settings"
    exit 1
fi

# Build and start services using Hostinger config
echo "🏗️  Building Docker image for Hostinger..."
docker-compose -f docker-compose.hostinger.yml build

echo "🚀 Starting NextDash-B for Hostinger..."
docker-compose -f docker-compose.hostinger.yml up -d

echo "⏳ Waiting for application to start..."
sleep 15

# Set up database
echo "🗄️  Setting up database..."
if docker-compose -f docker-compose.hostinger.yml exec nextdash-app node scripts/setup-env-users.js; then
    echo "✅ Database setup completed"
else
    echo "⚠️  Database setup had issues, but continuing..."
fi

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed, but application may still be starting..."
fi

echo ""
echo "🎉 NextDash-B is now running on Hostinger!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Local: http://localhost:3000"
echo "   🌐 Production: $NEXT_PUBLIC_APP_URL"
echo "   🔑 Admin Login: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo ""
echo "🐳 Hostinger Docker management:"
echo "   📊 View logs: docker-compose -f docker-compose.hostinger.yml logs -f"
echo "   🔄 Restart: docker-compose -f docker-compose.hostinger.yml restart"
echo "   🛑 Stop: docker-compose -f docker-compose.hostinger.yml down"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose -f docker-compose.hostinger.yml ps"
echo "   docker-compose -f docker-compose.hostinger.yml exec nextdash-app sh"
echo "   docker-compose -f docker-compose.hostinger.yml logs nextdash-app"
echo ""
echo "📝 Next steps:"
echo "   1. Configure your domain DNS to point to this server"
echo "   2. Set up SSL/TLS certificate (Let's Encrypt recommended)"
echo "   3. Configure reverse proxy if needed"
echo "   4. Monitor logs for any issues"