# Field Lifecycle Management System - Implementation Guide

## 🎯 Overview

The Field Lifecycle Management System transforms Soil Saathi from continuous monitoring into an intelligent farming companion that:
- **Saves 60-80% on API costs** by stopping data fetching for inactive fields
- **Reduces noise** by eliminating irrelevant notifications after harvest
- **Respects crop biology** with proper dormant periods
- **Enables smart reactivation** with farmer choice and control

## 🏗️ Architecture

### State Machine
```
Active → Harvested → Dormant → Active
  ↓                              ↑
  └──────── Reactivation ────────┘
```

### Core Components

1. **Backend Service** (`fieldLifecycleService.ts`)
   - Harvest detection algorithm
   - State management
   - Cost optimization logic
   - Event logging

2. **Database Schema** (`FIELD_LIFECYCLE_SCHEMA.sql`)
   - Lifecycle columns on fields table
   - Events audit trail
   - RLS policies
   - Automated triggers

3. **UI Components**
   - `HarvestConfirmationModal` - Farmer confirmation with 30-day chart
   - `FieldStatusBadge` - Visual status indicators
   - `FieldReactivationModal` - Smart reactivation workflow

## 📋 Implementation Steps

### Step 1: Database Setup

Run the SQL migration on your Supabase instance:

```bash
# Copy FIELD_LIFECYCLE_SCHEMA.sql content
# Go to Supabase Dashboard → SQL Editor
# Paste and execute the migration
```

This adds:
- `status`, `harvest_date`, `last_crop_type`, `reactivation_date`, `lifecycle_metadata` columns to `fields`
- `field_lifecycle_events` table for audit trail
- Indexes for performance
- RLS policies for security
- Automated triggers for event logging

### Step 2: Update TypeScript Types

Add to `src/lib/supabase.ts`:

```typescript
export interface Field {
  id: string;
  user_id: string;
  name: string;
  location: string;
  crop_type: string;
  area: number;
  coordinates: any;
  status: 'active' | 'harvested' | 'dormant';  // NEW
  harvest_date?: string;                        // NEW
  last_crop_type?: string;                      // NEW
  reactivation_date?: string;                   // NEW
  lifecycle_metadata?: any;                     // NEW
  created_at: string;
  updated_at: string;
}
```

### Step 3: Integrate Fetch Control

Update `satelliteDataService.ts` to check field status:

```typescript
import { fieldLifecycleService } from './fieldLifecycleService';

async getComprehensiveFieldData(field: Field, coordinates: any) {
  // Check if we should fetch data for this field
  if (!fieldLifecycleService.shouldFetchData(field.status)) {
    console.log(`⏸️ Skipping data fetch for ${field.status} field: ${field.name}`);
    return null; // Or return cached data
  }
  
  // Continue with normal fetch...
}
```

### Step 4: Add Harvest Detection to Dashboard

Update `MyFieldsList.tsx` or `FieldDetailsDashboard.tsx`:

```typescript
import { fieldLifecycleService, HarvestCandidate } from '../../lib/fieldLifecycleService';
import { HarvestConfirmationModal } from './HarvestConfirmationModal';
import { FieldStatusBadge } from './FieldStatusBadge';

const [harvestCandidates, setHarvestCandidates] = useState<HarvestCandidate[]>([]);
const [showHarvestModal, setShowHarvestModal] = useState(false);
const [selectedCandidate, setSelectedCandidate] = useState<HarvestCandidate | null>(null);

// Check for harvest candidates on mount
useEffect(() => {
  const checkHarvest = async () => {
    const candidates = await fieldLifecycleService.detectHarvestCandidates();
    setHarvestCandidates(candidates);
    
    if (candidates.length > 0) {
      // Show notification or modal
      setSelectedCandidate(candidates[0]);
      setShowHarvestModal(true);
    }
  };
  
  checkHarvest();
}, []);

// Render status badge in field list
<FieldStatusBadge status={field.status} />

// Render harvest modal
{showHarvestModal && selectedCandidate && (
  <HarvestConfirmationModal
    candidate={selectedCandidate}
    fieldDataHistory={fieldDataHistory}
    onConfirm={async (metadata) => {
      await fieldLifecycleService.confirmHarvest(selectedCandidate.fieldId, metadata);
      setShowHarvestModal(false);
      // Refresh fields
    }}
    onReject={() => {
      setShowHarvestModal(false);
      // Move to next candidate if any
    }}
    onClose={() => setShowHarvestModal(false)}
  />
)}
```

### Step 5: Add Reactivation Button

In field details view for harvested/dormant fields:

```typescript
import { FieldReactivationModal } from './FieldReactivationModal';

const [showReactivationModal, setShowReactivationModal] = useState(false);

// Show reactivation button for inactive fields
{(field.status === 'harvested' || field.status === 'dormant') && (
  <button
    onClick={() => setShowReactivationModal(true)}
    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
  >
    Reactivate Field
  </button>
)}

// Render reactivation modal
{showReactivationModal && (
  <FieldReactivationModal
    fieldId={field.id}
    fieldName={field.name}
    currentStatus={field.status}
    lastCropType={field.last_crop_type}
    dormantUntil={field.lifecycle_metadata?.dormantUntil}
    onReactivate={async (cropType, metadata) => {
      await fieldLifecycleService.reactivateField(field.id, cropType, metadata);
      setShowReactivationModal(false);
      // Refresh field
    }}
    onClose={() => setShowReactivationModal(false)}
  />
)}
```

