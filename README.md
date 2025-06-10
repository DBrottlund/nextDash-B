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

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd nextDash-B
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your database credentials and other settings.

4. **Set up the database**
   ```bash
   # Create database and run migrations
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Start the worker (optional)**
   ```bash
   npm run worker:dev
   ```

## 🎯 Quick Start

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Use the demo account: `admin@nextdash.com` / `admin123`
3. Or create a new account via the registration form
4. Explore the dashboard features and admin settings

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