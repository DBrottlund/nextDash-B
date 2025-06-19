# Pre-Deployment Checklist ✅

## Before Deploying to Vercel

### ✅ **Completed Items:**
- [x] Database migrated from MySQL to PostgreSQL
- [x] Neon database configured and tested
- [x] Environment variables prepared
- [x] Build tested locally and passes
- [x] PostgreSQL schema and seed data created
- [x] Admin users configured
- [x] Vercel configuration files created
- [x] Git repository updated with deployment config

### 🔄 **In Progress:**
- [ ] Vercel CLI login completed
- [ ] Project deployed to Vercel
- [ ] Environment variables set in Vercel dashboard

### 📋 **Environment Variables to Set in Vercel:**

**Essential (Required):**
```
DATABASE_URL=postgres://neondb_owner:npg_rw6oPnmjZaf4@ep-shy-heart-a5kgjutc-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=b5911a41a0db1b053d7fc41a0dfae47d00991b5cc910aa0d8495745399e407a110d9c6c3185fb3c2d81c73ffed26b134696df8cfa1c3b9374758f589584f0f93
JWT_REFRESH_SECRET=30eec767a38e0b9e002186c8e8191f7cf88110b6d8d39a9e380eeb8961afea06c54eab2b8bc7a2556bba82f07316c22e8f9174d258c39277bc6cd59f4bcf88ac
NODE_ENV=production
```

**Authentication & Admin:**
```
ADMIN_EMAIL=admin@your-domain.com
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_FIRST_NAME=Admin
ADMIN_LAST_NAME=User
ADMIN2_EMAIL=derek@your-domain.com
ADMIN2_PASSWORD=your-secure-derek-password
ADMIN2_FIRST_NAME=Derek
ADMIN2_LAST_NAME=Admin
```

**Application Settings:**
```
NEXT_PUBLIC_APP_NAME=NextDash-B
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

**Optional (Email/SMTP):**
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@your-domain.com
```

### 🚀 **Deployment Steps:**

1. **Complete Vercel Login:**
   ```bash
   vercel login
   ```

2. **Deploy Project:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard
   - Navigate to Project > Settings > Environment Variables
   - Add all variables listed above

4. **Update Domain:**
   - Set `NEXT_PUBLIC_APP_URL` to your actual Vercel domain

5. **Test Deployment:**
   - Visit your app URL
   - Test login with admin credentials
   - Verify database connectivity

### 🔍 **Post-Deployment Testing:**

- [ ] Health check: `/api/health`
- [ ] Admin login works
- [ ] Database queries function
- [ ] User registration works
- [ ] File uploads work (if applicable)

### 🛠 **Troubleshooting:**

If deployment fails:
1. Check Vercel build logs
2. Verify environment variables
3. Test local build: `npm run build`
4. Check database connectivity

**Ready to deploy!** 🚀