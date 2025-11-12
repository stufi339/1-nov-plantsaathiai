# 🧠 Mandi Prices V3 - Smart Features

## New Intelligent Features Added

### 1. 🕐 **Daily Auto-Update at 9:01 AM**

#### How It Works
- Service automatically schedules updates for 9:01 AM every day
- Clears cache and fetches fresh data from government API
- Runs in background without user intervention
- Dispatches event to notify UI components

#### Implementation
```typescript
// Scheduled on service initialization
scheduleDaily901AMUpdate() {
  - Calculates time until next 9:01 AM
  - Sets timeout for automatic update
  - Reschedules for next day after completion
}
```

#### Benefits
- ✅ Always fresh data every morning
- ✅ No manual refresh needed
- ✅ Consistent update time (9:01 AM IST)
- ✅ Automatic cache invalidation
- ✅ Event-driven UI updates

#### User Experience
- Farmers check prices after 9 AM
- Data is already fresh and ready
- "Last updated" timestamp shows update time
- No waiting for data fetch

---

### 2. 📍 **Location-Based Sorting**

#### How It Works
- Requests user's GPS location (with permission)
- Calculates distance to each mandi using Haversine formula
- Sorts markets from nearest to farthest
- Shows distance badge on each card

#### Features
- **Toggle Switch**: Enable/disable location sorting
- **Distance Display**: Shows "X km" on each card
- **Smart Fallback**: Works without location (unsorted)
- **Cached Location**: Reuses location for 5 minutes

#### Distance Calculation
```typescript
Haversine Formula:
- Accounts for Earth's curvature
- Accurate within 0.5% for distances < 500km
- Returns distance in kilometers
```

#### UI Elements
- **Navigation Icon**: Shows when location sorting is active
- **Distance Badge**: White badge with km on card header
- **Toggle Button**: Blue when active, gray when off
- **Permission Prompt**: Asks for location access once

#### Benefits
- ✅ Find nearest mandis instantly
- ✅ Save travel time and fuel
- ✅ Plan efficient market visits
- ✅ Compare nearby vs distant prices

---

### 3. 🖼️ **Crop Images (Transparent PNG)**

#### Image Sources
- High-quality transparent PNG icons
- Sourced from Flaticon CDN
- No background - clean look
- Consistent style across all crops

#### Supported Crops (45+ varieties)
```
Grains: Rice, Wheat, Maize, Corn
Vegetables: Tomato, Potato, Onion, Cabbage, Cauliflower, Carrot, Brinjal, Okra, Peas, Beans, Cucumber, Pumpkin
Fruits: Banana, Apple, Mango, Grapes, Orange, Lemon, Papaya, Guava, Pomegranate, Watermelon, Coconut
Cash Crops: Cotton, Sugarcane, Soybean, Groundnut
Spices: Chilli, Pepper, Garlic, Ginger, Turmeric
```

#### Fallback System
- Unknown crops get default grain icon
- Error handling for failed image loads
- Graceful degradation (hides on error)

#### Visual Impact
- **48x48px** images in card headers
- White/transparent background blends with gradient
- Instant crop recognition
- Professional, modern look

---

## 🎯 Complete Feature Set

### Auto-Update System
```
Schedule: Daily at 9:01 AM IST
Trigger: Automatic (setTimeout)
Cache: Cleared before update
Event: 'mandiPricesUpdated' dispatched
UI: Listens and refreshes automatically
```

### Location Intelligence
```
Permission: Geolocation API
Calculation: Haversine formula
Accuracy: ±0.5% for < 500km
Caching: 5 minutes
Fallback: Works without location
```

### Image Management
```
Format: Transparent PNG
Size: 512x512px (displayed at 48x48)
CDN: Flaticon (reliable, fast)
Fallback: Default grain icon
Error Handling: Hide on load failure
```

---

## 📱 User Interface Updates

### New UI Elements

#### 1. Sort Toggle
```
Location: Below filters in collapsible panel
Icon: Navigation (compass)
States: Active (blue) / Inactive (gray)
Animation: Smooth slide transition
```

#### 2. Distance Badges
```
Location: Card header, below variety
Format: "X km" with navigation icon
Style: White badge on gradient background
Visibility: Only when location available
```

#### 3. Last Update Time
```
Location: Below sort toggle
Format: "Last updated: 11 Nov, 09:01"
Icon: Clock
Style: Blue background badge
```

