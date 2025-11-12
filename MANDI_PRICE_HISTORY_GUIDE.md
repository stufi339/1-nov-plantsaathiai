# 📊 Mandi Price History System - Complete Guide

## 🎯 Overview

Smart historical price tracking system that:
- ✅ Stores price data for major crops only (optimized storage)
- ✅ Shows price trends with charts
- ✅ Falls back to historical data when API doesn't update
- ✅ Automatically syncs daily at 9:15 AM
- ✅ Provides market insights (top gainers/losers)

## 🌾 Tracked Crops (17 Major Commodities)

Based on Indian agricultural importance:
- **Cereals**: Rice, Wheat, Maize, Bajra
- **Cash Crops**: Cotton, Sugarcane, Jute, Coffee
- **Oilseeds**: Soybean, Groundnut, Oilseeds
- **Pulses**: Pulses (all varieties)
- **Vegetables**: Potato, Onion, Tomato, Chilli
- **Fruits**: Banana

## 🚀 Setup Instructions

### Step 1: Run SQL Schema

1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the content from `MANDI_PRICE_HISTORY_SCHEMA.sql`
4. Click "Run"
5. You should see: ✅ Mandi Price History schema created successfully!

### Step 2: Verify Tables Created

Check that these were created:
- `mandi_price_history` - Main table
- `latest_mandi_prices` - View for quick access
- `mandi_price_trends` - Materialized view for analytics

### Step 3: Initial Data Sync

The system will automatically sync daily at 9:15 AM, but you can trigger manual sync:

```typescript
import { mandiPriceHistoryService } from '@/lib/mandiPriceHistoryService';

// Manual sync (for testing)
const result = await mandiPriceHistoryService.syncTodaysPrices();
console.log(`Synced ${result.saved} price records`);
```

## 📈 Features

### 1. Price Trend Charts

Shows 30-day price history with:
- Line chart visualization
- Current vs previous price comparison
- Percentage change indicator
- Trend direction (up/down/stable)

```typescript
// Get price trend for a commodity
const trend = await mandiPriceHistoryService.getPriceTrend('rice', 'Punjab');

console.log(trend);
// {
//   commodity: 'rice',
//   currentPrice: 2500,
//   previousPrice: 2400,
//   change: 100,
//   changePercent: 4,
//   trend: 'up',
//   history: [{ date: '2024-01-01', price: 2400 }, ...]
// }
```

### 2. Market Overview

Top gainers and losers:

```typescript
// Get top 5 gainers
const gainers = await mandiPriceHistoryService.getTopGainers(5);

// Get top 5 losers
const losers = await mandiPriceHistoryService.getTopLosers(5);
```

### 3. Fallback to Historical Data

When live API fails or doesn't update:

```typescript
// Automatically tries live API first, falls back to history
const latestPrice = await mandiPriceHistoryService.getLatestPrice('wheat', 'Punjab');

console.log(latestPrice);
// {
//   price: 2100,
//   date: '2024-01-15',
//   source: 'history' // or 'live'
// }
```

### 4. State-wise Comparison

Compare prices across states:

```typescript
const comparison = await mandiPriceHistoryService.getStateComparison('rice');

console.log(comparison);
// [
//   { state: 'Punjab', avgPrice: 2500, trend: 'up' },
//   { state: 'Haryana', avgPrice: 2450, trend: 'stable' },
//   ...
// ]
```

## 🎨 UI Components

### MandiPriceCharts Component

```tsx
import { MandiPriceCharts } from '@/components/mandi/MandiPriceCharts';

// Show trend for specific commodity
<MandiPriceCharts commodity="rice" state="Punjab" />

// Show market overview (top gainers/losers)
<MandiPriceCharts />
```

### In MandiPricesView

- Click the **📊 Chart icon** in the header to toggle charts
- Charts show automatically when you select a commodity
- Market overview shows when no commodity is selected

## ⏰ Automatic Sync Schedule

