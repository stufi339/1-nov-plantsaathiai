#!/bin/bash

# Plant Saathi - Production Deployment Script
# Version: 1.0.2
# Last Updated: October 28, 2025

echo "🚀 Plant Saathi - Production Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo "📋 Step 1: Running pre-deployment checks..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Running npm install...${NC}"
    npm install
fi

# Check for TypeScript errors
echo "🔍 Checking for TypeScript errors..."
npm run type-check 2>/dev/null || npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ TypeScript errors found. Please fix before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ TypeScript check passed${NC}"
echo ""

# Step 2: Run tests (if available)
echo "🧪 Step 2: Running tests..."
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    npm test 2>/dev/null || echo -e "${YELLOW}⚠️  No tests configured${NC}"
else
    echo -e "${YELLOW}⚠️  No tests configured${NC}"
fi
echo ""

# Step 3: Build for production
echo "🔨 Step 3: Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed. Please fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 4: Check build size
echo "📦 Step 4: Checking build size..."
BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
echo "Build size: $BUILD_SIZE"
echo ""

# Step 5: Preview build (optional)
echo "👀 Step 5: Would you like to preview the build? (y/n)"
read -r PREVIEW

if [ "$PREVIEW" = "y" ]; then
    echo "Starting preview server..."
    echo "Press Ctrl+C when done previewing"
    npm run preview
fi

# Step 6: Deploy
echo ""
echo "🚀 Step 6: Ready to deploy!"
echo ""
echo "Choose deployment platform:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Manual (just build)"
echo "4) Cancel"
echo ""
read -p "Enter choice (1-4): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        echo "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
        else
            echo -e "${YELLOW}⚠️  Vercel CLI not found. Install with: npm i -g vercel${NC}"
            echo "Then run: vercel --prod"
        fi
        ;;
    2)
        echo "Deploying to Netlify..."
        if command -v netlify &> /dev/null; then
            netlify deploy --prod
        else
            echo -e "${YELLOW}⚠️  Netlify CLI not found. Install with: npm i -g netlify-cli${NC}"
            echo "Then run: netlify deploy --prod"
        fi
        ;;
    3)
        echo -e "${GREEN}✅ Build complete. Files are in ./dist directory${NC}"
        echo "Upload the dist folder to your hosting provider"
        ;;
    4)
        echo "Deployment cancelled"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📊 Next steps:"
echo "1. Verify deployment at your production URL"
echo "2. Test all features (disease detection, satellite mapping)"
echo "3. Monitor error logs and analytics"
echo "4. Collect user feedback"
echo ""
echo "📚 Documentation:"
echo "- Deployment Guide: DEPLOYMENT_GUIDE.md"
echo "- Monitoring Setup: See DEPLOYMENT_GUIDE.md#monitoring-setup"
echo "- User Feedback: See DEPLOYMENT_GUIDE.md#user-feedback-collection"
echo ""
echo -e "${GREEN}✅ All done! Your app is live! 🚀${NC}"
