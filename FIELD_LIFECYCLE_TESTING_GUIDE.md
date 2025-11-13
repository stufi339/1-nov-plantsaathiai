# Field Lifecycle Management - Testing Guide

## 🧪 Testing Overview

This guide covers how to test the Field Lifecycle Management System to ensure everything works correctly before deploying to production.

## 📋 Pre-Test Checklist

Before running tests, ensure:

- [ ] Database migration (`FIELD_LIFECYCLE_SCHEMA.sql`) has been executed
- [ ] You have a Supabase account with test data
- [ ] You're logged into the app (for authenticated tests)
- [ ] Node.js is installed (for Node.js tests)

## 🎯 Test Methods

### Method 1: Browser-Based Test Suite (Recommended)

**File**: `test-field-lifecycle.html`

**How to run**:
1. Open `test-field-lifecycle.html` in your browser
2. Make sure you're logged into your app in another tab
3. Click "Run Complete Test Suite" or run individual tests

**What it tests**:
- ✅ Database schema verification
- ✅ Field status management
- ✅ Harvest detection algorithm
- ✅ Lifecycle events logging
- ✅ Cost optimization logic

**Expected results**:
- All 5 tests should pass with green checkmarks
- You'll see detailed JSON output for each test
- Progress bar shows completion

### Method 2: Node.js Test Script

**File**: `test-field-lifecycle.js`

**How to run**:
```bash
# Install dependencies first
npm install @supabase/supabase-js

# Run tests
node test-field-lifecycle.js
```

**What it tests**:
- ✅ Schema verification
- ✅ Cost optimization logic

### Method 3: Manual Testing in App

Follow these steps to manually test in your application:

## 🔍 Manual Test Scenarios

### Scenario 1: Create Active Field

**Steps**:
1. Log into your app
2. Go to Soil Saathi → Add Field
3. Create a new field with crop type
4. Verify field shows 🟢 Active status badge

**Expected**:
- Field created successfully
- Status badge shows "Active"
- Field appears in list
- Lifecycle event logged in database

**SQL Verification**:
```sql
SELECT * FROM fields WHERE name = 'Your Field Name';
-- Should show status = 'active'

SELECT * FROM field_lifecycle_events 
WHERE field_id = 'your-field-id';
-- Should show 'created' event
```

### Scenario 2: Harvest Detection

**Steps**:
1. Create a field with 30 days of data
2. Manually insert declining NDVI data for last 5 days
3. Run harvest detection
4. Verify harvest candidate appears

**SQL to insert test data**:
```sql
-- Insert peak NDVI data (20 days ago)
INSERT INTO field_data (field_id, ndvi, ndre, timestamp)
VALUES 
  ('your-field-id', 0.80, 0.70, NOW() - INTERVAL '20 days'),
  ('your-field-id', 0.82, 0.72, NOW() - INTERVAL '19 days'),
  -- ... more peak data

-- Insert declining NDVI (last 5 days)
  ('your-field-id', 0.35, 0.30, NOW() - INTERVAL '5 days'),
  ('your-field-id', 0.33, 0.28, NOW() - INTERVAL '4 days'),
  ('your-field-id', 0.34, 0.29, NOW() - INTERVAL '3 days'),
  ('your-field-id', 0.32, 0.27, NOW() - INTERVAL '2 days'),
  ('your-field-id', 0.31, 0.26, NOW() - INTERVAL '1 day');
```

**Expected**:
- Harvest candidate detected
- Modal shows 30-day chart
- NDVI/NDRE drop percentages shown
- Confidence level displayed

### Scenario 3: Confirm Harvest

**Steps**:
1. From harvest detection modal
2. Enter optional yield and notes
3. Click "Confirm Harvest"
4. Verify field status changes

**Expected**:
- Field status changes to 🟡 Harvested
- Harvest date recorded
- Lifecycle event logged
- Cache cleared for field
- Dormant period starts (21 days)

**SQL Verification**:
```sql
SELECT status, harvest_date, lifecycle_metadata 
FROM fields 
WHERE id = 'your-field-id';
-- Should show status = 'harvested'

SELECT * FROM field_lifecycle_events 
WHERE field_id = 'your-field-id' 
AND event_type = 'harvest_confirmed';
-- Should show harvest event
```

### Scenario 4: Reactivate Field

**Steps**:
1. Go to harvested/dormant field
2. Click "Reactivate Field"
3. Select new crop type
4. Enter sowing date
5. Click "Reactivate"

**Expected**:
- Field status changes to 🟢 Active
- New crop type saved
- Reactivation date recorded
- Lifecycle event logged
- Cache cleared
- Monitoring resumes

