# Real-Time Data Implementation Plan

## 🎯 Current Status

### What's Using Real Data ✅
1. **Field List** (MyFieldsList.tsx) - Loads from localStorage
2. **Field Details** (FieldDetailsDashboard.tsx) - Loads field info from localStorage
3. **Disease Detection** (DiseaseDetectionView.tsx) - Uses real API
4. **Field Mapping** (GoogleMapsFieldMapping.tsx) - Real GPS coordinates

### What's Still Using Mock Data ❌
1. **Vegetation Indices** - Hardcoded NDVI values
2. **Soil Properties** - Mock NPK data
3. **Field Health Quadrants** - Mock health zones
4. **MobileOptimizedFieldDashboard** - Mock field data

## 🔄 Real-Time Data Flow Needed

### 1. Satellite Data Fetching
**Current**: Mock NDVI values (0.67, 0.58, etc.)
**Needed**: Real satellite imagery analysis

```typescript
// When field details page loads:
1. Get field coordinates from localStorage
2. Call Google Earth Engine API
3. Calculate vegetation indices (NDVI, NDRE, NDWI, etc.)
4. Update field health status
5. Save to localStorage
6. Display to user
```

### 2. Soil Analysis
**Current**: Mock NPK values
**Needed**: Satellite-based soil analysis

```typescript
// Soil analysis flow:
1. Use field coordinates
2. Call soil analysis API
3. Get NPK estimates
4. Calculate soil moisture
5. Update field data
6. Display results
```

### 3. Field Health Zones
**Current**: Mock quadrant data
**Needed**: Real zone analysis

```typescript
// Zone analysis:
1. Divide field polygon into quadrants
2. Get NDVI for each quadrant
3. Calculate health status per zone
4. Identify problem areas
5. Display zone map
```

## 📊 Implementation Steps

### Step 1: Add "Refresh Data" Button
Add button to trigger satellite data fetch:

```typescript
const handleRefreshData = async () => {
  setIsRefreshing(true);
  try {
    // 1. Get field coordinates
    const coords = field.coordinates;
    
    // 2. Call satellite API
    const satelliteData = await satelliteDataService.fetchVegetationIndices(coords);
    
    // 3. Update field data
    const updatedField = {
      ...field,
      health: satelliteData,
      lastAnalyzed: new Date().toISOString()
    };
    
    // 4. Save to localStorage
    localStorage.setItem(`field_${fieldId}_data`, JSON.stringify(updatedField));
    
    // 5. Update state
    setFieldData(updatedField);
    
    toast.success("Satellite data refreshed!");
  } catch (error) {
    toast.error("Failed to fetch satellite data");
  } finally {
    setIsRefreshing(false);
  }
};
```

### Step 2: Auto-Fetch on First Load
When field is first created, automatically fetch satellite data:

```typescript
useEffect(() => {
  if (fieldData && !fieldData.lastAnalyzed) {
    // New field - fetch satellite data
    handleRefreshData();
  }
}, [fieldData]);
```

### Step 3: Show Data Age
Display when data was last updated:

```typescript
<Badge>
  Last updated: {formatDistanceToNow(new Date(field.lastAnalyzed))} ago
</Badge>
```

### Step 4: Implement Satellite Service
Create comprehensive satellite data service:

```typescript
// src/lib/satelliteDataService.ts
export class SatelliteDataService {
  async fetchVegetationIndices(coordinates: [number, number][]) {
    // Calculate field center
    const center = this.calculateCenter(coordinates);
    
    // Call Google Earth Engine or similar API
    const response = await fetch('/api/satellite/vegetation', {
      method: 'POST',
      body: JSON.stringify({ coordinates, center })
    });
    
    const data = await response.json();
    
    return {
      ndvi: data.ndvi,
      ndre: data.ndre,
      ndwi: data.ndwi,
      ndmi: data.ndmi,
      // ... other indices
      quadrants: data.quadrants,
      timestamp: new Date().toISOString()
    };
  }
}
```

## 🚀 Quick Fix for Now

### Option 1: Show "Pending Analysis" State
Instead of mock data, show that analysis is pending:

```typescript
{field.health.ndvi === 0 ? (
  <Card className="p-4 bg-yellow-50">
    <p>📊 Satellite analysis pending</p>
    <Button onClick={handleRefreshData}>
      Fetch Satellite Data
    </Button>
  </Card>
) : (
  <VegetationIndicesGrid data={field.health} />
)}
```

### Option 2: Use Existing Satellite Service
You already have `satelliteDataService.ts` - let's use it:

```typescript
import { satelliteDataService } from '@/lib/satelliteDataService';

const fetchRealData = async () => {
  const center = calculateCenter(field.coordinates);
  const data = await satelliteDataService.getVegetationIndices(
    center.lat,
    center.lng,
    field.id
  );
  // Update field with real data
};
```

## 📝 What I'll Do Now

1. **Remove all mock data constants**
2. **Add "Fetch Satellite Data" button**
3. **Integrate existing satellite service**
4. **Show pending state for new fields**
5. **Display last update time**
6. **Add refresh functionality**

## 🎯 Expected Behavior

### For New Fields
```
Status: ⚪ Pending Analysis
NDVI: Not yet analyzed
[Fetch Satellite Data] button
```

### After Fetching Data
```
Status: 🟢 Healthy
NDVI: 0.67 (Real from satellite)
Last updated: 2 hours ago
[Refresh Data] button
```

### For Existing Fields
```
Status: Based on real NDVI
NDVI: Real satellite data
Last updated: X time ago
[Refresh Data] button
```

## ✅ Action Items

- [ ] Remove mockFieldData from FieldDetailsDashboard
- [ ] Remove mockFieldData from MobileOptimizedFieldDashboard
- [ ] Add "Fetch Satellite Data" button
- [ ] Integrate satelliteDataService
- [ ] Show pending state for NDVI = 0
- [ ] Add last update timestamp
- [ ] Add refresh functionality
- [ ] Test with real coordinates
- [ ] Verify data persistence

## 🔧 Files to Update

1. `src/components/soilsati/FieldDetailsDashboard.tsx` ✅ (mock removed)
2. `src/components/soilsati/MobileOptimizedFieldDashboard.tsx` ❌ (needs update)
3. `src/lib/satelliteDataService.ts` ✅ (exists, needs integration)
4. `src/components/soilsati/VegetationIndicesGrid.tsx` (add pending state)
5. `src/components/soilsati/ComprehensiveSoilProperties.tsx` (add pending state)

---

**Status**: IN PROGRESS
**Priority**: HIGH
**Next**: Implement satellite data fetching button
