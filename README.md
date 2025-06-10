# NextDash-B

A modern, feature-rich SaaS dashboard boilerplate built with Next.js 14, TypeScript, and Ant Design.

## 🚀 Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Ant Design 5.x
- **Authentication**: Custom JWT-based auth with role-based access control (RBAC)
- **Database**: MySQL/MariaDB support with connection pooling
- **Theme System**: 5 color themes with dark/light mode support
- **Responsive Design**: Mobile-first responsive layout
- **Admin Panel**: Configurable app settings and menu management
- **Worker System**: Background job processing with Node.js worker
- **Security**: Input validation, rate limiting, CORS protection

## 📋 Prerequisites

- Node.js 18+ 
- MySQL/MariaDB database
- npm or yarn package manager

## 🛠️ Installation

### 1. **Clone and Install**
```bash
git clone https://github.com/DBrottlund/nextDash-B.git
cd nextDash-B
npm install
```

### 2. **Set up Environment Variables**
```bash
cp .env.example .env.local
```

### 3. **Configure Hostinger Database**
In your Hostinger Control Panel:

**Enable Remote MySQL:**
- Go to **Hosting → Manage → Databases → Remote MySQL**
- Add your IP address or use `%` for all IPs
- Save changes

**Get Database Credentials:**
- Go to **Databases → MySQL Databases**
- Note your host (format: `srv###.hstgr.io`)
- Note your database name and username (format: `u######_dbname`)
- Copy your password

**Complete `.env.local` Configuration:**
```bash
# App Configuration
NEXT_PUBLIC_APP_NAME="NextDash-B"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Database Configuration (Hostinger)
# Find these in Hostinger Control Panel > Databases > MySQL Databases
# Host format: srv[number].hstgr.io (e.g., srv574.hstgr.io)
DB_HOST="srv574.hstgr.io"
DB_PORT="3306"
DB_NAME="u[account]_[dbname]"
DB_USER="u[account]_[dbname]"
DB_PASSWORD="your_database_password"
DB_SSL="false"

# Authentication
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET="generate-64-char-random-string"
JWT_REFRESH_SECRET="generate-another-64-char-random-string"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration (SMTP2GO or other)
SMTP_HOST="mail.smtp2go.com"
SMTP_PORT="2525"
SMTP_USER="your-smtp-username@example.com"
SMTP_PASSWORD="your-smtp-password"
FROM_EMAIL="noreply@yourdomain.com"

# Redis Configuration (optional, for job queue)
REDIS_URL="redis://localhost:6379"

# Worker Configuration
WORKER_ENABLED="true"
WORKER_INTERVAL="60000"

# File Upload
MAX_FILE_SIZE="5MB"
UPLOAD_DIR="./uploads"

# Security
BCRYPT_ROUNDS="12"
RATE_LIMIT_WINDOW="15"
RATE_LIMIT_MAX="100"

# Analytics (optional)
GOOGLE_ANALYTICS_ID=""

# Development
DEBUG="true"
LOG_LEVEL="debug"

# Default Admin Users (for database setup)
ADMIN_EMAIL="your-email@example.com"
ADMIN_PASSWORD="your-secure-password"
ADMIN_FIRST_NAME="Your"
ADMIN_LAST_NAME="Name"

# Secondary Admin User (optional)
ADMIN2_EMAIL="admin@example.com"
ADMIN2_PASSWORD="admin123"
ADMIN2_FIRST_NAME="Admin"
ADMIN2_LAST_NAME="User"
```

**Key Configuration Notes:**
- Replace `srv574.hstgr.io` with your actual Hostinger server
- Replace `u[account]_[dbname]` with your actual database credentials
- Generate secure JWT secrets using the provided command
- Configure your SMTP provider (SMTP2GO example shown)
- Set your admin user credentials for database setup

### 4. **Test Database Connection**
```bash
npm run test-db
```

### 5. **Set up Database (Single Command)**
```bash
npm run setup-env
```

This creates:
- ✅ All database tables
- ✅ User roles with permissions
- ✅ Admin users from your environment variables
- ✅ App settings and menu structure

### 6. **Start Development**
```bash
npm run dev
```

### 7. **Access Your App**
- 🌐 Open: http://localhost:3000
- 🔑 Login with your configured admin credentials

## 🐳 Docker Installation (Alternative)

NextDash-B includes complete Docker support for easy deployment and development.

### **Prerequisites:**
- Docker & Docker Compose installed
- Hostinger database credentials

### **Production Deployment with Docker:**

#### **Option 1: Automated Setup (Recommended)**
```bash
git clone https://github.com/DBrottlund/nextDash-B.git
cd nextDash-B
npm run docker:up
```