**SQL Verification**:
```sql
SELECT status, crop_type, reactivation_date 
FROM fields 
WHERE id = 'your-field-id';
-- Should show status = 'active', new crop_type

SELECT * FROM field_lifecycle_events 
WHERE field_id = 'your-field-id' 
AND event_type = 'reactivated';
-- Should show reactivation event
```

### Scenario 5: Cost Optimization

**Steps**:
1. Create 3 fields: 1 active, 1 harvested, 1 dormant
2. Check satellite data fetching
3. Verify only active field fetches data

**Expected**:
- Active field: Data fetched daily ✅
- Harvested field: No data fetch ⏸️
- Dormant field: No data fetch ⏸️
- Console logs show "Skipping fetch for inactive field"

**Code to verify**:
```typescript
// In your satellite data service
if (!fieldLifecycleService.shouldFetchData(field.status)) {
  console.log(`⏸️ Skipping fetch for ${field.status} field`);
  return;
}
```

## 📊 Test Data Setup

### Quick Test Data Script

Run this in Supabase SQL Editor to create test scenarios:

```sql
-- Create test user field (replace user_id with yours)
INSERT INTO fields (user_id, name, location, crop_type, area, coordinates, status)
VALUES 
  (auth.uid(), 'Test Active Field', 'Test Location', 'Rice', 2.5, 
   '{"lat": 28.6139, "lng": 77.2090}', 'active'),
  (auth.uid(), 'Test Harvested Field', 'Test Location', 'Wheat', 3.0,
   '{"lat": 28.6139, "lng": 77.2090}', 'harvested'),
  (auth.uid(), 'Test Dormant Field', 'Test Location', 'Maize', 2.0,
   '{"lat": 28.6139, "lng": 77.2090}', 'dormant');

-- Add field data for harvest detection test
-- (Use the field_id from above)
INSERT INTO field_data (field_id, ndvi, ndre, ndwi, evi, soil_moisture, temperature, health_score, timestamp)
SELECT 
  'your-field-id',
  0.80 - (random() * 0.05),
  0.70 - (random() * 0.05),
  0.3,
  0.7,
  0.5,
  28,
  85,
  NOW() - (interval '1 day' * generate_series(30, 6))
UNION ALL
SELECT 
  'your-field-id',
  0.35 + (random() * 0.05),
  0.30 + (random() * 0.05),
  0.2,
  0.4,
  0.3,
  30,
  45,
  NOW() - (interval '1 day' * generate_series(5, 0));
```

## ✅ Success Criteria

### All Tests Should Pass If:

1. **Schema Verification**
   - All columns exist in fields table
   - field_lifecycle_events table exists
   - Indexes created
   - RLS policies active

2. **Status Management**
   - Can create fields with any status
   - Can update status (active → harvested → dormant)
   - Status changes persist

3. **Harvest Detection**
   - Detects when NDVI/NDRE drop below 60% of peak
   - Requires 5 consecutive days
   - Calculates confidence correctly
   - Returns harvest candidates

4. **Event Logging**
   - All state changes logged
   - Events have correct metadata
   - Timestamps accurate
   - Can query event history

5. **Cost Optimization**
   - shouldFetchData returns true for active
   - shouldFetchData returns false for inactive
   - Cost savings calculated correctly
   - API calls reduced for inactive fields

## 🐛 Troubleshooting

### Test Failures

**"Column does not exist"**
- Solution: Run FIELD_LIFECYCLE_SCHEMA.sql migration

**"Table does not exist"**
- Solution: Check Supabase connection, run migration

**"User not authenticated"**
- Solution: Log into app first, then run tests

**"No harvest candidates found"**
- Solution: Add test data with declining NDVI pattern

**"Event not logged"**
- Solution: Check if trigger is active, verify RLS policies

## 📈 Performance Testing

### Load Test Scenarios

Test with different field counts:

- **Small**: 10 fields (5 active, 5 inactive)
- **Medium**: 100 fields (40 active, 60 inactive)
- **Large**: 1000 fields (400 active, 600 inactive)

**Metrics to track**:
- Query response time
- API call reduction
- Cost savings percentage
- Event logging performance

## 🎯 Next Steps After Testing

Once all tests pass:

1. ✅ Update TypeScript types in production code
2. ✅ Integrate UI components
3. ✅ Add fetch control to satellite service
4. ✅ Deploy to staging
5. ✅ Run tests in staging
6. ✅ Soft launch to 10% of users
7. ✅ Monitor metrics
8. ✅ Full rollout

## 📚 Additional Resources

- **Implementation Guide**: FIELD_LIFECYCLE_IMPLEMENTATION_GUIDE.md
- **Quick Start**: FIELD_LIFECYCLE_QUICK_START.md
- **API Reference**: FIELD_LIFECYCLE_QUICK_REFERENCE.md

---

**Ready to test?** Open `test-field-lifecycle.html` and click "Run Complete Test Suite"! 🚀
