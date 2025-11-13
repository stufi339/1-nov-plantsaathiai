# Field Lifecycle Management - Quick Reference Card

## 🎯 One-Page Cheat Sheet

### State Machine
```
🟢 Active → 🟡 Harvested → ⚪ Dormant → 🟢 Active
```

### Files Created
```
Backend:
  src/lib/fieldLifecycleService.ts          Core service

UI Components:
  src/components/soilsati/FieldStatusBadge.tsx
  src/components/soilsati/HarvestConfirmationModal.tsx
  src/components/soilsati/FieldReactivationModal.tsx

Database:
  FIELD_LIFECYCLE_SCHEMA.sql                Migration script

Docs:
  FIELD_LIFECYCLE_COMPLETE.md               Main guide
  FIELD_LIFECYCLE_QUICK_START.md            5-min setup
  FIELD_LIFECYCLE_IMPLEMENTATION_GUIDE.md   Full integration
  FIELD_LIFECYCLE_BEFORE_AFTER.md           Impact comparison
```

### Quick Setup (5 min)

**1. Database** (2 min)
```sql
-- Run FIELD_LIFECYCLE_SCHEMA.sql in Supabase
```

**2. Types** (30 sec)
```typescript
// src/lib/supabase.ts
export interface Field {
  // ... existing
  status: 'active' | 'harvested' | 'dormant';
  harvest_date?: string;
  last_crop_type?: string;
  reactivation_date?: string;
  lifecycle_metadata?: any;
}
```

**3. Status Badge** (1 min)
```typescript
import { FieldStatusBadge } from './FieldStatusBadge';
<FieldStatusBadge status={field.status || 'active'} />
```

**4. Fetch Control** (1 min)
```typescript
import { fieldLifecycleService } from '../../lib/fieldLifecycleService';

if (!fieldLifecycleService.shouldFetchData(field.status || 'active')) {
  return; // Skip fetch
}
```

### Key Functions

```typescript
// Detect harvest candidates
const candidates = await fieldLifecycleService.detectHarvestCandidates();

// Confirm harvest
await fieldLifecycleService.confirmHarvest(fieldId, metadata);

// Reactivate field
await fieldLifecycleService.reactivateField(fieldId, cropType, metadata);

// Check if should fetch data
const shouldFetch = fieldLifecycleService.shouldFetchData(status);

// Get cost savings
const stats = await fieldLifecycleService.getCostSavingsStats();

// Get lifecycle history
const history = await fieldLifecycleService.getLifecycleHistory(fieldId);
```

### Configuration

```typescript
// In fieldLifecycleService.ts
HARVEST_THRESHOLD = 0.60;      // 60% of peak
SUSTAIN_DAYS = 5;              // Consecutive days
DORMANT_LOCK_DAYS = 21;        // Rest period
RAPID_RESOW_DAYS = 14;         // Multi-crop detection
```

### Component Props

**FieldStatusBadge**
```typescript
<FieldStatusBadge 
  status="active" | "harvested" | "dormant"
  size="sm" | "md" | "lg"
  showIcon={true}
/>
```

**HarvestConfirmationModal**
```typescript
<HarvestConfirmationModal
  candidate={harvestCandidate}
  fieldDataHistory={fieldData}
  onConfirm={(metadata) => {}}
  onReject={() => {}}
  onClose={() => {}}
/>
```

**FieldReactivationModal**
```typescript
<FieldReactivationModal
  fieldId={string}
  fieldName={string}
  currentStatus={status}
  lastCropType={string}
  dormantUntil={string}
  onReactivate={(cropType, metadata) => {}}
  onClose={() => {}}
/>
```

### Database Schema

**Fields Table (new columns)**
```sql
status TEXT DEFAULT 'active'
harvest_date TIMESTAMPTZ
last_crop_type TEXT
reactivation_date TIMESTAMPTZ
lifecycle_metadata JSONB
```

**New Table**
```sql
field_lifecycle_events (
  id, field_id, event_type, 
  from_status, to_status, 
  metadata, created_at
)
```

### Cost Impact

**Before**: 300 fields × $0.10/day = $900/month
**After**: 120 active × $0.10/day = $360/month
**Savings**: 60% ($540/month)

### Detection Algorithm

```
1. Get all active fields
2. Check last 30 days of data
3. Find peak NDVI and NDRE
4. Check if last 5 days all below 60% of peak
5. Calculate confidence (high/medium/low)
6. Return candidates for farmer confirmation
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Badge not showing | Run migration, check status column |
| Still fetching inactive | Add shouldFetchData() check |
| TypeScript errors | Update Field interface |
| Detection not working | Check 30-day data exists |

### Success Metrics

- Detection Accuracy: >60%
- Cost Reduction: 60-80%
- False Positives: <40%
- User Satisfaction: <5% rejections

### Next Steps

1. ✅ Run database migration
2. ✅ Update types
3. ✅ Add status badges
4. ✅ Add fetch control
5. ⏭️ Add harvest detection
6. ⏭️ Add reactivation modal
7. ⏭️ Test and deploy

### Resources

- **Quick Start**: FIELD_LIFECYCLE_QUICK_START.md
- **Full Guide**: FIELD_LIFECYCLE_IMPLEMENTATION_GUIDE.md
- **Impact**: FIELD_LIFECYCLE_BEFORE_AFTER.md
- **Complete**: FIELD_LIFECYCLE_COMPLETE.md

---

**Print this page and keep it handy during implementation!** 📄