This script will:
- ✅ Create `.env` file from template
- ✅ Validate required environment variables
- ✅ Build Docker images
- ✅ Start all services (app + Redis + worker)
- ✅ Set up database automatically
- ✅ Display access information

#### **Option 2: Manual Docker Setup**
```bash
# 1. Copy environment template
cp .env.docker .env

# 2. Update .env with your Hostinger credentials
# (Same configuration as shown above)

# 3. Start services
docker-compose up -d

# 4. Set up database
docker-compose exec nextdash-app node scripts/setup-env-users.js

# 5. View logs
docker-compose logs -f
```

### **Development with Docker:**
```bash
# Start development environment (includes MySQL)
npm run docker:dev

# This provides:
# - NextDash-B app on http://localhost:3000
# - Local MySQL database on localhost:3306
# - Redis on localhost:6379
# - Hot reload for development
```

### **Docker Services:**

**Production Stack (`docker-compose.yml`):**
- **nextdash-app**: Main application (port 3000)
- **redis**: Caching and job queue
- **nextdash-worker**: Background job processor

**Development Stack (`docker-compose.dev.yml`):**
- **nextdash-dev**: Development app with hot reload
- **mysql**: Local MySQL database
- **redis**: Local Redis instance

### **Docker Management Commands:**
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f nextdash-app

# Restart services
docker-compose restart

# Stop all services
docker-compose down

# Update and rebuild
docker-compose build --no-cache
docker-compose up -d

# Access app container shell
docker-compose exec nextdash-app sh

# Run database setup inside container
docker-compose exec nextdash-app node scripts/setup-env-users.js
```

### **Docker Environment Variables:**

Create `.env` file with these variables:
```bash
# Database (Hostinger)
DB_HOST=srv574.hstgr.io
DB_NAME=u400736858_nextdashb
DB_USER=u400736858_nextdashb
DB_PASSWORD=your_database_password

# JWT Secrets (generate with crypto)
JWT_SECRET=your-64-char-random-string
JWT_REFRESH_SECRET=your-64-char-refresh-string

# Admin Users
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User

# Email Configuration
SMTP_HOST=mail.smtp2go.com
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
FROM_EMAIL=noreply@yourdomain.com
```

### **Docker Health Monitoring:**
- **Health check endpoint**: `GET /api/health`
- **Automatic container restarts** on failure
- **Log aggregation** with Docker Compose
- **Volume persistence** for uploads and data

### **Production Considerations:**
- Uses **multi-stage builds** for optimized images
- **Non-root user** for security
- **Health checks** for container monitoring
- **Persistent volumes** for uploads and logs
- **Network isolation** between services
- **Automatic restarts** unless stopped

## 🏭 Hostinger Deployment with Docker

For deploying on **Hostinger VPS/Cloud** with external database:

### **Prerequisites:**
- Hostinger VPS or Cloud hosting
- Docker installed on server
- Remote MySQL enabled in Hostinger control panel

### **Quick Hostinger Setup:**
```bash
# Clone and deploy in one command
git clone https://github.com/DBrottlund/nextDash-B.git
cd nextDash-B
npm run docker:hostinger
```

### **What's Different for Hostinger:**

#### **🗄️ External Database Connection:**
- Uses your **existing Hostinger MySQL database**
- **No local MySQL container** (connects to `srv###.hstgr.io`)
- **Database connection testing** before startup
- **Longer timeouts** for external database connectivity

#### **🚀 Simplified Architecture:**
- **Single container** deployment (app + worker)
- **No Redis dependency** (optional caching)
- **Persistent volumes** for uploads and logs
- **Health checks** optimized for external database

#### **⚙️ Hostinger Environment (`.env.hostinger`):**
```bash
# External Database (your Hostinger database)
DB_HOST=srv574.hstgr.io                    # Your Hostinger server
DB_NAME=u400736858_nextdashb               # Your database name  
DB_USER=u400736858_nextdashb               # Your database user
DB_PASSWORD=your_actual_database_password  # Your database password
DB_SSL=false                               # Hostinger doesn't use SSL

# Production URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com # Your actual domain

# No Redis/Worker containers needed
WORKER_ENABLED=false                       # Runs in same container
```

### **Hostinger Deployment Steps:**

1. **Prepare Server:**
   ```bash
   # Install Docker on Hostinger VPS
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application:**
   ```bash
   git clone https://github.com/DBrottlund/nextDash-B.git
   cd nextDash-B
   npm run docker:hostinger
   ```

3. **Configure Domain:**
   - Point your domain to the VPS IP
   - Set up SSL certificate (Let's Encrypt)
   - Configure reverse proxy (Nginx) if needed

### **Hostinger-Specific Commands:**
```bash
# Deploy to Hostinger
npm run docker:hostinger

# Manual Hostinger setup
npm run docker:hostinger-up