### Step 6: Update Notification Filtering

In `notificationMessages.ts` or notification service:

```typescript
// Only send operational alerts for active fields
const shouldSendNotification = (field: Field, notificationType: string) => {
  if (field.status !== 'active') {
    // Skip operational notifications for inactive fields
    if (['health_alert', 'irrigation_alert', 'pest_alert'].includes(notificationType)) {
      return false;
    }
  }
  return true;
};
```

### Step 7: Add Lifecycle Dashboard Widget

Create a summary widget showing cost savings:

```typescript
const [costSavings, setCostSavings] = useState<any>(null);

useEffect(() => {
  const loadStats = async () => {
    const stats = await fieldLifecycleService.getCostSavingsStats();
    setCostSavings(stats);
  };
  loadStats();
}, []);

// Render widget
{costSavings && (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-bold mb-4">Field Lifecycle Summary</h3>
    <div className="grid grid-cols-3 gap-4">
      <div>
        <div className="text-2xl font-bold text-green-600">{costSavings.activeFields}</div>
        <div className="text-sm text-gray-600">Active Fields</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-600">{costSavings.inactiveFields}</div>
        <div className="text-sm text-gray-600">Inactive Fields</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-blue-600">{costSavings.estimatedSavingsPercent}%</div>
        <div className="text-sm text-gray-600">Cost Savings</div>
      </div>
    </div>
  </div>
)}
```

## 🔧 Configuration

### Harvest Detection Thresholds

Adjust in `fieldLifecycleService.ts`:

```typescript
private readonly HARVEST_THRESHOLD = 0.60; // 60% of peak (conservative)
private readonly SUSTAIN_DAYS = 5;         // Consecutive days
```

### Dormant Period

```typescript
private readonly DORMANT_LOCK_DAYS = 21;   // Minimum rest period
```

### Rapid Re-sowing Detection

```typescript
private readonly RAPID_RESOW_DAYS = 14;    // Monitor window for multi-cropping
```

## 📊 Monitoring & Analytics

### Track Harvest Detection Accuracy

```typescript
// In admin dashboard
const accuracy = await supabase
  .from('field_lifecycle_events')
  .select('*')
  .eq('event_type', 'harvest_detected');

const confirmed = await supabase
  .from('field_lifecycle_events')
  .select('*')
  .eq('event_type', 'harvest_confirmed');

const accuracyRate = (confirmed.length / accuracy.length) * 100;
```

### Monitor Cost Savings

```typescript
// Track API calls saved
const activeCalls = activeFields * 30; // Daily calls
const savedCalls = inactiveFields * 30;
const savingsPercent = (savedCalls / (activeCalls + savedCalls)) * 100;
```

## 🎓 Best Practices

### 1. Conservative Detection
- Start with high thresholds (60% drop)
- Require farmer confirmation
- Monitor false positive rates

### 2. Farmer Communication
- Clear explanations in modals
- Show 30-day trend charts
- Explain cost savings benefits

### 3. Flexible Reactivation
- Allow early reactivation with warning
- Suggest crop rotation
- Quick-form for same-field reuse

### 4. Data Retention
- Keep raw data for 1 year
- Aggregate to monthly for 3 years
- Keep lifecycle events indefinitely

### 5. Multi-cropping Support
- Monitor harvested fields for 14 days
- Auto-suggest reactivation if NDVI rises
- Quick reactivation workflow

## 🚀 Rollout Strategy

### Phase 1: Soft Launch (Week 1-2)
- Deploy to 10% of users
- Monitor detection accuracy
- Gather farmer feedback

### Phase 2: Optimization (Week 3-4)
- Tune thresholds based on data
- Improve UI based on feedback
- Add admin controls

### Phase 3: Full Rollout (Week 5+)
- Deploy to all users
- Monitor cost savings
- Track user satisfaction

## 🐛 Troubleshooting

### False Positives
- Increase HARVEST_THRESHOLD to 0.65 or 0.70
- Increase SUSTAIN_DAYS to 7
- Add burn/graze detection guards

### Missed Harvests
- Decrease HARVEST_THRESHOLD to 0.55
- Check NDRE data availability
- Review field data quality

### Reactivation Issues
- Check dormant lock logic
- Verify RLS policies
- Test cache clearing

## 📈 Success Metrics

Track these KPIs:

1. **Detection Accuracy**: Target >60% confirmed harvests
2. **Cost Reduction**: Target 60-80% for inactive fields
3. **User Satisfaction**: Target <5% false harvest rejections
4. **Reactivation Rate**: Track field reuse patterns
5. **API Call Reduction**: Monitor actual savings

## 🎯 Next Steps

1. Run database migration
2. Update TypeScript types
3. Integrate fetch control
4. Add UI components
5. Test with sample fields
6. Deploy to staging
7. Soft launch to users
8. Monitor and optimize

---

**Questions?** Check the code comments or reach out to the development team.

**Ready to deploy?** Follow the steps above and transform Soil Saathi into an intelligent farming companion! 🌾
