# NextDash-B Local Setup with Hostinger Database

## 📋 Prerequisites
- Node.js 18+
- Your Hostinger database credentials

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Edit `.env.local` and update these values:

```bash
# Replace with your actual database password from Hostinger
DB_PASSWORD="YOUR_ACTUAL_PASSWORD_HERE"

# Generate secure random secrets (run the command below twice)
JWT_SECRET="your-generated-secret-here"
JWT_REFRESH_SECRET="your-generated-refresh-secret-here"
```

**Generate secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Configure Admin Users (Optional)
Add your admin users to `.env.local`:
```bash
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

### 4. Set Up Database
```bash
npm run setup-env
```

This will:
- ✅ Create all database tables
- ✅ Insert default roles (Admin, Manager, User, Guest)
- ✅ Create admin users from your environment variables
- ✅ Hash passwords securely with bcrypt
- ✅ Add default app settings
- ✅ Set up menu structure

### 5. Start Development Server
```bash
npm run dev
```

### 6. Access Your App
- 🌐 Open: http://localhost:3000
- 🔑 Login with your configured admin credentials from `.env.local`

## 🗄️ Database Details
- **Host:** srv1090.hstgr.io
- **Database:** u400736858_nextdashb
- **User:** u400736858_nextdashb
- **Port:** 3306
- **SSL:** Enabled

## 🛠️ Alternative Database Setup
If the script doesn't work, you can manually set up the database:

1. Go to your Hostinger control panel
2. Open phpMyAdmin for your database
3. Copy and paste the contents of `database/schema.sql`
4. Then run each file in `database/seeds/` in this order:
   - `roles.sql`
   - `admin_user.sql`
   - `app_settings.sql`
   - `menu_items.sql`

## 🔧 Troubleshooting

### Connection Issues
- Check your database password in `.env.local`
- Ensure your IP is allowed in Hostinger (if restricted)
- Verify SSL is enabled in your database settings

### Missing Dependencies
```bash
npm install --force
```

### Database Errors
- Check that all tables were created successfully
- Verify seed data was inserted
- Ensure the admin user exists

## 📱 Default Admin Account
- **Email:** admin@nextdash.com
- **Password:** admin123
- **Role:** Admin (full access)

## ✨ What's Included
- 🔐 JWT Authentication with RBAC
- 👥 User & Role Management
- 🎨 5 Theme Variants + Dark Mode
- 📱 Responsive Dashboard
- ⚙️ Admin Settings Panel
- 🛡️ Security Middleware
- 🗄️ Database Integration

Ready to build your SaaS application! 🚀