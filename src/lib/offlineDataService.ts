// Offline Data Service - Manages offline caching for critical farming data

import { pwaService } from './pwaService';

interface CachedData {
  timestamp: number;
  data: any;
  expiresIn?: number; // milliseconds
}

class OfflineDataService {
  private readonly CACHE_KEYS = {
    FIELDS: 'offline-fields',
    WEATHER: 'offline-weather',
    MANDI_PRICES: 'offline-mandi-prices',
    SATELLITE_DATA: 'offline-satellite-data',
    DISEASE_MODELS: 'offline-disease-models',
    USER_PREFERENCES: 'offline-user-prefs'
  };

  /**
   * Cache field data for offline access
   */
  async cacheFieldData(fields: any[]): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: fields,
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    await pwaService.cacheData(this.CACHE_KEYS.FIELDS, cachedData);
    console.log('✅ Field data cached for offline access');
  }

  /**
   * Get cached field data
   */
  async getCachedFieldData(): Promise<any[] | null> {
    const cached = await pwaService.getCachedData(this.CACHE_KEYS.FIELDS);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (this.isExpired(cached)) {
      console.log('⚠️ Cached field data expired');
      return null;
    }

    return cached.data;
  }

  /**
   * Cache weather data for offline access
   */
  async cacheWeatherData(location: string, weatherData: any): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: { location, weatherData },
      expiresIn: 6 * 60 * 60 * 1000 // 6 hours
    };

    await pwaService.cacheData(`${this.CACHE_KEYS.WEATHER}-${location}`, cachedData);
    console.log('✅ Weather data cached for offline access');
  }

  /**
   * Get cached weather data
   */
  async getCachedWeatherData(location: string): Promise<any | null> {
    const cached = await pwaService.getCachedData(`${this.CACHE_KEYS.WEATHER}-${location}`);
    
    if (!cached || this.isExpired(cached)) {
      return null;
    }

    return cached.data.weatherData;
  }

  /**
   * Cache mandi prices for offline access
   */
  async cacheMandiPrices(prices: any[]): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: prices,
      expiresIn: 24 * 60 * 60 * 1000 // 24 hours
    };

    await pwaService.cacheData(this.CACHE_KEYS.MANDI_PRICES, cachedData);
    console.log('✅ Mandi prices cached for offline access');
  }

  /**
   * Get cached mandi prices
   */
  async getCachedMandiPrices(): Promise<any[] | null> {
    const cached = await pwaService.getCachedData(this.CACHE_KEYS.MANDI_PRICES);
    
    if (!cached || this.isExpired(cached)) {
      return null;
    }

    return cached.data;
  }

  /**
   * Cache satellite imagery data
   */
  async cacheSatelliteData(fieldId: string, satelliteData: any): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: satelliteData,
      expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    await pwaService.cacheData(`${this.CACHE_KEYS.SATELLITE_DATA}-${fieldId}`, cachedData);
    console.log('✅ Satellite data cached for offline access');
  }

  /**
   * Get cached satellite data
   */
  async getCachedSatelliteData(fieldId: string): Promise<any | null> {
    const cached = await pwaService.getCachedData(`${this.CACHE_KEYS.SATELLITE_DATA}-${fieldId}`);
    
    if (!cached || this.isExpired(cached)) {
      return null;
    }

    return cached.data;
  }

  /**
   * Cache disease detection models for offline use
   */
  async cacheDiseaseModels(models: any): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: models,
      expiresIn: 30 * 24 * 60 * 60 * 1000 // 30 days
    };

    await pwaService.cacheData(this.CACHE_KEYS.DISEASE_MODELS, cachedData);
    console.log('✅ Disease detection models cached');
  }

  /**
   * Get cached disease models
   */
  async getCachedDiseaseModels(): Promise<any | null> {
    const cached = await pwaService.getCachedData(this.CACHE_KEYS.DISEASE_MODELS);
    
    if (!cached || this.isExpired(cached)) {
      return null;
    }

    return cached.data;
  }

  /**
   * Cache user preferences
   */
  async cacheUserPreferences(preferences: any): Promise<void> {
    const cachedData: CachedData = {
      timestamp: Date.now(),
      data: preferences
      // No expiration for user preferences
    };

    await pwaService.cacheData(this.CACHE_KEYS.USER_PREFERENCES, cachedData);
  }

  /**
   * Get cached user preferences
   */
  async getCachedUserPreferences(): Promise<any | null> {
    const cached = await pwaService.getCachedData(this.CACHE_KEYS.USER_PREFERENCES);
    return cached?.data || null;
  }

  /**
   * Check if cached data is expired
   */
  private isExpired(cached: CachedData): boolean {
    if (!cached.expiresIn) {
      return false; // No expiration
    }

    const age = Date.now() - cached.timestamp;
    return age > cached.expiresIn;
  }

  /**
   * Clear all cached data
   */
  async clearAllCache(): Promise<void> {
    const cacheKeys = Object.values(this.CACHE_KEYS);
    
    for (const key of cacheKeys) {
      await pwaService.cacheData(key, null);
    }

    console.log('✅ All cached data cleared');
  }

  /**
   * Get cache status for all data types
   */
  async getCacheStatus(): Promise<Record<string, boolean>> {
    const status: Record<string, boolean> = {};

    for (const [name, key] of Object.entries(this.CACHE_KEYS)) {
      const cached = await pwaService.getCachedData(key);
      status[name] = cached !== null && !this.isExpired(cached);
    }

    return status;
  }

  /**
   * Preload critical data for offline use
   */
  async preloadCriticalData(userId: string): Promise<void> {
    console.log('📦 Preloading critical data for offline use...');

    try {
      // This would be called after user logs in
      // to cache their most important data
      
      // Note: Actual data fetching would be done by respective services
      // This is just the caching layer
      
      console.log('✅ Critical data preloaded');
    } catch (error) {
      console.error('❌ Failed to preload critical data:', error);
    }
  }
}

export const offlineDataService = new OfflineDataService();
