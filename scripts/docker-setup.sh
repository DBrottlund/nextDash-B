#!/bin/bash
# NextDash-B Docker Setup Script

set -e

echo "🐳 NextDash-B Docker Setup"
echo "=========================="

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
    echo "📝 Creating .env file from template..."
    cp .env.docker .env
    echo "✅ .env file created. Please update it with your actual values."
    echo ""
    echo "🔧 Required updates in .env file:"
    echo "   1. Database credentials (DB_HOST, DB_NAME, DB_USER, DB_PASSWORD)"
    echo "   2. JWT secrets (run: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\")"
    echo "   3. SMTP configuration"
    echo "   4. Admin user details"
    echo ""
    read -p "Press Enter after updating .env file to continue..."
fi

# Validate required environment variables
source .env

required_vars=("DB_HOST" "DB_NAME" "DB_USER" "DB_PASSWORD" "JWT_SECRET" "ADMIN_EMAIL" "ADMIN_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"your_"* ]] || [[ "${!var}" == *"generate-"* ]]; then
        echo "❌ Please update $var in .env file"
        exit 1
    fi
done

echo "✅ Environment validation passed"

# Build and start services
echo "🏗️  Building Docker images..."
docker-compose build

echo "🚀 Starting NextDash-B services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Set up database
echo "🗄️  Setting up database..."
docker-compose exec nextdash-app node scripts/setup-env-users.js

echo ""
echo "🎉 NextDash-B is now running!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Web App: http://localhost:3000"
echo "   🔑 Admin Login: $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo ""
echo "🐳 Docker services:"
echo "   📊 View logs: docker-compose logs -f"
echo "   🔄 Restart: docker-compose restart"
echo "   🛑 Stop: docker-compose down"
echo ""
echo "🔧 Useful commands:"
echo "   docker-compose ps                    # View running services"
echo "   docker-compose exec nextdash-app sh  # Access app container"
echo "   docker-compose logs nextdash-app     # View app logs"