#### 4. Crop Images
```
Location: Card header, left side
Size: 48x48px in white rounded box
Style: Transparent PNG on gradient
Fallback: Hidden on error
```

---

## 🔧 Technical Implementation

### Service Layer (`mandiPriceService.ts`)

#### New Methods
```typescript
// Location & Sorting
sortByLocation(prices, userLat, userLon)
calculateDistance(lat1, lon1, lat2, lon2)
getDistrictCoordinates(district, state)
getUserLocation()

// Images
getCropImage(commodity)
addCropImages(prices)

// Auto-Update
scheduleDaily901AMUpdate()
performDailyUpdate()
getLastUpdateTime()
needsRefresh()
```

#### Data Structure
```typescript
interface MandiPrice {
  // Existing fields
  state, district, market, commodity, variety
  arrival_date, min_price, max_price, modal_price, unit
  
  // New fields
  distance?: number      // km from user
  cropImage?: string     // PNG URL
}
```

### Component Updates (`MandiPricesView.tsx`)

#### New State
```typescript
sortByDistance: boolean          // Toggle state
userLocation: {lat, lon} | null  // GPS coords
lastUpdateTime: Date | null      // Update timestamp
```

#### New Effects
```typescript
// Get user location on mount
getUserLocation()

// Listen for daily updates
window.addEventListener('mandiPricesUpdated')

// Re-sort when toggle changes
useEffect([sortByDistance])
```

---

## 🚀 Performance Optimizations

### Location Caching
- GPS position cached for 5 minutes
- Reduces battery drain
- Faster subsequent sorts
- `maximumAge: 300000` parameter

### Image Loading
- Lazy loading (browser native)
- Error handling prevents broken images
- CDN delivery (fast, cached)
- Transparent PNGs (small file size)

### Update Scheduling
- Single setTimeout (not interval)
- Reschedules after completion
- No memory leaks
- Efficient background operation

### Distance Calculation
- Pre-computed district coordinates
- O(n) complexity for sorting
- Haversine formula (optimized)
- Cached results in price objects

---

## 📊 User Flows

### Flow 1: Morning Price Check (Auto-Update)
```
1. User opens app at 9:30 AM
2. Data already updated at 9:01 AM
3. Sees "Last updated: 11 Nov, 09:01"
4. Fresh prices ready instantly
5. No loading or waiting
```

### Flow 2: Find Nearest Mandi
```
1. User opens Mandi Prices
2. Allows location access (one-time)
3. Toggles "Sort by Nearest Location" ON
4. Cards re-sort by distance
5. Sees "15 km" on nearest mandi
6. Plans visit to closest market
```

### Flow 3: Visual Crop Recognition
```
1. User scrolls through price cards
2. Instantly recognizes crops by image
3. No need to read commodity name
4. Faster scanning and comparison
5. Better user experience
```

---

## 🎨 Visual Enhancements

### Before vs After

| Feature | V2 | V3 |
|---------|----|----|
| Update | Manual refresh | Auto at 9:01 AM |
| Sorting | Random order | By distance |
| Images | None | Crop icons |
| Distance | Not shown | Badge with km |
| Location | Not used | GPS-based |
| Update Time | Not shown | Timestamp |

### New Visual Elements

#### Distance Badge
```css
Background: white/20 with backdrop blur
Icon: Navigation (compass)
Text: Bold, white, 12px
Position: Below variety name
Animation: Fade in
```

#### Crop Image Box
```css
Size: 48x48px
Background: white/20 with backdrop blur
Padding: 8px
Border Radius: 8px
Image: Transparent PNG, object-contain
```

#### Sort Toggle
```css
Track: 48px wide, 24px tall
Thumb: 16px circle, white
Active: Blue background
Inactive: Gray background
Animation: Smooth slide (0.3s)
```

---

## 🌍 Location Data

### District Coordinates (Sample)
```typescript
Major Cities Covered:
- Punjab: Ludhiana, Patiala, Amritsar, Jalandhar
- Delhi NCR: Delhi, Chandigarh
- Maharashtra: Mumbai, Pune, Nagpur
- Karnataka: Bangalore
- Tamil Nadu: Chennai
- West Bengal: Kolkata
- Telangana: Hyderabad
- Gujarat: Ahmedabad
- Rajasthan: Jaipur
- UP: Lucknow, Kanpur
- MP: Indore, Bhopal
- Bihar: Patna

Total: 20+ major districts
Expandable: Easy to add more
```

### Geocoding Strategy
```
Current: Hardcoded major districts
Future: Google Geocoding API
Fallback: District name matching
Accuracy: City-level (sufficient for mandis)
```

