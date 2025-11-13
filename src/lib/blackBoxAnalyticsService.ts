/**
 * BlackBox Analytics Service
 * Provides data aggregation and filtering for the admin analytics dashboard
 */

import { blackBoxService } from './blackBoxService';

export interface AnalyticsEntry {
  id: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  type: 'vegetation' | 'audio' | 'field_access' | 'user_interaction' | 'error' | 'feedback' | 'disease' | 'weather' | 'marketplace';
  location?: {
    village?: string;
    district?: string;
    state?: string;
    lat?: number;
    lng?: number;
  };
  fieldId?: string;
  data: any;
}

export interface AnalyticsFilters {
  dateRange?: { start?: Date; end?: Date };
  state?: string;
  district?: string;
  village?: string;
  dataType?: string;
  searchQuery?: string;
  userId?: string;
}

export interface AnalyticsStats {
  totalEntries: number;
  uniqueUsers: number;
  uniqueFields: number;
  errorCount: number;
  byType: Record<string, number>;
  byState: Record<string, number>;
  byDistrict: Record<string, number>;
  byVillage: Record<string, number>;
  timeSeriesData: { date: string; count: number }[];
}

class BlackBoxAnalyticsService {
  /**
   * Get all analytics entries with optional filtering
   */
  getEntries(filters?: AnalyticsFilters): AnalyticsEntry[] {
    const rawLogs = blackBoxService.getAllLogs({
      startDate: filters?.dateRange?.start,
      endDate: filters?.dateRange?.end,
      state: filters?.state,
      district: filters?.district,
      village: filters?.village,
      userId: filters?.userId
    });

    // Transform raw logs to analytics entries
    let entries: AnalyticsEntry[] = rawLogs.map((log, index) => ({
      id: log.id || `entry_${index}_${Date.now()}`,
      timestamp: new Date(log.timestamp),
      userId: log.userId,
      sessionId: log.sessionId,
      type: this.inferType(log),
      location: log.userLocation,
      fieldId: log.fieldId,
      data: log
    }));

    // Apply additional filters
    if (filters?.dataType && filters.dataType !== 'all') {
      entries = entries.filter(e => e.type === filters.dataType);
    }

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      entries = entries.filter(e => 
        JSON.stringify(e).toLowerCase().includes(query)
      );
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get aggregated statistics
   */
  getStatistics(filters?: AnalyticsFilters): AnalyticsStats {
    const entries = this.getEntries(filters);

    const stats: AnalyticsStats = {
      totalEntries: entries.length,
      uniqueUsers: new Set(entries.map(e => e.userId).filter(Boolean)).size,
      uniqueFields: new Set(entries.map(e => e.fieldId).filter(Boolean)).size,
      errorCount: entries.filter(e => e.type === 'error').length,
      byType: {},
      byState: {},
      byDistrict: {},
      byVillage: {},
      timeSeriesData: []
    };

    // Aggregate by type
    entries.forEach(entry => {
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;

      if (entry.location?.state) {
        stats.byState[entry.location.state] = (stats.byState[entry.location.state] || 0) + 1;
      }
      if (entry.location?.district) {
        stats.byDistrict[entry.location.district] = (stats.byDistrict[entry.location.district] || 0) + 1;
      }
      if (entry.location?.village) {
        stats.byVillage[entry.location.village] = (stats.byVillage[entry.location.village] || 0) + 1;
      }
    });

    // Generate time series data (last 30 days)
    const timeSeriesMap = new Map<string, number>();
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      timeSeriesMap.set(dateStr, 0);
    }

    entries.forEach(entry => {
      try {
        if (!entry.timestamp) return;
        const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
        if (isNaN(timestamp.getTime())) return;
        const dateStr = timestamp.toISOString().split('T')[0];
        if (timeSeriesMap.has(dateStr)) {
          timeSeriesMap.set(dateStr, (timeSeriesMap.get(dateStr) || 0) + 1);
        }
      } catch (error) {
        // Silently skip invalid timestamps
      }
    });

    stats.timeSeriesData = Array.from(timeSeriesMap.entries()).map(([date, count]) => ({
      date,
      count
    }));

    return stats;
  }

  /**
   * Get unique values for filter dropdowns
   */
  getUniqueValues(): {
    states: string[];
    districts: string[];
    villages: string[];
    userIds: string[];
  } {
    const entries = this.getEntries();

    return {
      states: [...new Set(entries.map(e => e.location?.state).filter(Boolean))].sort() as string[],
      districts: [...new Set(entries.map(e => e.location?.district).filter(Boolean))].sort() as string[],
      villages: [...new Set(entries.map(e => e.location?.village).filter(Boolean))].sort() as string[],
      userIds: [...new Set(entries.map(e => e.userId).filter(Boolean))].sort() as string[]
    };
  }

