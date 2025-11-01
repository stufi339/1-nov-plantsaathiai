# 🧪 Plant Saathi AI - Complete Testing Guide

## 🎯 Manual Testing Checklist

### Prerequisites:
- App running at: http://localhost:8080
- Supabase database set up (run SUPABASE_SETUP.sql)
- Browser: Chrome/Firefox/Safari

---

## 1. Authentication Testing ✅

### Test Sign Up (Email):
1. Go to: http://localhost:8080/auth
2. Click "Sign Up" tab
3. Enter:
   - Full Name: `Test Farmer`
   - Email: `test@farmer.com`
   - Password: `password123`
4. Click "Create Account"
5. **Expected:** Success message, redirect to dashboard

### Test Sign In (Email):
1. Go to: http://localhost:8080/auth
2. Click "Sign In" tab
3. Enter same credentials
4. Click "Sign In"
5. **Expected:** Welcome message, redirect to dashboard

### Test Phone OTP:
1. Go to: http://localhost:8080/auth
2. Click "Phone" tab
3. Enter: `+91 9876543210`
4. Click "Send OTP"
5. **Expected:** OTP sent message (requires SMS provider setup)

### Test Protected Routes:
1. Sign out (if signed in)
2. Try to access: http://localhost:8080/dashboard
3. **Expected:** Redirect to /auth

---

## 2. Dashboard Testing ✅

### Test Dashboard Load:
1. Sign in
2. Go to: http://localhost:8080/dashboard
3. **Check:**
   - ✅ Weather card displays
   - ✅ Fields overview shows
   - ✅ Quick actions visible
   - ✅ Critical alerts section
   - ✅ Bottom navigation works

### Test Navigation:
1. Click each bottom nav item:
   - Dashboard
   - Soil Saathi
   - Disease Detection
   - Marketplace
   - Profile
2. **Expected:** Each page loads correctly

---

## 3. Soil Saathi Testing ✅

### Test Field Creation:
1. Go to: http://localhost:8080/soilsati
2. Click "Add New Field"
3. Enter field details:
   - Name: `Test Rice Field`
   - Crop: `Rice`
   - Area: `5.5`
4. Click "Save"
5. **Expected:** Field created, appears in list

### Test Field Details:
1. Click on created field
2. **Check:**
   - ✅ NDVI, NDWI, EVI values display
   - ✅ Soil properties show
   - ✅ Health score visible
   - ✅ Recommendations appear

### Test Satellite Data:
1. In field details
2. Click "Update Satellite Data"
3. **Expected:** Loading, then updated values

---

## 4. Disease Detection Testing ✅

### Test Image Upload:
1. Go to: http://localhost:8080/disease
2. Click "Upload Image" or "Take Photo"
3. Select a plant image
4. **Expected:** Image preview shows

### Test Detection:
1. After uploading image
2. Click "Detect Disease"
3. **Expected:**
   - Loading indicator
   - Disease name appears
   - Confidence score shows
   - Treatment recommendations display

### Test History:
1. Perform multiple detections
2. Check history section
3. **Expected:** All detections listed

---

## 5. Marketplace Testing ✅

### Test Product Browse:
1. Go to: http://localhost:8080/marketplace
2. **Check:**
   - ✅ Products display
   - ✅ Categories work
   - ✅ Search functions
   - ✅ Filters apply

### Test Product Details:
1. Click on any product
2. **Check:**
   - ✅ Product info displays
   - ✅ Images show
   - ✅ Price visible
   - ✅ Add to cart button works

### Test Cart:
1. Add products to cart
2. Go to: http://localhost:8080/cart
3. **Check:**
   - ✅ Cart items display
   - ✅ Quantity can be changed
   - ✅ Remove item works
   - ✅ Total calculates correctly

### Test Checkout:
1. In cart, click "Checkout"
2. **Expected:** Order created, cart cleared

---

## 6. Weather Testing ✅

### Test Weather View:
1. Go to: http://localhost:8080/weather
2. **Check:**
   - ✅ Current weather displays
   - ✅ 7-day forecast shows
   - ✅ Temperature, humidity visible
   - ✅ Rainfall predictions appear

### Test Jal Saathi:
1. In weather page
2. Check irrigation recommendations
3. **Expected:** Smart watering advice based on weather

---

## 7. AI Assistant Testing ✅

### Test AI Chat:
1. Click floating AI button (bottom right)
2. Ask: "What crops should I plant?"
3. **Expected:**
   - Chat opens
   - AI responds with advice
   - Multi-language support works

### Test Voice:
1. In AI chat
2. Click microphone icon
3. Speak a question
4. **Expected:** Voice recognized, AI responds

---

