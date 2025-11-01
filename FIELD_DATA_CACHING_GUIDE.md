# Field Data Caching System - Daily Update Mechanism

## Overview

The Soil Saathi field section now implements a smart caching system that updates satellite data **once per day only**. This improves performance, reduces API calls, and provides a better user experience.

## How It Works

### 1. **24-Hour Cache Duration**
- When you fetch satellite data for a field, it's cached for 24 hours
- The system automatically tracks when the data was last updated
- Data expires exactly 24 hours after the last fetch

### 2. **Automatic Cache Management**
- **First Visit**: If no cached data exists, you'll see a button to fetch satellite data
- **Within 24 Hours**: Cached data is automatically loaded - no need to fetch again
- **After 24 Hours**: Cache expires and you can fetch fresh data

### 3. **Visual Indicators**

#### When Data is Fresh (< 24 hours)
```
┌─────────────────────────────────────┐
│ 🟢 Data is up-to-date               │
│    Next update in 18h 45m           │
└─────────────────────────────────────┘
```

#### When Data Can Be Refreshed (> 24 hours)
```
┌─────────────────────────────────────┐
│ 🔄 Satellite data can be refreshed  │
│    [Update Satellite Data]          │
└─────────────────────────────────────┘
```

#### When No Data Exists
```
┌─────────────────────────────────────┐
│ 🛰️ Satellite Analysis Pending       │
│    [Fetch Real Satellite Data Now]  │
└─────────────────────────────────────┘
```

## User Experience

### Scenario 1: First Time Viewing a Field
1. User creates a new field
2. Field details page shows "Fetch Real Satellite Data Now" button
3. User clicks button → Satellite data is fetched and cached
4. Data is saved for 24 hours

### Scenario 2: Returning Within 24 Hours
1. User opens the same field the next day (within 24 hours)
2. Cached data is automatically loaded
3. Green indicator shows "Data is up-to-date" with time remaining
4. No need to fetch data again

### Scenario 3: After 24 Hours
1. User opens field after 24+ hours
2. Cache has expired
3. Orange indicator shows "Satellite data can be refreshed"
4. User can click "Update Satellite Data" to get fresh data
5. New data is cached for another 24 hours

## Benefits

### For Users
- ✅ **Faster Loading**: Cached data loads instantly
- ✅ **Clear Status**: Always know when data was last updated
- ✅ **No Confusion**: System prevents unnecessary data fetches
- ✅ **Daily Updates**: Fresh data available once per day

### For System
- ✅ **Reduced API Calls**: Satellite APIs called only once per day per field
- ✅ **Better Performance**: Less network traffic and processing
- ✅ **Cost Efficient**: Fewer API requests = lower costs
- ✅ **Reliable**: Data persists even if offline

## Technical Details

### Cache Storage
- **Location**: Browser localStorage
- **Key Format**: `field_cache_{fieldId}`
- **Data Stored**:
  - Field health metrics (NDVI, etc.)
  - Quadrant analysis
  - Comprehensive soil analysis
  - Timestamp and expiration

### Cache Structure
```typescript
{
  fieldId: "field_123",
  lastUpdated: "2024-10-31T10:30:00.000Z",
  expiresAt: "2024-11-01T10:30:00.000Z",
  data: {
    health: { ndvi: 0.72, status: "Excellent", ... },
    quadrants: [...],
    comprehensiveAnalysis: {...}
  }
}
```

### API Integration
The caching system works with:
- `SoilAnalysisService` - Comprehensive soil analysis
- `satelliteDataService` - Real-time satellite data
- `geeService` - Google Earth Engine integration

## Developer Notes

### Using the Cache Service

```typescript
import { fieldDataCacheService } from '@/lib/fieldDataCacheService';

// Check if cache is valid
const isValid = fieldDataCacheService.isCacheValid(fieldId);

// Get cached data
const cachedData = fieldDataCacheService.getCachedData(fieldId);

// Save new data to cache
fieldDataCacheService.saveCachedData(
  fieldId,
  healthData,
  quadrantsData,
  analysisData
);

// Get time until expiry
const timeRemaining = fieldDataCacheService.getTimeUntilExpiry(fieldId);

// Clear cache for a field
fieldDataCacheService.clearCache(fieldId);

// Get cache statistics
const stats = fieldDataCacheService.getCacheStats();
```

### Cache Methods

| Method | Description |
|--------|-------------|
| `isCacheValid(fieldId)` | Check if cached data exists and is not expired |
| `getCachedData(fieldId)` | Retrieve cached data if valid |
| `saveCachedData(...)` | Save new data with 24-hour expiration |
| `getTimeUntilExpiry(fieldId)` | Get human-readable time until cache expires |
| `getLastUpdateTime(fieldId)` | Get when data was last updated |
| `clearCache(fieldId)` | Remove cache for specific field |
| `clearAllCaches()` | Remove all field caches |
| `getCacheStats()` | Get statistics about all caches |

## Future Enhancements

Potential improvements for the caching system:

1. **Configurable Duration**: Allow users to set custom cache duration
2. **Smart Refresh**: Auto-refresh when weather events occur
3. **Background Sync**: Update cache in background when app is open
4. **Offline Mode**: Better handling of offline scenarios
5. **Cache Compression**: Reduce storage size for large datasets
6. **Multi-Device Sync**: Sync cache across user's devices

## Troubleshooting

### Cache Not Working?
1. Check browser localStorage is enabled
2. Verify field ID is correct
3. Check console for cache-related logs
4. Try clearing cache and fetching fresh data

### Data Seems Outdated?
1. Check cache expiration time
2. Manually refresh using "Update Satellite Data" button
3. Clear cache if needed: `fieldDataCacheService.clearCache(fieldId)`

### Storage Issues?
- Each cache entry is ~50-100KB
- Browser localStorage limit is typically 5-10MB
- System automatically manages old caches
- Use `getCacheStats()` to monitor storage usage

## Summary

The daily update mechanism ensures:
- **Efficient**: Data fetched only when needed
- **User-Friendly**: Clear indicators and smooth experience
- **Reliable**: Cached data persists and loads quickly
- **Smart**: Automatic expiration and refresh logic

Users can now confidently check their fields knowing they'll always have up-to-date data without unnecessary waits or API calls.
