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
```bash
docker-compose up -d
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