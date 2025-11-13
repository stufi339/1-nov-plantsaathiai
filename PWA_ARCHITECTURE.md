# 🏗️ PWA Architecture - Saathi Krishi Mitra

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER'S DEVICE                            │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Browser / PWA App                      │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         React Application                 │     │    │
│  │  │  ┌────────────────────────────────────┐  │     │    │
│  │  │  │  Components                        │  │     │    │
│  │  │  │  - Dashboard                       │  │     │    │
│  │  │  │  - Fields                          │  │     │    │
│  │  │  │  - Weather                         │  │     │    │
│  │  │  │  - Disease Detection               │  │     │    │
│  │  │  │  - Marketplace                     │  │     │    │
│  │  │  └────────────────────────────────────┘  │     │    │
│  │  │                                           │     │    │
│  │  │  ┌────────────────────────────────────┐  │     │    │
│  │  │  │  PWA Services                      │  │     │    │
│  │  │  │  - pwaService.ts                   │  │     │    │
│  │  │  │  - offlineDataService.ts           │  │     │    │
│  │  │  │  - pushNotificationService.ts      │  │     │    │
│  │  │  └────────────────────────────────────┘  │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Service Worker (sw.js)            │     │    │
│  │  │  - Intercepts network requests            │     │    │
│  │  │  - Manages cache                          │     │    │
│  │  │  - Handles offline mode                   │     │    │
│  │  │  - Processes push notifications           │     │    │
│  │  │  - Background sync                        │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │         Cache Storage                     │     │    │
│  │  │  - Static assets (HTML, CSS, JS)          │     │    │
│  │  │  - Field data                             │     │    │
│  │  │  - Weather data                           │     │    │
│  │  │  - Mandi prices                           │     │    │
│  │  │  - Satellite imagery                      │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                          │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   Vercel       │  │   Supabase     │  │  External    │  │
│  │   (Hosting)    │  │   (Database)   │  │  APIs        │  │
│  │                │  │                │  │              │  │
│  │  - Static      │  │  - Auth        │  │  - Weather   │  │
│  │    Assets      │  │  - Fields      │  │  - Satellite │  │
│  │  - API Routes  │  │  - Users       │  │  - Mandi     │  │
│  │                │  │  - Push Subs   │  │  - Disease   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Online Mode (Normal Operation)

```
User Action
    │
    ▼
React Component
    │
    ▼
Service Worker (intercepts)
    │
    ├─→ Cache Check
    │   └─→ If cached: Return from cache
    │
    └─→ Network Request
        │
        ▼
    Backend API
        │
        ▼
    Response
        │
        ├─→ Update Cache
        │
        └─→ Return to App
```

### 2. Offline Mode

```
User Action
    │
    ▼
React Component
    │
    ▼
Service Worker (intercepts)
    │
    ▼
Network Request (fails - offline)
    │
    ▼
Fallback to Cache
    │
    ├─→ Cache Hit: Return cached data
    │
    └─→ Cache Miss: Return offline error
```

### 3. Push Notification Flow

```
Backend Event (weather alert, price change)
    │
    ▼
Push Service (Web Push API)
    │
    ▼
Service Worker (receives push)
    │
    ▼
Show Notification
    │
    ▼
User Clicks Notification
    │
    ▼
Open App / Navigate to relevant page
```

## Caching Strategy

### Cache-First (Static Assets)

```
Request → Service Worker
              │
              ▼
         Cache Check
              │
         ┌────┴────┐
         │         │
    Cache Hit  Cache Miss
         │         │
         │         ▼
         │    Network Request
         │         │
         │         ▼
         │    Update Cache
         │         │
         └────┬────┘
              │
              ▼
         Return Response
```

### Network-First (Dynamic Data)

```
Request → Service Worker
              │
              ▼
         Network Request
              │
         ┌────┴────┐
         │         │
    Success    Failure
         │         │
         │         ▼
         │    Cache Fallback
         │         │
         ▼         │
    Update Cache   │
         │         │
         └────┬────┘
              │
              ▼
         Return Response
```

## Component Architecture

### PWA Components Hierarchy

```
App.tsx
  │
  ├─→ PWAInstallPrompt
  │     └─→ Shows when app can be installed
  │
  ├─→ PWAUpdatePrompt
  │     └─→ Shows when update available
  │
  ├─→ OfflineIndicator
  │     └─→ Shows network status changes
  │
  └─→ Main App Routes
        │
        ├─→ Dashboard
        ├─→ Fields (uses offline data)
        ├─→ Weather (uses offline data)
        ├─→ Disease Detection (uses camera)
        ├─→ Marketplace
        └─→ Settings
              └─→ PWASettings
                    └─→ Manage PWA features
```

## Service Layer Architecture

### PWA Service (pwaService.ts)

```
pwaService
  │
  ├─→ initialize()
  │     ├─→ Register service worker
  │     ├─→ Setup install prompt
  │     └─→ Request permissions
  │
  ├─→ showInstallPrompt()
  │     └─→ Trigger installation
  │
  ├─→ subscribeToPush()
  │     └─→ Enable notifications
  │
  ├─→ checkCameraSupport()
  │     └─→ Verify camera available
  │
  └─→ onNetworkChange()
        └─→ Monitor connectivity
```

### Offline Data Service (offlineDataService.ts)