# View Hostinger logs
docker-compose -f docker-compose.hostinger.yml logs -f

# Stop Hostinger deployment
npm run docker:hostinger-down

# Rebuild for Hostinger
npm run docker:hostinger-build
```

### **Networking Considerations:**

#### **🔧 Hostinger Database Access:**
- **Remote MySQL must be enabled** in Hostinger control panel
- **Server IP must be whitelisted** (or use `%` wildcard)
- **Connection timeout increased** for external database
- **Database connectivity tested** before app startup

#### **🌐 Production URLs:**
- Update `NEXT_PUBLIC_APP_URL` to your actual domain
- Configure SSL termination (Nginx/Cloudflare)
- Set up domain DNS to point to your VPS

#### **🔒 Security:**
- **Firewall rules** for port 3000 (or use reverse proxy)
- **SSL certificate** for HTTPS
- **Environment variable security** (no secrets in logs)
- **Database connection encryption** handled by Hostinger

### **Monitoring & Maintenance:**
```bash
# Health check endpoint
curl https://yourdomain.com/api/health

# Container logs
docker-compose -f docker-compose.hostinger.yml logs -f nextdash-app

# Database connection test
docker-compose -f docker-compose.hostinger.yml exec nextdash-app node scripts/test-connection.js

# Restart application
docker-compose -f docker-compose.hostinger.yml restart

# Update deployment
git pull origin main
docker-compose -f docker-compose.hostinger.yml build --no-cache
docker-compose -f docker-compose.hostinger.yml up -d
```

## 🎯 Quick Start

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Login with your configured admin credentials from `.env.local`
3. Explore the dashboard features and admin settings

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test-db` - Test database connection
- `npm run setup-env` - **Complete database setup with environment users**
- `npm run diagnose-db` - Troubleshoot database connection issues
- `npm run docker:up` - **Complete Docker setup with script**
- `npm run docker:dev` - Development environment with Docker
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker logs

## 📁 Project Structure

```
nextDash-B/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities & configuration
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # State management (Zustand)
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # CSS and theme files
├── worker/                     # Background job worker
├── database/                   # Database schema & migrations
└── docs/                       # Documentation
```

## 🔐 Default Roles & Permissions

- **Admin**: Full system access
- **Manager**: User management and dashboard access
- **User**: Standard dashboard access
- **Guest**: Limited read-only access

## 🎨 Themes

The application supports 5 built-in themes:
- Default (Blue-gray)
- Blue
- Green  
- Purple
- Orange

Each theme supports both light and dark modes.

## 🔧 Configuration

### App Settings
Configure app name, logo, description, and other settings via the admin panel at `/dashboard/admin/app-settings`.

### Menu Configuration
Customize navigation menu items and permissions at `/dashboard/admin/menu-config`.

### Environment Variables
See `.env.example` for all available configuration options.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment

**Option 1: Automated Setup Script**
```bash
# Quick setup with script
npm run docker:up
```

**Option 2: Manual Docker Compose**
```bash
# Copy environment file
cp .env.docker .env

# Update .env with your configuration
# Then start services
docker-compose up -d

# Set up database
docker-compose exec nextdash-app node scripts/setup-env-users.js
```

**Option 3: Single Container**
```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

### Hostinger Deployment
1. Upload files to your hosting directory
2. Configure environment variables in your hosting panel
3. Set up the MySQL database using the provided schema
4. Run the application

## 🧪 Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 🔧 Hostinger Setup Troubleshooting

### **Database Connection Issues:**

1. **"Access denied" errors:**
   - Verify Remote MySQL is enabled in Hostinger
   - Check your IP is whitelisted (or use `%` for all IPs)
   - Confirm exact password in Hostinger control panel
   - Try resetting the database password

2. **"Host not found" errors:**
   - Double-check the host format: `srv###.hstgr.io`
   - Find correct host in Hostinger → Databases → MySQL

3. **"Connection timeout" errors:**
   - Your IP might not be whitelisted
   - Try using `%` (wildcard) in Remote MySQL settings

### **Useful Diagnostic Commands:**
```bash
npm run test-db        # Test basic connection
npm run diagnose-db    # Try multiple connection methods
```

### **Manual Database Setup:**
If remote connection fails, use phpMyAdmin:
1. Go to Hostinger → Databases → phpMyAdmin
2. Copy/paste contents of `database/schema.sql`
3. Run each file in `database/seeds/` folder
4. Manually create admin users in the `users` table

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Role Management
- `GET /api/roles` - List roles
- `POST /api/roles` - Create role
- `PUT /api/roles/[id]` - Update role

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@nextdash.com
- 📖 Documentation: [View Docs](./docs/)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/nextdash-b/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Ant Design](https://ant.design/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management