# NextDash-B Vercel Deployment Guide

This guide will help you deploy your NextDash-B application to Vercel with Neon PostgreSQL database.

## Prerequisites

- [x] Neon PostgreSQL database configured
- [x] Environment variables prepared
- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Login to Vercel

```bash
vercel login
```

## Step 2: Configure Environment Variables

You have two options:

### Option A: Set via Vercel CLI
```bash
# Set each environment variable
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
# ... continue for all variables in .env.production
```

### Option B: Set via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Import your project
3. Go to Settings > Environment Variables
4. Copy all variables from `.env.production` file

## Step 3: Deploy

### Quick Deploy
```bash
npm run deploy
```

### Manual Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## Step 4: Set Up Database (First Deploy Only)

After your first successful deployment:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel dashboard with your actual domain
2. Set up the database schema:
   ```bash
   # Update your .env.local with production DATABASE_URL temporarily
   npm run setup-postgres
   ```

## Environment Variables Checklist

Copy these from `.env.production` to Vercel:

### Required
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `JWT_SECRET` - Generated 64-character secret
- `JWT_REFRESH_SECRET` - Generated 64-character secret
- `ADMIN_EMAIL` - Your admin email
- `ADMIN_PASSWORD` - Secure admin password

### Optional
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` - For email functionality
- `FROM_EMAIL` - Email sender address
- `NEXT_PUBLIC_APP_NAME` - Application name
- `DEBUG`, `LOG_LEVEL` - Logging configuration

## Post-Deployment Testing

1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
2. **Database Connection**: Check logs for database connection success
3. **Admin Login**: Test login with your admin credentials
4. **API Routes**: Test key functionality like user registration

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correctly set in Vercel
- Check Neon dashboard for connection limits
- Ensure SSL is properly configured

### Build Failures
- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Ensure TypeScript compilation succeeds locally

### API Route Errors
- Check function logs in Vercel dashboard
- Verify environment variables are set
- Test API routes locally first

## Domain Configuration

1. Add your custom domain in Vercel dashboard
2. Update `NEXT_PUBLIC_APP_URL` environment variable
3. Configure DNS as instructed by Vercel

## Monitoring

- Use Vercel Analytics for performance monitoring
- Check function logs for errors
- Monitor database usage in Neon dashboard

## Security Notes

- Never commit `.env.production` to git
- Rotate JWT secrets periodically
- Use strong admin passwords
- Enable 2FA on your Vercel account

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review this guide
3. Check Neon database status
4. Verify environment variables are correctly set