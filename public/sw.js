// Service Worker for Saathi Krishi Mitra PWA
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `krishi-mitra-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `krishi-mitra-data-${CACHE_VERSION}`;

// Critical assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/site.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
];

// API endpoints to cache for offline access
const API_CACHE_PATTERNS = [
  /\/api\/weather/,
  /\/api\/mandi-prices/,
  /\/api\/fields/,
  /\/api\/disease-detection/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('krishi-mitra-') && name !== CACHE_NAME && name !== DATA_CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network First with Cache Fallback
  if (isAPIRequest(url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - Cache First
  event.respondWith(cacheFirstStrategy(request));
});

// Check if request is for API data
function isAPIRequest(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first strategy failed:', error);
    return new Response('Offline - Asset not available', { status: 503 });
  }
}

// Network First Strategy - for API data
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful API responses
    if (networkResponse.ok) {
      const cache = await caches.open(DATA_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cache = await caches.open(DATA_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'Data not available offline',
        cached: false 
      }), 
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Background Sync - for offline data submission
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-field-data') {
    event.waitUntil(syncFieldData());
  } else if (event.tag === 'sync-disease-detection') {
    event.waitUntil(syncDiseaseDetection());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Krishi Mitra';
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Sync functions
async function syncFieldData() {
  try {
    // Get pending field data from IndexedDB
    const db = await openDB();
    const pendingData = await getPendingFieldData(db);
    
    if (pendingData.length === 0) {
      return;
    }

    // Sync each pending item
    for (const item of pendingData) {
      await fetch('/api/fields/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
    }

    // Clear synced data
    await clearPendingFieldData(db);
    console.log('[SW] Field data synced successfully');
  } catch (error) {
    console.error('[SW] Field data sync failed:', error);
    throw error;
  }
}

async function syncDiseaseDetection() {
  try {
    const db = await openDB();
    const pendingDetections = await getPendingDetections(db);
    
    for (const detection of pendingDetections) {
      await fetch('/api/disease-detection/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(detection)
      });
    }

    await clearPendingDetections(db);
    console.log('[SW] Disease detections synced successfully');
  } catch (error) {
    console.error('[SW] Disease detection sync failed:', error);
    throw error;
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('KrishiMitraDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingFieldData')) {
        db.createObjectStore('pendingFieldData', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingDetections')) {
        db.createObjectStore('pendingDetections', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingFieldData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingFieldData'], 'readonly');
    const store = transaction.objectStore('pendingFieldData');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getPendingDetections(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingDetections'], 'readonly');
    const store = transaction.objectStore('pendingDetections');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function clearPendingFieldData(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingFieldData'], 'readwrite');
    const store = transaction.objectStore('pendingFieldData');
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function clearPendingDetections(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingDetections'], 'readwrite');
    const store = transaction.objectStore('pendingDetections');
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

console.log('[SW] Service Worker loaded');