  /**
   * Export data as JSON
   */
  exportToJSON(filters?: AnalyticsFilters): string {
    const entries = this.getEntries(filters);
    const stats = this.getStatistics(filters);

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      filters,
      statistics: stats,
      entries
    }, null, 2);
  }

  /**
   * Export data as CSV
   */
  exportToCSV(filters?: AnalyticsFilters): string {
    const entries = this.getEntries(filters);

    const headers = [
      'Timestamp',
      'Type',
      'User ID',
      'Session ID',
      'Field ID',
      'State',
      'District',
      'Village',
      'Latitude',
      'Longitude',
      'Data Summary'
    ];

    const rows = entries.map(entry => {
      let timestampStr = '';
      try {
        if (entry.timestamp) {
          const timestamp = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
          timestampStr = isNaN(timestamp.getTime()) ? '' : timestamp.toISOString();
        }
      } catch (error) {
        timestampStr = '';
      }
      
      return [
        timestampStr,
        entry.type,
        entry.userId || '',
        entry.sessionId,
        entry.fieldId || '',
        entry.location?.state || '',
        entry.location?.district || '',
        entry.location?.village || '',
        entry.location?.lat?.toString() || '',
        entry.location?.lng?.toString() || '',
        JSON.stringify(entry.data).substring(0, 100) // Truncate for CSV
      ];
    });

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  }

  /**
   * Infer entry type from raw log data
   * Comprehensive pattern matching for all app features
   */
  private inferType(log: any): AnalyticsEntry['type'] {
    // 1. Check specific log structure types first (highest priority)
    if (log.indices) return 'vegetation';
    if (log.audioType) return 'audio';
    if (log.accessType) return 'field_access';
    if (log.errorType) return 'error';
    if (log.feedbackType) return 'feedback';
    
    // 2. Check elementId patterns for user interactions
    if (log.interactionType && log.elementId) {
      const elementId = log.elementId.toLowerCase();
      
      // Disease detection patterns
      if (elementId.includes('disease')) return 'disease';
      
      // Weather patterns
      if (elementId.includes('weather')) return 'weather';
      
      // Marketplace patterns
      if (elementId.includes('marketplace') || elementId.includes('product') || elementId.includes('cart')) {
        return 'marketplace';
      }
      
      // Soil/Vegetation patterns
      if (elementId.includes('soil') || elementId.includes('vegetation') || 
          elementId.includes('ndvi') || elementId.includes('npk') ||
          elementId.includes('satellite') || elementId.includes('field_details') ||
          elementId.includes('comprehensive_soil')) {
        return 'vegetation';
      }
      
      // Yield prediction patterns
      if (elementId.includes('yield')) {
        return 'vegetation'; // Yield is part of vegetation analysis
      }
      
      // Field access patterns
      if (elementId.includes('field_summary') || elementId.includes('field_dashboard') ||
          elementId.includes('mobile_field')) {
        return 'field_access';
      }
    }
    
    // 3. Check additionalData for type-specific fields
    if (log.additionalData) {
      const data = log.additionalData;
      
      // Disease detection
      if (data.diseaseName || data.disease_name || 
          (data.confidence && (data.disease || data.diseaseDetection))) {
        return 'disease';
      }
      
      // Weather
      if (data.weatherCondition || data.temperature || data.forecast || 
          data.humidity || data.windSpeed || data.farmingAdvice) {
        return 'weather';
      }
      
      // Marketplace
      if (data.productId || data.productName || data.category || 
          data.recommendationCount || data.searchQuery) {
        return 'marketplace';
      }
      
      // Soil/Vegetation
      if (data.ndvi || data.ndre || data.ndwi || data.ndmi || 
          data.nitrogen || data.phosphorus || data.potassium ||
          data.soilProperties || data.vegetationIndices) {
        return 'vegetation';
      }
      
      // Yield prediction
      if (data.predictedYield || data.yieldPrediction) {
        return 'vegetation';
      }
      
      // Field access
      if (data.cropType || data.variety || data.sowingDate || 
          data.fieldArea || data.deviceType) {
        return 'field_access';
      }
    }
    
    // 4. Fallback to generic user interaction
    if (log.interactionType) return 'user_interaction';
    
    return 'user_interaction';
  }

  /**
   * Get real-time analytics summary
   */
  getRealTimeSummary(): {
    last24Hours: number;
    lastHour: number;
    activeUsers: number;
    recentErrors: number;
  } {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const entries = this.getEntries();

    return {
      last24Hours: entries.filter(e => e.timestamp >= last24Hours).length,
      lastHour: entries.filter(e => e.timestamp >= lastHour).length,
      activeUsers: new Set(
        entries
          .filter(e => e.timestamp >= last24Hours)
          .map(e => e.userId)
          .filter(Boolean)
      ).size,
      recentErrors: entries.filter(e => 
        e.type === 'error' && e.timestamp >= last24Hours
      ).length
    };
  }

  /**
   * Get top users by activity
   */
  getTopUsers(limit: number = 10): { userId: string; count: number }[] {
    const entries = this.getEntries();
    const userCounts = new Map<string, number>();

    entries.forEach(entry => {
      if (entry.userId) {
        userCounts.set(entry.userId, (userCounts.get(entry.userId) || 0) + 1);
      }
    });

    return Array.from(userCounts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get most active fields
   */
  getTopFields(limit: number = 10): { fieldId: string; count: number }[] {
    const entries = this.getEntries();
    const fieldCounts = new Map<string, number>();

    entries.forEach(entry => {
      if (entry.fieldId) {
        fieldCounts.set(entry.fieldId, (fieldCounts.get(entry.fieldId) || 0) + 1);
      }
    });

    return Array.from(fieldCounts.entries())
      .map(([fieldId, count]) => ({ fieldId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Export singleton instance
export const blackBoxAnalyticsService = new BlackBoxAnalyticsService();
