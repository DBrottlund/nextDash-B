#!/bin/bash

# NextDash-B Vercel Deployment Script

echo "🚀 Starting NextDash-B deployment to Vercel..."

# Check if logged into Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami > /dev/null 2>&1; then
    echo "❌ Not logged into Vercel. Please run: vercel login"
    exit 1
fi

echo "✅ Vercel authentication confirmed"

# Build the project locally first to catch any errors
echo "🔨 Building project locally..."
if ! npm run build; then
    echo "❌ Local build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Local build successful"

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel deploy --prod

echo "🎉 Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "1. Check the deployment URL provided above"
echo "2. Set environment variables in Vercel dashboard if not already set"
echo "3. Run database setup: npm run setup-postgres (if needed)"
echo "4. Test your application"
echo ""
echo "🔧 Environment variables to set in Vercel dashboard:"
echo "- All variables from .env.production file"
echo "- Make sure to update NEXT_PUBLIC_APP_URL with your actual domain"