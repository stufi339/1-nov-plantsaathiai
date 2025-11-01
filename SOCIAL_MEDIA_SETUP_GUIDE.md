# Social Media Links Setup Guide

## ✅ What Was Fixed

1. **Added Social Media Section** to the Profile page with:
   - Instagram link
   - YouTube link
   - Email link
   - Phone link

2. **Mobile Optimization**:
   - Large touch targets (80px minimum height)
   - Proper spacing for easy tapping
   - Active state feedback (scales down when pressed)
   - No text selection on buttons
   - Smooth transitions

3. **Easy Configuration**:
   - All links are centralized in one file
   - Simple to update without touching component code

## 🔧 How to Update Your Links

### Step 1: Open the Configuration File
Navigate to: `src/config/socialLinks.ts`

### Step 2: Update Your Links

```typescript
export const socialLinks = {
  // Replace with YOUR Instagram username
  instagram: "https://www.instagram.com/yourpage",
  
  // Replace with YOUR YouTube channel
  // Option 1: Channel handle
  youtube: "https://www.youtube.com/@yourchannelhandle",
  // Option 2: Channel ID
  // youtube: "https://www.youtube.com/channel/UCxxxxxxxxxxxxxxxxxx",
  
  // Your support email
  email: "support@plantsaathi.com",
  
  // Your contact phone (with country code)
  phone: "+919876543210",
};
```

### Step 3: Save and Test

After updating the links:
1. Save the file
2. Open your app on mobile
3. Go to Profile page
4. Tap each social media button to verify they open correctly

## 📱 Mobile Features

### Touch Optimization
- **Minimum tap area**: 80px height for easy tapping
- **Visual feedback**: Button scales down slightly when pressed
- **No accidental selection**: Text can't be selected
- **Smooth animations**: Professional feel

### Link Behavior
- **Instagram & YouTube**: Opens in new tab/app
- **Email**: Opens default email app
- **Phone**: Opens phone dialer on mobile

## 🎨 Button Colors

- **Instagram**: Purple to pink gradient
- **YouTube**: Red (#DC2626)
- **Email**: Blue (#2563EB)
- **Phone**: Green (#16A34A)

## 🔍 Testing Checklist

- [ ] Instagram link opens your actual Instagram page
- [ ] YouTube link opens your actual YouTube channel
- [ ] Email link opens email app with correct address
- [ ] Phone link opens dialer with correct number
- [ ] All buttons are easy to tap on mobile
- [ ] Buttons have visual feedback when pressed
- [ ] Links work on both iOS and Android

## 📝 Example Links

### Instagram
```
https://www.instagram.com/plantsaathi
https://www.instagram.com/farmingapp
```

### YouTube
```
https://www.youtube.com/@plantsaathi
https://www.youtube.com/channel/UCxxxxxxxxxxxxxx
https://www.youtube.com/c/YourChannelName
```

### Email
```
support@plantsaathi.com
contact@yourapp.com
help@example.com
```

### Phone
```
+919876543210  (India)
+14155552671   (USA)
+447911123456  (UK)
```

## 🚀 Quick Update

To quickly update just your Instagram and YouTube:

1. Open `src/config/socialLinks.ts`
2. Find these two lines:
   ```typescript
   instagram: "https://www.instagram.com/yourpage",
   youtube: "https://www.youtube.com/@yourchannel",
   ```
3. Replace `yourpage` and `yourchannel` with your actual handles
4. Save the file

That's it! Your links are now live.

## 💡 Tips

1. **Test on actual mobile device**: Emulators don't always behave like real devices
2. **Use HTTPS**: Always use secure links (https://)
3. **Verify handles**: Make sure your Instagram/YouTube handles are correct
4. **Check country codes**: Phone numbers need proper country codes (+91 for India)

## 🐛 Troubleshooting

### Instagram/YouTube not opening
- Make sure the URL is correct
- Check if you have the app installed
- Try opening the link in a browser first

### Email not working
- Verify the email address is correct
- Check if you have an email app configured

### Phone not dialing
- Ensure the number includes country code
- Format: `+[country code][number]` (no spaces in the href)

## 📍 Where to Find

- **Configuration File**: `src/config/socialLinks.ts`
- **Profile Component**: `src/components/profile/ProfileView.tsx`
- **Mobile Styles**: `src/styles/mobile-optimizations.css`

---

**Need help?** The social media section appears at the bottom of the Profile page, just above the app version info.
