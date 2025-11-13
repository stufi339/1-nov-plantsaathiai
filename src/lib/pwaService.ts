// PWA Service - Registration and Management

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAService {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  /**
   * Initialize PWA - Register service worker and setup install prompt
   */
  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('✅ Service Worker registered:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdate();
            }
          });
        }
      });

      // Setup install prompt listener
      this.setupInstallPrompt();

      // Request notification permission
      await this.requestNotificationPermission();

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  /**
   * Setup install prompt event listener
   */
  private setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as any;
      console.log('📱 PWA install prompt ready');
      
      // Dispatch custom event for UI to show install button
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      this.deferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  /**
   * Show install prompt to user
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`User ${outcome} the install prompt`);
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Check if app is installed
   */
  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Check if install prompt is available
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return null;
    }

    try {
      const permission = await this.requestNotificationPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return null;
      }

      // Check for existing subscription
      let subscription = await this.registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: vapidPublicKey
        });
      }

      console.log('✅ Push subscription created');
      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('✅ Push subscription removed');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      return false;
    }
  }

  /**
   * Show local notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker not registered');
      return;
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    await this.registration.showNotification(title, {
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: [200, 100, 200],
      ...options
    });
  }

  /**
   * Notify user about app update
   */
  private notifyUpdate(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
    
    this.showNotification('Update Available', {
      body: 'A new version of Krishi Mitra is available. Refresh to update.',
      tag: 'app-update',
      requireInteraction: true,
      actions: [
        { action: 'update', title: 'Update Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    });
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      window.location.reload();
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  /**
   * Check if device supports camera
   */
  async checkCameraSupport(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Camera check failed:', error);
      return false;
    }
  }

  /**
   * Request camera permission
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Stop stream immediately after permission granted
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission denied:', error);
      return false;
    }
  }

  /**
   * Get network status
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Listen to network status changes
   */
  onNetworkChange(callback: (online: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }

  /**
   * Cache important data for offline use
   */
  async cacheData(key: string, data: any): Promise<void> {
    try {
      const cache = await caches.open('krishi-mitra-data-v1.0.0');
      const response = new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
      });
      await cache.put(`/offline-data/${key}`, response);
    } catch (error) {
      console.error('Cache data failed:', error);
    }
  }

  /**
   * Get cached data
   */
  async getCachedData(key: string): Promise<any | null> {
    try {
      const cache = await caches.open('krishi-mitra-data-v1.0.0');
      const response = await cache.match(`/offline-data/${key}`);
      
      if (response) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Get cached data failed:', error);
      return null;
    }
  }
}

export const pwaService = new PWAService();
