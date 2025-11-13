# ⚡ PWA Quick Start Card

## 🎯 4 Steps to Launch (6 minutes)

### 1️⃣ Logo (1 min)
```bash
# Save your Plant Saathi logo
# File: public/logo.png
# Size: 512x512px minimum
```

### 2️⃣ Icons (2 min)
```
Visit: https://www.pwabuilder.com/imageGenerator
→ Upload logo
→ Generate
→ Download
→ Extract to public/
```

### 3️⃣ VAPID (2 min)
```bash
npx web-push generate-vapid-keys
echo "VITE_VAPID_PUBLIC_KEY=your_key" >> .env
```

### 4️⃣ SQL (1 min)
```
Supabase → SQL Editor → Run PWA_SUPABASE_SETUP.sql
```

## 🚀 Deploy
```bash
git add .
git commit -m "Add PWA"
git push origin main
```

## 📱 Test
- Android: Chrome → Add to Home Screen
- iOS: Safari → Share → Add to Home Screen
- Desktop: Install icon in address bar

## 🔥 Witty Notifications
- "Barish aa rahi hai… aur aapke crops ka attitude bhi."
- "Bhai, yeh wala problem Google bhi nahi solve karega."
- "Aapka crop aaj full influencer mode — Mandi price trending!"
- "Field thoda sad lag raha hai. Jaake pyaar dikhao."
- "Pests: typing…"

## 📚 Docs
- **FINAL_SETUP_STEPS.md** - Detailed guide
- **START_HERE_PWA.md** - Quick start
- **WITTY_NOTIFICATIONS_GUIDE.md** - All messages

## ✅ Done!
Your PWA is live! Farmers can install and get witty notifications! 🌾📱
