/**
 * Field Data Cache Service
 * Implements daily update mechanism for field satellite data
 * Caches data for 24 hours to reduce API calls and improve performance
 */

interface CachedFieldData {
  fieldId: string;
  lastUpdated: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  data: {
    health: any;
    quadrants: any[];
    comprehensiveAnalysis: any;
  };
}

export class FieldDataCacheService {
  private static CACHE_DURATION_HOURS = 24;
  private static CACHE_KEY_PREFIX = 'field_cache_';

  /**
   * Check if cached data exists and is still valid (less than 24 hours old)
   */
  static isCacheValid(fieldId: string): boolean {
    try {
      const cacheKey = this.getCacheKey(fieldId);
      const cachedDataStr = localStorage.getItem(cacheKey);
      
      if (!cachedDataStr) {
        return false;
      }

      const cachedData: CachedFieldData = JSON.parse(cachedDataStr);
      const now = new Date();
      const expiresAt = new Date(cachedData.expiresAt);

      // Check if cache has expired
      if (now >= expiresAt) {
        console.log(`🕐 Cache expired for field ${fieldId}`);
        return false;
      }

      console.log(`✅ Valid cache found for field ${fieldId}`);
      return true;
    } catch (error) {
      console.error('Error checking cache validity:', error);
      return false;
    }
  }

  /**
   * Get cached field data if valid
   */
  static getCachedData(fieldId: string): CachedFieldData | null {
    try {
      if (!this.isCacheValid(fieldId)) {
        return null;
      }

      const cacheKey = this.getCacheKey(fieldId);
      const cachedDataStr = localStorage.getItem(cacheKey);
      
      if (!cachedDataStr) {
        return null;
      }

      const cachedData: CachedFieldData = JSON.parse(cachedDataStr);
      console.log(`📦 Retrieved cached data for field ${fieldId}`);
      return cachedData;
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  }

  /**
   * Save field data to cache with 24-hour expiration
   */
  static saveCachedData(
    fieldId: string,
    health: any,
    quadrants: any[],
    comprehensiveAnalysis: any
  ): void {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.CACHE_DURATION_HOURS * 60 * 60 * 1000);

      const cacheData: CachedFieldData = {
        fieldId,
        lastUpdated: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        data: {
          health,
          quadrants,
          comprehensiveAnalysis
        }
      };

      const cacheKey = this.getCacheKey(fieldId);
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      console.log(`💾 Cached field data for ${fieldId} until ${expiresAt.toLocaleString()}`);
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  }

  /**
   * Get time remaining until cache expires
   */
  static getTimeUntilExpiry(fieldId: string): string | null {
    try {
      const cachedData = this.getCachedData(fieldId);
      if (!cachedData) {
        return null;
      }

      const now = new Date();
      const expiresAt = new Date(cachedData.expiresAt);
      const diffMs = expiresAt.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        return 'Expired';
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error('Error calculating time until expiry:', error);
      return null;
    }
  }

  /**
   * Get last update time in human-readable format
   */
  static getLastUpdateTime(fieldId: string): string | null {
    try {
      const cachedData = this.getCachedData(fieldId);
      if (!cachedData) {
        return null;
      }

      const lastUpdated = new Date(cachedData.lastUpdated);
      return lastUpdated.toLocaleString();
    } catch (error) {
      console.error('Error getting last update time:', error);
      return null;
    }
  }

  /**
   * Force clear cache for a specific field
   */
  static clearCache(fieldId: string): void {
    try {
      const cacheKey = this.getCacheKey(fieldId);
      localStorage.removeItem(cacheKey);
      console.log(`🗑️ Cleared cache for field ${fieldId}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Clear all field caches
   */
  static clearAllCaches(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      cacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log(`🗑️ Cleared ${cacheKeys.length} field caches`);
    } catch (error) {
      console.error('Error clearing all caches:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalCaches: number;
    validCaches: number;
    expiredCaches: number;
  } {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      let validCaches = 0;
      let expiredCaches = 0;

      cacheKeys.forEach(key => {
        const fieldId = key.replace(this.CACHE_KEY_PREFIX, '');
        if (this.isCacheValid(fieldId)) {
          validCaches++;
        } else {
          expiredCaches++;
        }
      });

      return {
        totalCaches: cacheKeys.length,
        validCaches,
        expiredCaches
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        totalCaches: 0,
        validCaches: 0,
        expiredCaches: 0
      };
    }
  }

  /**
   * Generate cache key for field
   */
  private static getCacheKey(fieldId: string): string {
    return `${this.CACHE_KEY_PREFIX}${fieldId}`;
  }
}

export const fieldDataCacheService = FieldDataCacheService;
