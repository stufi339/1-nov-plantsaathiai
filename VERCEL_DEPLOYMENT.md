# 🚀 Vercel Deployment Guide - Plant Saathi AI

## Quick Deploy (2 Minutes)

### Method 1: Deploy via CLI (Fastest)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

When prompted:
- **Project name:** `plant-saathi-ai` or `plantsaathi` or `plantsaathiai`
- **Framework:** Vite (auto-detected)
- **Build command:** `npm run build` (auto-detected)
- **Output directory:** `dist` (auto-detected)

### Method 2: Deploy via Dashboard

1. **Go to:** https://vercel.com/new
2. **Import Git Repository:**
   - Click "Import Git Repository"
   - Select: `stufi339/1-nov-plantsaathiai`
   - Click "Import"

3. **Configure Project:**
   - **Project Name:** `plant-saathi-ai`
   - **Framework Preset:** Vite (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   VITE_GEMINI_API_KEY
   AIzaSyCjjaEuaQMiQxgkUQLlZmGfZEOxRonx9vQ
   
   VITE_SUPABASE_URL
   https://oislgcwardyvphznqoku.supabase.co
   
   VITE_SUPABASE_ANON_KEY
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc2xnY3dhcmR5dnBoem5xb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDQ1NTgsImV4cCI6MjA3NzU4MDU1OH0.hJCvKI8Qs4tAkWBa4xKakmQs90xrhdRDQ6MkStiAzKA
   ```

5. **Click "Deploy"**

---

## 🌐 Custom Domain Setup

### Option 1: Vercel Subdomain (Free)
Your app will be at: `https://plant-saathi-ai.vercel.app`

### Option 2: Custom Domain

#### Available Domain Suggestions:
- `plantsaathi.ai` (if available)
- `plantsaathi.app`
- `plantsaathi.in`
- `plant-saathi.ai`
- `saathiai.com`
- `krishisaathi.ai`

#### To Add Custom Domain:
1. Go to your project in Vercel
2. Click "Settings" → "Domains"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

#### Domain Registrars (Recommended):
- **Namecheap** - https://www.namecheap.com
- **GoDaddy** - https://www.godaddy.com
- **Google Domains** - https://domains.google
- **Cloudflare** - https://www.cloudflare.com/products/registrar/

---

## 📋 Post-Deployment Checklist

### Immediate (After Deploy):
- [ ] Visit your live URL
- [ ] Test sign up/login
- [ ] Create a test field
- [ ] Test disease detection
- [ ] Check marketplace
- [ ] Test on mobile device

### Database Setup (Required):
- [ ] Run `SUPABASE_SETUP.sql` in Supabase dashboard
- [ ] Verify tables created
- [ ] Test data persistence

### Optional Enhancements:
- [ ] Add custom domain
- [ ] Set up analytics
- [ ] Configure email templates
- [ ] Add sample products
- [ ] Create admin account

---

## 🎯 Vercel Project Settings

### Recommended Settings:

**General:**
- Node.js Version: 18.x or 20.x
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

**Git:**
- Production Branch: `main`
- Auto-deploy: Enabled

**Environment Variables:**
- Add all 3 variables (see above)
- Available in: Production, Preview, Development

**Domains:**
- Primary: Your custom domain or Vercel subdomain
- Redirects: Set up www → non-www (or vice versa)

---

## 🚀 Deployment Commands

### Deploy to Production:
```bash
vercel --prod
```

### Deploy Preview (Test):
```bash
vercel
```

### Check Deployment Status:
```bash
vercel ls
```

### View Logs:
```bash
vercel logs
```

### Remove Deployment:
```bash
vercel rm [deployment-url]
```

---

## 📊 Monitoring Your App

### Vercel Dashboard:
- **Analytics:** Real-time visitor stats
- **Logs:** Runtime and build logs
- **Speed Insights:** Performance metrics
- **Deployments:** History and rollback

### Supabase Dashboard:
- **Database:** Table data and queries
- **Auth:** User signups and sessions
- **Storage:** File uploads
- **Logs:** API requests and errors

---

## 🔧 Troubleshooting

### Build Fails?
1. Check build logs in Vercel
2. Verify all dependencies in package.json
3. Test build locally: `npm run build`
4. Check Node.js version compatibility

### Environment Variables Not Working?
1. Verify they're added in Vercel dashboard
2. Check spelling (case-sensitive)
3. Redeploy after adding variables
4. Use `VITE_` prefix for Vite apps

### 404 Errors on Routes?
- Already configured in `vercel.json`
- All routes redirect to index.html (SPA)

### Slow Performance?
1. Check bundle size in build output
2. Enable Vercel Speed Insights
3. Optimize images
4. Use lazy loading

---

## 🎉 Success Indicators

After deployment, you should see:
- ✅ Build completed successfully
- ✅ Deployment URL active
- ✅ All pages load correctly
- ✅ Authentication works
- ✅ Database connections work
- ✅ Mobile responsive
- ✅ HTTPS enabled
- ✅ Fast load times (<3s)

---

## 📱 Share Your App

Once live, share:
- **Live URL:** `https://your-app.vercel.app`
- **GitHub:** https://github.com/stufi339/1-nov-plantsaathiai
- **Features:** AI-powered farming assistant
- **Languages:** 8 Indian languages
- **Platform:** Web + Mobile responsive

---

## 🔄 Continuous Deployment

Every time you push to GitHub:
1. Vercel automatically detects changes
2. Builds your app
3. Runs tests (if configured)
4. Deploys to production
5. Sends notification

**Zero downtime deployments!**

---

## 💡 Pro Tips

1. **Use Preview Deployments:** Test changes before production
2. **Enable Analytics:** Track user behavior
3. **Set Up Monitoring:** Get alerts for errors
4. **Use Environment Variables:** Never commit secrets
5. **Custom Domain:** More professional
6. **CDN Benefits:** Fast global delivery
7. **Automatic HTTPS:** Secure by default

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly** on live site
2. **Run Supabase SQL setup** (if not done)
3. **Add sample products** to marketplace
4. **Create admin account**
5. **Share with beta testers**
6. **Monitor analytics**
7. **Gather feedback**
8. **Iterate and improve**

---

**Ready to deploy? Run: `vercel --prod`**

*Your farmers are waiting! 🌾*
