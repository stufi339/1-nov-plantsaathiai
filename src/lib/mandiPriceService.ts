/**
 * Mandi Price Service
 * Fetches daily commodity prices from AGMARKNET Portal
 * API Key: 579b464db66ec23bdd000001202fcaea6305476e63fed6713084a1b4
 */

export interface MandiPrice {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  distance?: number; // Distance from user location in km
  cropImage?: string; // URL to crop image
}

export interface MandiPriceFilter {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  date?: string;
}

class MandiPriceService {
  private apiKey = '579b464db66ec23bdd000001202fcaea6305476e63fed6713084a1b4';
  private baseUrl = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  private cache: Map<string, { data: MandiPrice[]; timestamp: number }> = new Map();
  private cacheTimeout = 3600000; // 1 hour
  private lastUpdateTime: Date | null = null;
  private updateScheduled = false;

  // Crop image mapping (high-quality Unsplash photos showing actual crops)
  private cropImages: Record<string, string> = {
    // Cereals & Grains
    'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop&crop=center',
    'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop&crop=center',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&h=300&fit=crop&crop=center',

    // Vegetables - Actual produce photos
    'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop&crop=center',
    'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop&crop=center',
    'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=300&h=300&fit=crop&crop=center',
    'garlic': 'https://images.unsplash.com/photo-1553726634-ea4eff6a86f1?w=300&h=300&fit=crop&crop=center',
    'ginger': 'https://images.unsplash.com/photo-1618375569909-3c8616cf09ae?w=300&h=300&fit=crop&crop=center',
    'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b3a73a7b3d?w=300&h=300&fit=crop&crop=center',
    'cauliflower': 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=300&h=300&fit=crop&crop=center',
    'carrot': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=300&h=300&fit=crop&crop=center',
    'brinjal': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop&crop=center',
    'eggplant': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=300&fit=crop&crop=center',
    'okra': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop&crop=center',
    'cucumber': 'https://images.unsplash.com/photo-1604977042946-1eecc30f30d3?w=300&h=300&fit=crop&crop=center',
    'pumpkin': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=300&h=300&fit=crop&crop=center',

    // Fruits - Actual fruit photos
    'banana': 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=300&h=300&fit=crop&crop=center',
    'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop&crop=center',
    'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop&crop=center',
    'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop&crop=center',
    'lemon': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=300&h=300&fit=crop&crop=center',
    'papaya': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&h=300&fit=crop&crop=center',
    'guava': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop&crop=center',
    'pomegranate': 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=300&h=300&fit=crop&crop=center',
    'coconut': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop&crop=center',
    'watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop&crop=center',
    'grapes': 'https://images.unsplash.com/photo-1537640538966-79f36943f303?w=300&h=300&fit=crop&crop=center',

    // Oilseeds & Pulses
    'soybean': 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1d?w=300&h=300&fit=crop&crop=center',
    'groundnut': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=300&h=300&fit=crop&crop=center',
    'peanut': 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=300&h=300&fit=crop&crop=center',
    'peas': 'https://images.unsplash.com/photo-1587734195503-904fca47e0ec?w=300&h=300&fit=crop&crop=center',
    'beans': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop&crop=center',

    // Spices
    'chilli': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300&h=300&fit=crop&crop=center',
    'pepper': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=300&h=300&fit=crop&crop=center',
    'turmeric': 'https://images.unsplash.com/photo-1618375569909-3c8616cf09ae?w=300&h=300&fit=crop&crop=center',

    // Cash Crops
    'cotton': 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=300&h=300&fit=crop&crop=center',
    'sugarcane': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=300&h=300&fit=crop&crop=center',

    'default': 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=300&h=300&fit=crop&crop=center'
  };

  constructor() {
    this.scheduleDaily901AMUpdate();
  }