---

## 🔔 Event System

### Custom Event: `mandiPricesUpdated`
```typescript
// Dispatched by service
window.dispatchEvent(new CustomEvent('mandiPricesUpdated', {
  detail: { timestamp: Date }
}));

// Listened by component
window.addEventListener('mandiPricesUpdated', (event) => {
  setLastUpdateTime(event.detail.timestamp);
  loadPrices(); // Refresh UI
});
```

### Benefits
- Decoupled architecture
- Multiple listeners possible
- Real-time UI updates
- No polling needed

---

## 📈 Analytics Opportunities

### Track These Metrics
1. **Location Usage**
   - % users enabling location sort
   - Average distance to selected mandi
   - Most common user locations

2. **Update Engagement**
   - Users active at 9:01 AM
   - Time between update and first view
   - Refresh button usage (should decrease)

3. **Crop Popularity**
   - Most searched commodities
   - Image load success rate
   - Crops without images (add them)

4. **Distance Insights**
   - Average travel distance
   - Nearest vs best price trade-offs
   - Regional price variations

---

## 🚀 Future Enhancements

### Phase 4 (Recommended)
1. **Smart Notifications**
   - "Prices updated! Check now" at 9:01 AM
   - "Best price for Rice nearby!" alerts
   - Price drop notifications

2. **Route Planning**
   - Google Maps integration
   - Multi-mandi route optimization
   - Fuel cost calculator

3. **Historical Trends**
   - 7-day price graphs
   - Best day to sell predictions
   - Seasonal pattern analysis

4. **Offline Mode**
   - Cache last update locally
   - Work without internet
   - Sync when online

5. **Advanced Geocoding**
   - Google Geocoding API
   - All Indian districts
   - Accurate coordinates

6. **Image Enhancements**
   - Real crop photos
   - Variety-specific images
   - User-uploaded images

---

## ✅ Testing Checklist

### Auto-Update
- [ ] Verify 9:01 AM schedule
- [ ] Check cache clearing
- [ ] Test event dispatch
- [ ] Confirm UI refresh
- [ ] Test across timezones

### Location Sorting
- [ ] Test with location permission
- [ ] Test without permission
- [ ] Verify distance accuracy
- [ ] Check toggle functionality
- [ ] Test location caching

### Crop Images
- [ ] Verify all 45+ crops
- [ ] Test error handling
- [ ] Check image loading speed
- [ ] Verify transparent backgrounds
- [ ] Test fallback icon

### UI/UX
- [ ] Distance badges visible
- [ ] Sort toggle works smoothly
- [ ] Last update time shows
- [ ] Images load properly
- [ ] Mobile responsive

---

## 🎉 Impact Summary

### For Farmers
- ✅ **Save Time**: Auto-updates, no manual refresh
- ✅ **Save Money**: Find nearest mandis, reduce travel
- ✅ **Better Decisions**: Visual crop recognition, distance info
- ✅ **Convenience**: Always fresh data, location-aware

### For App
- ✅ **Modern**: Smart features, intelligent sorting
- ✅ **Professional**: Crop images, polished UI
- ✅ **Efficient**: Auto-updates, cached data
- ✅ **User-Friendly**: Location-based, visual cues

### Technical Excellence
- ✅ **Automated**: Daily updates without intervention
- ✅ **Intelligent**: Location-aware sorting
- ✅ **Visual**: Professional crop imagery
- ✅ **Performant**: Optimized calculations, caching

---

## 📝 Configuration

### Update Time
```typescript
// Change update time (currently 9:01 AM)
next901AM.setHours(9, 1, 0, 0);

// For testing, use:
next901AM.setHours(14, 30, 0, 0); // 2:30 PM
```

### Location Accuracy
```typescript
// Adjust geolocation options
{
  timeout: 5000,        // 5 seconds
  maximumAge: 300000    // 5 minutes cache
}
```

### Image CDN
```typescript
// Change image source
private cropImages: Record<string, string> = {
  'rice': 'YOUR_CDN_URL/rice.png',
  // ...
}
```

---

**Status**: ✅ Complete - V3 Smart Features
**Last Updated**: November 11, 2025
**Version**: 3.0.0

**Key Features**:
- 🕐 Daily auto-update at 9:01 AM
- 📍 Location-based sorting with distance
- 🖼️ 45+ crop images (transparent PNG)
- 🎯 Smart, intelligent, farmer-friendly
