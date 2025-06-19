#!/bin/bash

# Vercel Environment Variables Setup Script
echo "Setting up environment variables for NextDash-B on Vercel..."

# Essential Database Configuration
echo "DATABASE_URL=postgres://neondb_owner:npg_rw6oPnmjZaf4@ep-shy-heart-a5kgjutc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require" | vercel env add DATABASE_URL production --stdin

# Authentication Secrets
echo "b5911a41a0db1b053d7fc41a0dfae47d00991b5cc910aa0d8495745399e407a110d9c6c3185fb3c2d81c73ffed26b134696df8cfa1c3b9374758f589584f0f93" | vercel env add JWT_SECRET production --stdin

echo "30eec767a38e0b9e002186c8e8191f7cf88110b6d8d39a9e380eeb8961afea06c54eab2b8bc7a2556bba82f07316c22e8f9174d258c39277bc6cd59f4bcf88ac" | vercel env add JWT_REFRESH_SECRET production --stdin

# Application Configuration
echo "production" | vercel env add NODE_ENV production --stdin
echo "NextDash-B" | vercel env add NEXT_PUBLIC_APP_NAME production --stdin
echo "https://nextdash-5mfvexiup-dereks-projects-4fc61fe1.vercel.app" | vercel env add NEXT_PUBLIC_APP_URL production --stdin

# Admin Users
echo "admin@your-domain.com" | vercel env add ADMIN_EMAIL production --stdin
echo "secure-admin-password" | vercel env add ADMIN_PASSWORD production --stdin
echo "Admin" | vercel env add ADMIN_FIRST_NAME production --stdin
echo "User" | vercel env add ADMIN_LAST_NAME production --stdin

# Additional Configuration
echo "1h" | vercel env add JWT_EXPIRES_IN production --stdin
echo "7d" | vercel env add JWT_REFRESH_EXPIRES_IN production --stdin
echo "12" | vercel env add BCRYPT_ROUNDS production --stdin

echo "✅ Environment variables setup complete!"
echo "🚀 Redeploying application..."

# Redeploy to apply environment variables
vercel --prod --yes

echo "🎉 Deployment complete!"
echo "📱 Your app: https://nextdash-5mfvexiup-dereks-projects-4fc61fe1.vercel.app"