  /**
   * Fetch mandi prices with optional filters
   */
  async getMandiPrices(filters: MandiPriceFilter = {}, limit = 100): Promise<MandiPrice[]> {
    try {
      const cacheKey = JSON.stringify({ filters, limit });
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }

      const params = new URLSearchParams({
        'api-key': this.apiKey,
        format: 'json',
        limit: limit.toString(),
      });

      // Add filters
      if (filters.state) params.append('filters[state]', filters.state);
      if (filters.district) params.append('filters[district]', filters.district);
      if (filters.market) params.append('filters[market]', filters.market);
      if (filters.commodity) params.append('filters[commodity]', filters.commodity);
      if (filters.date) params.append('filters[arrival_date]', filters.date);

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const prices: MandiPrice[] = data.records || [];

      this.cache.set(cacheKey, { data: prices, timestamp: Date.now() });
      return prices;
    } catch (error) {
      console.error('Error fetching mandi prices:', error);
      throw error;
    }
  }

  /**
   * Get prices for specific commodity
   */
  async getCommodityPrices(commodity: string, state?: string): Promise<MandiPrice[]> {
    return this.getMandiPrices({ commodity, state }, 50);
  }

  /**
   * Get today's prices
   */
  async getTodaysPrices(filters: Omit<MandiPriceFilter, 'date'> = {}): Promise<MandiPrice[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getMandiPrices({ ...filters, date: today });
  }

  /**
   * Get average price for a commodity across markets
   */
  async getAverageCommodityPrice(commodity: string, state?: string): Promise<{
    commodity: string;
    avgMinPrice: number;
    avgMaxPrice: number;
    avgModalPrice: number;
    marketCount: number;
  } | null> {
    try {
      const prices = await this.getCommodityPrices(commodity, state);
      
      if (prices.length === 0) return null;

      const sum = prices.reduce(
        (acc, price) => ({
          min: acc.min + price.min_price,
          max: acc.max + price.max_price,
          modal: acc.modal + price.modal_price,
        }),
        { min: 0, max: 0, modal: 0 }
      );

      return {
        commodity,
        avgMinPrice: Math.round(sum.min / prices.length),
        avgMaxPrice: Math.round(sum.max / prices.length),
        avgModalPrice: Math.round(sum.modal / prices.length),
        marketCount: prices.length,
      };
    } catch (error) {
      console.error('Error calculating average price:', error);
      return null;
    }
  }

  /**
   * Get best prices (highest max price) for a commodity
   */
  async getBestPrices(commodity: string, limit = 10): Promise<MandiPrice[]> {
    try {
      const prices = await this.getCommodityPrices(commodity);
      return prices
        .sort((a, b) => b.max_price - a.max_price)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting best prices:', error);
      return [];
    }
  }

  /**
   * Get unique states from cache or API
   */
  async getAvailableStates(): Promise<string[]> {
    try {
      const prices = await this.getMandiPrices({}, 1000);
      const states = [...new Set(prices.map(p => p.state))];
      return states.sort();
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  }

  /**
   * Get unique commodities
   */
  async getAvailableCommodities(state?: string): Promise<string[]> {
    try {
      const prices = await this.getMandiPrices(state ? { state } : {}, 1000);
      const commodities = [...new Set(prices.map(p => p.commodity))];
      return commodities.sort();
    } catch (error) {
      console.error('Error fetching commodities:', error);
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get crop image URL
   */
  getCropImage(commodity: string): string {
    const key = commodity.toLowerCase().trim();
    return this.cropImages[key] || this.cropImages['default'];
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get approximate coordinates for Indian districts (sample data)
   */
  private getDistrictCoordinates(district: string, state: string): { lat: number; lon: number } | null {
    // This is a simplified mapping. In production, use a proper geocoding service
    const locations: Record<string, { lat: number; lon: number }> = {
      'ludhiana': { lat: 30.9010, lon: 75.8573 },
      'patiala': { lat: 30.3398, lon: 76.3869 },
      'amritsar': { lat: 31.6340, lon: 74.8723 },
      'jalandhar': { lat: 31.3260, lon: 75.5762 },
      'delhi': { lat: 28.7041, lon: 77.1025 },
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'bangalore': { lat: 12.9716, lon: 77.5946 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'jaipur': { lat: 26.9124, lon: 75.7873 },
      'lucknow': { lat: 26.8467, lon: 80.9462 },
      'kanpur': { lat: 26.4499, lon: 80.3319 },
      'nagpur': { lat: 21.1458, lon: 79.0882 },
      'indore': { lat: 22.7196, lon: 75.8577 },
      'bhopal': { lat: 23.2599, lon: 77.4126 },
      'patna': { lat: 25.5941, lon: 85.1376 },
      'chandigarh': { lat: 30.7333, lon: 76.7794 }
    };
    
    const key = district.toLowerCase().trim();
    return locations[key] || null;
  }

  /**
   * Sort prices by distance from user location
   */
  async sortByLocation(prices: MandiPrice[], userLat?: number, userLon?: number): Promise<MandiPrice[]> {
    if (!userLat || !userLon) {
      // Try to get user location
      try {
        const position = await this.getUserLocation();
        userLat = position.coords.latitude;
        userLon = position.coords.longitude;
      } catch (error) {
        console.log('Location not available, returning unsorted');
        return prices;
      }
    }

    // Calculate distances and add to prices
    const pricesWithDistance = prices.map(price => {
      const coords = this.getDistrictCoordinates(price.district, price.state);
      if (coords) {
        const distance = this.calculateDistance(userLat!, userLon!, coords.lat, coords.lon);
        return { ...price, distance };
      }
      return { ...price, distance: 9999 }; // Unknown location goes to end
    });

    // Sort by distance
    return pricesWithDistance.sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
  }

  /**
   * Get user's current location
   */
  private getUserLocation(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      });
    });
  }

  /**
   * Add crop images to prices
   */
  addCropImages(prices: MandiPrice[]): MandiPrice[] {
    return prices.map(price => ({
      ...price,
      cropImage: this.getCropImage(price.commodity)
    }));
  }

  /**
   * Schedule daily update at 9:01 AM
   */
  private scheduleDaily901AMUpdate(): void {
    if (this.updateScheduled) return;

    const scheduleNext = () => {
      const now = new Date();
      const next901AM = new Date();
      next901AM.setHours(9, 1, 0, 0);

      // If it's already past 9:01 AM today, schedule for tomorrow
      if (now > next901AM) {
        next901AM.setDate(next901AM.getDate() + 1);
      }

      const timeUntilUpdate = next901AM.getTime() - now.getTime();

      console.log(`Next mandi price update scheduled for: ${next901AM.toLocaleString()}`);

      setTimeout(() => {
        this.performDailyUpdate();
        scheduleNext(); // Schedule next day's update
      }, timeUntilUpdate);
    };

    scheduleNext();
    this.updateScheduled = true;
  }

  /**
   * Perform daily update at 9:01 AM
   */
  private async performDailyUpdate(): Promise<void> {
    console.log('🔄 Performing daily mandi price update at 9:01 AM...');
    try {
      this.clearCache();
      this.lastUpdateTime = new Date();
      
      // Trigger a background fetch to warm up the cache
      await this.getTodaysPrices();
      
      console.log('✅ Daily mandi price update completed successfully');
      
      // Dispatch custom event for UI to listen to
      window.dispatchEvent(new CustomEvent('mandiPricesUpdated', {
        detail: { timestamp: this.lastUpdateTime }
      }));
    } catch (error) {
      console.error('❌ Daily mandi price update failed:', error);
    }
  }

  /**
   * Get last update time
   */
  getLastUpdateTime(): Date | null {
    return this.lastUpdateTime;
  }

  /**
   * Check if data needs refresh (older than 1 day)
   */
  needsRefresh(): boolean {
    if (!this.lastUpdateTime) return true;
    const hoursSinceUpdate = (Date.now() - this.lastUpdateTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24;
  }
}

export const mandiPriceService = new MandiPriceService();