The system automatically:
1. **9:01 AM** - Government API updates (mandiPriceService)
2. **9:15 AM** - Our system syncs to database (mandiPriceHistoryService)

This 14-minute delay ensures we get the latest data after API updates.

## 💾 Storage Optimization

### Why Only 17 Crops?

- **Storage Efficiency**: Tracking all crops would create 10,000+ records/day
- **Relevance**: These 17 crops cover 80%+ of Indian agriculture
- **Performance**: Faster queries and better user experience

### Data Retention

Current setup stores indefinitely. To add retention:

```sql
-- Delete records older than 1 year (run monthly)
DELETE FROM mandi_price_history 
WHERE date < CURRENT_DATE - INTERVAL '1 year';
```

## 🔧 Troubleshooting

### No Charts Showing?

1. Check if data exists:
```sql
SELECT COUNT(*) FROM mandi_price_history;
```

2. If zero, run manual sync:
```typescript
await mandiPriceHistoryService.syncTodaysPrices();
```

### Sync Not Working?

Check browser console for:
- Network errors
- Supabase connection issues
- API rate limiting

### Charts Not Updating?

Refresh materialized view:
```sql
REFRESH MATERIALIZED VIEW mandi_price_trends;
```

## 📊 Database Schema

```sql
mandi_price_history
├── id (UUID)
├── commodity (TEXT)
├── state (TEXT)
├── district (TEXT)
├── market (TEXT)
├── date (DATE)
├── min_price (NUMERIC)
├── max_price (NUMERIC)
├── modal_price (NUMERIC)
├── arrival_quantity (NUMERIC)
└── created_at (TIMESTAMPTZ)

UNIQUE(commodity, state, district, market, date)
```

## 🎯 Usage Examples

### Example 1: Show Rice Price Trend

```tsx
function RicePriceDashboard() {
  return (
    <div>
      <h2>Rice Market Analysis</h2>
      <MandiPriceCharts commodity="rice" />
    </div>
  );
}
```

### Example 2: Market Alert System

```typescript
async function checkPriceAlerts() {
  const gainers = await mandiPriceHistoryService.getTopGainers(3);
  
  for (const gainer of gainers) {
    if (gainer.changePercent > 10) {
      alert(`🚀 ${gainer.commodity} price up ${gainer.changePercent}%!`);
    }
  }
}
```

### Example 3: Best Selling Time

```typescript
async function findBestSellingTime(commodity: string) {
  const trend = await mandiPriceHistoryService.getPriceTrend(commodity);
  
  if (trend && trend.trend === 'up') {
    return `✅ Good time to sell ${commodity}! Price trending up.`;
  } else if (trend && trend.trend === 'down') {
    return `⏳ Wait to sell ${commodity}. Price trending down.`;
  }
  
  return `➡️ Stable prices for ${commodity}.`;
}
```

## 🔮 Future Enhancements

1. **Predictive Analytics**: ML-based price predictions
2. **Price Alerts**: Push notifications for price changes
3. **Seasonal Patterns**: Identify best selling seasons
4. **Regional Insights**: Compare your region vs others
5. **Export Data**: Download price history as CSV

## 📱 Mobile Experience

Charts are fully responsive:
- Touch-friendly interactions
- Swipe to see more data points
- Optimized for small screens
- Fast loading with caching

## ✅ Success Metrics

After implementation, you'll have:
- ✅ 30-day price history for 17 major crops
- ✅ Visual trend charts
- ✅ Fallback when API fails
- ✅ Market insights (gainers/losers)
- ✅ Automatic daily updates
- ✅ Optimized storage (only major crops)

## 🎉 Ready to Use!

1. Run the SQL schema
2. Wait for 9:15 AM sync (or trigger manually)
3. Open Mandi Prices page
4. Click chart icon to see trends
5. Select a commodity to see its price history

---

**Built with ❤️ for Indian Farmers**
