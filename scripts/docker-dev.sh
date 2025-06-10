#!/bin/bash
# NextDash-B Docker Development Setup

set -e

echo "🐳 NextDash-B Docker Development Setup"
echo "======================================"

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local
    echo "✅ .env.local created. Update it with your configuration."
    echo ""
    echo "For local development with Docker MySQL:"
    echo "   DB_HOST=mysql"
    echo "   DB_NAME=nextdash_dev"
    echo "   DB_USER=nextdash"
    echo "   DB_PASSWORD=password"
    echo ""
    read -p "Press Enter after updating .env.local to continue..."
fi

echo "🏗️  Building development containers..."
docker-compose -f docker-compose.dev.yml build

echo "🚀 Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for MySQL to be ready..."
sleep 15

# Set up database with local MySQL
echo "🗄️  Setting up database..."
docker-compose -f docker-compose.dev.yml exec nextdash-dev npm run setup-env

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📱 Access your application:"
echo "   🌐 Web App: http://localhost:3000"
echo "   🗄️  MySQL: localhost:3306"
echo "   📊 Redis: localhost:6379"
echo ""
echo "🔧 Development commands:"
echo "   docker-compose -f docker-compose.dev.yml logs -f  # View logs"
echo "   docker-compose -f docker-compose.dev.yml down     # Stop services"
echo "   docker-compose -f docker-compose.dev.yml restart  # Restart services"