```
offlineDataService
  │
  ├─→ cacheFieldData()
  │     └─→ Store fields (7 days)
  │
  ├─→ cacheWeatherData()
  │     └─→ Store weather (6 hours)
  │
  ├─→ cacheMandiPrices()
  │     └─→ Store prices (24 hours)
  │
  ├─→ cacheSatelliteData()
  │     └─→ Store imagery (7 days)
  │
  └─→ getCachedData()
        └─→ Retrieve offline data
```

### Push Notification Service (pushNotificationService.ts)

```
pushNotificationService
  │
  ├─→ initialize()
  │     └─→ Setup push subscription
  │
  ├─→ sendWeatherAlert()
  │     └─→ Weather notifications
  │
  ├─→ sendPriceAlert()
  │     └─→ Price change notifications
  │
  ├─→ sendCropReminder()
  │     └─→ Crop care reminders
  │
  └─→ sendFieldAlert()
        └─→ Field monitoring alerts
```

## Installation Flow

```
User Opens App in Browser
    │
    ▼
Service Worker Registers
    │
    ▼
Manifest Loaded
    │
    ▼
PWA Criteria Met?
    │
    ├─→ Yes: beforeinstallprompt event fires
    │         │
    │         ▼
    │    PWAInstallPrompt shows
    │         │
    │         ▼
    │    User clicks "Install"
    │         │
    │         ▼
    │    Installation begins
    │         │
    │         ▼
    │    App icon added to home screen
    │         │
    │         ▼
    │    appinstalled event fires
    │
    └─→ No: Continue as web app
```

## Offline Sync Flow

```
User Makes Changes Offline
    │
    ▼
Store in IndexedDB
    │
    ▼
Register Background Sync
    │
    ▼
Network Comes Back Online
    │
    ▼
sync event fires
    │
    ▼
Service Worker Processes Queue
    │
    ├─→ Sync Field Data
    ├─→ Sync Disease Detections
    └─→ Sync User Actions
        │
        ▼
    Clear Sync Queue
        │
        ▼
    Notify User: "Data Synced"
```

## Security Architecture

```
┌─────────────────────────────────────┐
│         Security Layers              │
│                                      │
│  1. HTTPS (Required for PWA)         │
│     └─→ All communication encrypted  │
│                                      │
│  2. Service Worker Scope             │
│     └─→ Limited to app origin        │
│                                      │
│  3. Permissions                      │
│     ├─→ Notifications (user grant)   │
│     ├─→ Camera (user grant)          │
│     └─→ Location (user grant)        │
│                                      │
│  4. Supabase RLS                     │
│     └─→ Row-level security policies  │
│                                      │
│  5. Cache Isolation                  │
│     └─→ Per-origin cache storage     │
└─────────────────────────────────────┘
```

## Performance Optimization

### Loading Strategy

```
Initial Load
    │
    ├─→ Critical CSS (inline)
    ├─→ Critical JS (inline)
    └─→ App Shell (cached)
        │
        ▼
    Render App Shell
        │
        ▼
    Load Dynamic Content
        │
        ├─→ From Cache (if available)
        └─→ From Network (update cache)
```

### Cache Management

```
Cache Storage
    │
    ├─→ Static Cache (v1.0.0)
    │     ├─→ HTML, CSS, JS
    │     └─→ Images, Fonts
    │
    ├─→ Data Cache (v1.0.0)
    │     ├─→ API Responses
    │     └─→ User Data
    │
    └─→ Image Cache
          └─→ Satellite Imagery
```

## Monitoring & Analytics

```
User Interaction
    │
    ├─→ Black Box Service
    │     └─→ Log interaction
    │
    ├─→ Supabase Analytics
    │     └─→ Store event
    │
    └─→ PWA Metrics
          ├─→ Installation rate
          ├─→ Offline usage
          ├─→ Notification CTR
          └─→ Cache hit rate
```

## Technology Stack

```
Frontend:
├─→ React 18
├─→ TypeScript
├─→ Vite
├─→ Tailwind CSS
└─→ Shadcn UI

PWA:
├─→ Service Worker API
├─→ Cache API
├─→ Push API
├─→ Notification API
└─→ Background Sync API

Backend:
├─→ Vercel (Hosting)
├─→ Supabase (Database)
└─→ External APIs

Storage:
├─→ Cache Storage (offline data)
├─→ IndexedDB (sync queue)
└─→ LocalStorage (preferences)
```

## Deployment Pipeline

```
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub
    │
    ▼
Vercel (Auto-deploy)
    │
    ├─→ Build App
    ├─→ Deploy Static Assets
    └─→ Update Service Worker
        │
        ▼
    Users Get Update
        │
        ├─→ Service Worker Updates
        ├─→ Cache Refreshes
        └─→ Update Notification Shows
```

---

## Key Architectural Decisions

### 1. Service Worker Strategy
- **Network First** for dynamic data (weather, prices)
- **Cache First** for static assets (HTML, CSS, JS)
- **Stale While Revalidate** for images

### 2. Cache Expiration
- Field data: 7 days
- Weather: 6 hours
- Mandi prices: 24 hours
- Satellite imagery: 7 days
- Static assets: Until version change

### 3. Offline Support
- Critical features work offline
- Non-critical features show graceful degradation
- Sync queue for offline actions

### 4. Push Notifications
- User opt-in required
- Customizable preferences
- Batched for efficiency

### 5. Performance
- Lazy loading for routes
- Code splitting
- Image optimization
- Cache-first for speed

---

This architecture ensures your PWA is:
- ✅ Fast and responsive
- ✅ Works offline
- ✅ Secure and reliable
- ✅ Easy to maintain
- ✅ Scalable for growth
