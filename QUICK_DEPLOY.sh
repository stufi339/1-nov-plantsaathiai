#!/bin/bash

# Plant Saathi AI - Quick Deploy Script
# Run this after fixing GitHub access

echo "🚀 Plant Saathi AI - Production Deployment"
echo "=========================================="
echo ""

# Check if repository exists
echo "📋 Step 1: Setting up GitHub remote..."
git remote remove production 2>/dev/null
git remote add production git@github.com:stufi339/1-nov-plantsaathiai.git

echo ""
echo "📤 Step 2: Pushing to GitHub..."
if git push -u production main; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your code is now on GitHub!"
    echo "🔗 Repository: https://github.com/stufi339/1-nov-plantsaathiai"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Deploy to Vercel: vercel --prod"
    echo "2. Or deploy to Netlify: netlify deploy --prod --dir=dist"
    echo "3. Configure environment variables on your hosting platform"
    echo ""
else
    echo "❌ Push failed. Trying HTTPS instead..."
    git remote remove production
    git remote add production https://github.com/stufi339/1-nov-plantsaathiai.git
    
    if git push -u production main; then
        echo "✅ Successfully pushed to GitHub via HTTPS!"
        echo ""
        echo "🎉 Your code is now on GitHub!"
        echo "🔗 Repository: https://github.com/stufi339/1-nov-plantsaathiai"
    else
        echo "❌ Push failed. Please check:"
        echo "1. Repository exists: https://github.com/stufi339/1-nov-plantsaathiai"
        echo "2. You have access to the repository"
        echo "3. Your GitHub credentials are correct"
        echo ""
        echo "📖 See GITHUB_PUSH_INSTRUCTIONS.md for detailed help"
    fi
fi
