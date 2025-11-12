/**
 * Mandi Price History Service
 * Intelligently stores and retrieves historical price data
 * Only tracks major crops to optimize storage
 */

import { supabase } from './supabase';
import { mandiPriceService, MandiPrice } from './mandiPriceService';

// Major crops to track (based on Indian agriculture importance)
const TRACKED_CROPS = [
  'rice', 'wheat', 'cotton', 'sugarcane', 'maize', 'soybean',
  'pulses', 'oilseeds', 'jute', 'bajra', 'coffee', 'banana',
  'potato', 'onion', 'tomato', 'groundnut', 'chilli'
];

export interface PriceHistory {
  id?: string;
  commodity: string;
  state: string;
  district: string;
  market: string;
  date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity?: number;
  created_at?: string;
}

export interface PriceTrend {
  commodity: string;
  currentPrice: number;
  previousPrice: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  history: Array<{ date: string; price: number }>;
}

class MandiPriceHistoryService {
  private lastSyncTime: Date | null = null;
  private syncInProgress = false;

  /**
   * Check if commodity should be tracked
   */
  private shouldTrackCommodity(commodity: string): boolean {
    const normalized = commodity.toLowerCase().trim();
    return TRACKED_CROPS.some(crop => normalized.includes(crop));
  }

  /**
   * Sync today's prices to database (called daily at 9:01 AM)
   */
  async syncTodaysPrices(): Promise<{ success: boolean; saved: number; error?: string }> {
    if (this.syncInProgress) {
      return { success: false, saved: 0, error: 'Sync already in progress' };
    }

    this.syncInProgress = true;
    let savedCount = 0;

    try {
      console.log('🔄 Starting daily mandi price sync...');

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch prices for each tracked crop
      for (const crop of TRACKED_CROPS) {
        try {
          const prices = await mandiPriceService.getCommodityPrices(crop);
          
          if (prices.length === 0) continue;

          // Group by market to get one entry per market per day
          const marketPrices = new Map<string, MandiPrice>();
          
          for (const price of prices) {
            const key = `${price.state}-${price.district}-${price.market}`;
            if (!marketPrices.has(key)) {
              marketPrices.set(key, price);
            }
          }

          // Save to database
          const records = Array.from(marketPrices.values()).map(price => ({
            commodity: price.commodity,
            state: price.state,
            district: price.district,
            market: price.market,
            date: today,
            min_price: price.min_price,
            max_price: price.max_price,
            modal_price: price.modal_price
          }));

          if (records.length > 0) {
            const { error } = await supabase
              .from('mandi_price_history')
              .upsert(records, {
                onConflict: 'commodity,state,district,market,date',
                ignoreDuplicates: false
              });

            if (error) {
              console.error(`Error saving ${crop} prices:`, error);
            } else {
              savedCount += records.length;
              console.log(`✅ Saved ${records.length} ${crop} prices`);
            }
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error syncing ${crop}:`, error);
        }
      }

      this.lastSyncTime = new Date();
      console.log(`✅ Daily sync complete. Saved ${savedCount} price records.`);

      return { success: true, saved: savedCount };
    } catch (error) {
      console.error('❌ Daily sync failed:', error);
      return { 
        success: false, 
        saved: savedCount, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get price history for a commodity
   */
  async getPriceHistory(
    commodity: string,
    days: number = 30,
    state?: string
  ): Promise<PriceHistory[]> {
    try {
      let query = supabase
        .from('mandi_price_history')
        .select('*')
        .ilike('commodity', `%${commodity}%`)
        .order('date', { ascending: false })
        .limit(days * 10); // Get more records to account for multiple markets

      if (state) {
        query = query.eq('state', state);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  }

  /**
   * Get price trend for a commodity
   */
  async getPriceTrend(commodity: string, state?: string): Promise<PriceTrend | null> {
    try {
      const history = await this.getPriceHistory(commodity, 30, state);

      if (history.length === 0) return null;

      // Group by date and calculate average modal price per day
      const dailyPrices = new Map<string, number[]>();
      
      for (const record of history) {
        if (!dailyPrices.has(record.date)) {
          dailyPrices.set(record.date, []);
        }
        dailyPrices.get(record.date)!.push(record.modal_price);
      }

      // Calculate daily averages
      const priceData = Array.from(dailyPrices.entries())
        .map(([date, prices]) => ({
          date,
          price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      if (priceData.length < 2) return null;

      const currentPrice = priceData[priceData.length - 1].price;
      const previousPrice = priceData[priceData.length - 2].price;
      const change = currentPrice - previousPrice;
      const changePercent = Math.round((change / previousPrice) * 100);

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (Math.abs(changePercent) > 2) {
        trend = change > 0 ? 'up' : 'down';
      }

      return {
        commodity,
        currentPrice,
        previousPrice,
        change,
        changePercent,
        trend,
        history: priceData.slice(-30) // Last 30 days
      };
    } catch (error) {
      console.error('Error calculating price trend:', error);
      return null;
    }
  }

  /**
   * Get latest available price (from history if API fails)
   */
  async getLatestPrice(commodity: string, state?: string): Promise<{
    price: number;
    date: string;
    source: 'live' | 'history';
  } | null> {
    try {
      // Try live API first
      const livePrices = await mandiPriceService.getCommodityPrices(commodity, state);
      
      if (livePrices.length > 0) {
        const avgPrice = Math.round(
          livePrices.reduce((sum, p) => sum + p.modal_price, 0) / livePrices.length
        );
        return {
          price: avgPrice,
          date: new Date().toISOString().split('T')[0],
          source: 'live'
        };
      }

      // Fallback to history
      const history = await this.getPriceHistory(commodity, 7, state);
      
      if (history.length === 0) return null;

      // Get most recent date
      const latest = history.reduce((prev, curr) => 
        curr.date > prev.date ? curr : prev
      );

      return {
        price: latest.modal_price,
        date: latest.date,
        source: 'history'
      };
    } catch (error) {
      console.error('Error getting latest price:', error);
      return null;
    }
  }

  /**
   * Get top gainers (commodities with highest price increase)
   */
  async getTopGainers(limit: number = 5): Promise<PriceTrend[]> {
    try {
      const trends: PriceTrend[] = [];

      for (const crop of TRACKED_CROPS) {
        const trend = await this.getPriceTrend(crop);
        if (trend && trend.changePercent > 0) {
          trends.push(trend);
        }
      }

      return trends
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top gainers:', error);
      return [];
    }
  }

  /**
   * Get top losers (commodities with highest price decrease)
   */
  async getTopLosers(limit: number = 5): Promise<PriceTrend[]> {
    try {
      const trends: PriceTrend[] = [];

      for (const crop of TRACKED_CROPS) {
        const trend = await this.getPriceTrend(crop);
        if (trend && trend.changePercent < 0) {
          trends.push(trend);
        }
      }

      return trends
        .sort((a, b) => a.changePercent - b.changePercent)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting top losers:', error);
      return [];
    }
  }

  /**
   * Get price comparison across states
   */
  async getStateComparison(commodity: string): Promise<Array<{
    state: string;
    avgPrice: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    try {
      const history = await this.getPriceHistory(commodity, 7);

      // Group by state
      const stateData = new Map<string, number[]>();
      
      for (const record of history) {
        if (!stateData.has(record.state)) {
          stateData.set(record.state, []);
        }
        stateData.get(record.state)!.push(record.modal_price);
      }

      // Calculate averages and trends
      const comparison = Array.from(stateData.entries()).map(([state, prices]) => {
        const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
        
        // Simple trend: compare first half vs second half
        const mid = Math.floor(prices.length / 2);
        const firstHalf = prices.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
        const secondHalf = prices.slice(mid).reduce((a, b) => a + b, 0) / (prices.length - mid);
        const change = ((secondHalf - firstHalf) / firstHalf) * 100;
        
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (Math.abs(change) > 2) {
          trend = change > 0 ? 'up' : 'down';
        }

        return { state, avgPrice, trend };
      });

      return comparison.sort((a, b) => b.avgPrice - a.avgPrice);
    } catch (error) {
      console.error('Error getting state comparison:', error);
      return [];
    }
  }

  /**
   * Schedule daily sync at 9:15 AM (after API updates at 9:01 AM)
   */
  scheduleDailySync(): void {
    const scheduleNext = () => {
      const now = new Date();
      const next915AM = new Date();
      next915AM.setHours(9, 15, 0, 0);

      if (now > next915AM) {
        next915AM.setDate(next915AM.getDate() + 1);
      }

      const timeUntilSync = next915AM.getTime() - now.getTime();

      console.log(`Next mandi price history sync scheduled for: ${next915AM.toLocaleString()}`);

      setTimeout(() => {
        this.syncTodaysPrices();
        scheduleNext();
      }, timeUntilSync);
    };

    scheduleNext();
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }
}

export const mandiPriceHistoryService = new MandiPriceHistoryService();

// Auto-schedule daily sync
mandiPriceHistoryService.scheduleDailySync();