## 8. Multi-Language Testing ✅

### Test Language Switch:
1. Click language selector (top right)
2. Select different languages:
   - English
   - Hindi (हिंदी)
   - Bengali (বাংলা)
3. **Expected:** All UI text changes

### Test Each Language:
1. Switch to Hindi
2. Navigate through app
3. **Check:** All labels, buttons, messages in Hindi
4. Repeat for other languages

---

## 9. Mobile Responsiveness Testing ✅

### Test on Mobile View:
1. Open Chrome DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12 Pro"
4. **Check:**
   - ✅ Layout adapts
   - ✅ Touch targets large enough
   - ✅ Navigation works
   - ✅ Forms usable
   - ✅ Images scale properly

### Test Different Devices:
1. Test on:
   - iPhone (375px)
   - iPad (768px)
   - Desktop (1920px)
2. **Expected:** Responsive on all sizes

---

## 10. Performance Testing ✅

### Test Load Times:
1. Open Network tab in DevTools
2. Reload page
3. **Check:**
   - ✅ Initial load < 3 seconds
   - ✅ Images load progressively
   - ✅ No blocking resources

### Test Offline Mode:
1. Open DevTools
2. Go to Network tab
3. Select "Offline"
4. Navigate app
5. **Expected:** Cached pages still work

---

## 11. Analytics Testing ✅

### Test Event Logging:
1. Open browser console (F12)
2. Perform actions:
   - Create field
   - Detect disease
   - Add to cart
3. **Check console:** No errors
4. **Check Supabase:** Events logged in analytics_events table

### Test BlackBox:
1. Perform various actions
2. Check console for BlackBox logs
3. **Expected:** "Cleaned up X old black box sessions"

---

## 12. Database Testing ✅

### Test Data Persistence:
1. Create a field
2. Close browser
3. Reopen and sign in
4. **Expected:** Field still there

### Test Cross-Device Sync:
1. Sign in on one device
2. Create field
3. Sign in on another device
4. **Expected:** Field appears on both

---

## 13. Error Handling Testing ✅

### Test Network Errors:
1. Disconnect internet
2. Try to create field
3. **Expected:** User-friendly error message

### Test Invalid Input:
1. Try to sign up with invalid email
2. **Expected:** Validation error shows

### Test 404 Pages:
1. Go to: http://localhost:8080/nonexistent
2. **Expected:** 404 page displays

---

## 14. Security Testing ✅

### Test Authentication:
1. Try to access /dashboard without login
2. **Expected:** Redirect to /auth

### Test Data Isolation:
1. Sign in as User A
2. Create field
3. Sign out, sign in as User B
4. **Expected:** User B can't see User A's field

---

## 15. Admin Panel Testing ✅

### Test Admin Access:
1. Go to: http://localhost:8080/admin
2. **Check:**
   - ✅ Product management
   - ✅ Content management
   - ✅ Analytics dashboard
   - ✅ User management (if implemented)

---

## 🎯 Quick Test Script

Run this in browser console to test basic functionality:

```javascript
// Test 1: Check if app loaded
console.log('App loaded:', !!document.querySelector('#root'));

// Test 2: Check if Supabase connected
console.log('Supabase:', typeof supabase !== 'undefined');

// Test 3: Check if BlackBox initialized
console.log('BlackBox:', typeof blackBoxService !== 'undefined');

// Test 4: Check localStorage
console.log('LocalStorage items:', Object.keys(localStorage).length);

// Test 5: Check if React loaded
console.log('React:', typeof React !== 'undefined');
```

---

## 📊 Test Results Template

### Test Session: [Date]
**Tester:** [Name]
**Browser:** [Chrome/Firefox/Safari]
**Device:** [Desktop/Mobile]

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅/❌ | |
| Dashboard | ✅/❌ | |
| Soil Saathi | ✅/❌ | |
| Disease Detection | ✅/❌ | |
| Marketplace | ✅/❌ | |
| Weather | ✅/❌ | |
| AI Assistant | ✅/❌ | |
| Multi-language | ✅/❌ | |
| Mobile | ✅/❌ | |
| Performance | ✅/❌ | |

---

## 🐛 Bug Report Template

**Title:** [Brief description]
**Severity:** Critical/High/Medium/Low
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Browser:** 
**Screenshot:** 

---

## ✅ Production Readiness Checklist

Before deploying:
- [ ] All tests pass
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Multi-language works
- [ ] Authentication secure
- [ ] Database connected
- [ ] Analytics working
- [ ] Performance acceptable
- [ ] Error handling in place
- [ ] Documentation complete

---

**Happy Testing! 🧪**

*Report any issues and we'll fix them before launch!*
