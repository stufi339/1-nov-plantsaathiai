# 🏗️ Crop Rotation Planner - Technical Architecture

## 📁 File Structure

```
src/
├── lib/
│   └── cropRotationService.ts          # Core rotation engine
├── components/
│   └── rotation/
│       └── CropRotationView.tsx        # Main UI component
├── pages/
│   └── CropRotation.tsx                # Standalone page
└── App.tsx                             # Route configuration
```

## 🔧 Core Service Architecture

### `cropRotationService.ts`

```typescript
class CropRotationService {
  // Main recommendation engine
  getRotationRecommendation(fieldId: string): Promise<CropRotationRecommendation>
  
  // Multi-season planning
  getMultiSeasonPlan(fieldId: string, years: number): Promise<MultiSeasonPlan>
  
  // Private helper methods
  private getFieldHistory(fieldId: string)
  private getCurrentSoilHealth(fieldId: string)
  private getDiseaseHistory(fieldId: string)
  private calculateCropCandidates(...)
  private rankCandidates(...)
  private buildRecommendation(...)
}
```

## 📊 Data Models

### CropRotationRecommendation
```typescript
interface CropRotationRecommendation {
  currentCrop: string;
  recommendedNextCrop: string;
  confidence: number;                    // 0-100
  
  soilRegeneration: {
    nitrogenRestoration: number;         // % improvement
    phosphorusBalance: number;
    potassiumEnhancement: number;
    organicMatterIncrease: number;
  };
  
  diseaseRiskReduction: number;          // % reduction
  
  marketAdvantage: {
    expectedPrice: number;               // ₹/kg
    demandTrend: 'high' | 'medium' | 'low';
    nearbyMarkets: string[];
    profitIncrease: number;              // ₹/acre
  };
  
  implementation: {
    preparationTime: number;             // days
    sowingWindow: string;
    expectedYield: number;               // tons/acre
    waterRequirement: 'low' | 'medium' | 'high';
    laborIntensity: 'low' | 'medium' | 'high';
  };
  
  reasoning: string[];
}
```

### MultiSeasonPlan
```typescript
interface MultiSeasonPlan {
  seasons: {
    season: string;
    crop: string;
    soilHealthImpact: number;
    expectedProfit: number;
  }[];
  
  totalSoilImprovement: number;
  totalProfitIncrease: number;
  riskAssessment: string[];
}
```

### Crop Database Entry
```typescript
interface CropData {
  nutrients: {
    n: number;      // Nitrogen impact (-60 to +35)
    p: number;      // Phosphorus impact
    k: number;      // Potassium impact
  };
  diseases: string[];
  season: 'kharif' | 'rabi' | 'both' | 'annual';
  marketPrice: number;
  yieldPerAcre: number;
  waterNeed: 'low' | 'medium' | 'high';
  laborNeed: 'low' | 'medium' | 'high';
}
```

## 🧠 Algorithm Flow

### 1. Data Collection Phase
```
getRotationRecommendation(fieldId)
  ↓
  ├─→ getFieldHistory(fieldId)
  │   └─→ BlackBox events → crop history
  │
  ├─→ getCurrentSoilHealth(fieldId)
  │   └─→ Supabase fields → NPK levels
  │
  └─→ getDiseaseHistory(fieldId)
      └─→ BlackBox events → disease patterns
```

### 2. Candidate Generation Phase
```
calculateCropCandidates(currentCrop, soilHealth, diseases, history)
  ↓
  ├─→ Rule 1: Nitrogen fixation after heavy users
  │   └─→ If N depleted > 30% → Add legumes
  │
  ├─→ Rule 2: Disease cycle breaking
  │   └─→ For each disease → Add resistant crops
  │
  ├─→ Rule 3: Crop diversity
  │   └─→ Exclude recent crops (last 3 seasons)
  │
  └─→ Rule 4: Soil nutrient balance
      └─→ If NPK < 40 → Add enriching crops
```

### 3. Ranking Phase
```
rankCandidates(candidates, soilHealth)
  ↓
  For each candidate:
    ├─→ Soil Score (40% weight)
    │   └─→ N fixation: +20, K enrichment: +15, P balance: +5
    │
    ├─→ Market Score (35% weight)
    │   └─→ (price × yield) / 100
    │
    └─→ Resource Score (25% weight)
        └─→ Water efficiency + Labor efficiency
  
  Sort by total score → Return highest
```

### 4. Recommendation Building Phase
```
buildRecommendation(current, next, soil, diseases, history)
  ↓
  ├─→ Calculate soil regeneration benefits
  ├─→ Calculate disease risk reduction
  ├─→ Calculate market advantage
  ├─→ Generate implementation timeline
  └─→ Build human-readable reasoning
```

## 🔗 Integration Points

### BlackBox Service
```typescript
// Field history
const events = await blackBoxService.getFieldEvents(fieldId);

// Extract crop history
const cropHistory = events
  .filter(e => e.event_type === 'crop_planted' || e.event_type === 'harvest')
  .map(e => e.metadata?.crop);

// Extract disease history
const diseases = events
  .filter(e => e.event_type === 'disease_detected')
  .map(e => e.metadata?.disease_name);
```

### Supabase Field Service
```typescript
// Current soil health
const { data: field } = await supabase
  .from('fields')
  .select('soil_properties')
  .eq('id', fieldId)
  .single();

const soilHealth = field?.soil_properties || {
  nitrogen: 50,
  phosphorus: 50,
  potassium: 50,
  ph: 7.0,
  organicMatter: 2.5
};
```

### Marketplace Service (Future)
```typescript
// Real-time market prices
const prices = await marketplaceService.getRegionalPrices(location);

// Demand trends
const trends = await marketplaceService.getDemandTrends(crop);
```

## 🎨 UI Component Architecture

### CropRotationView.tsx

```
CropRotationView
  ├─→ Header (Gradient banner)
  │
  ├─→ Season Transition Card
  │   ├─→ Current Crop Status
  │   ├─→ Arrow Indicator
  │   └─→ Recommended Crop Status
  │
  ├─→ Soil Regeneration Card
  │   ├─→ Nitrogen Grid Item
  │   ├─→ Phosphorus Grid Item
  │   └─→ Potassium Grid Item
  │
  ├─→ Market Intelligence Card
  │   ├─→ Price & Demand Display
  │   └─→ Nearby Markets List
  │
  ├─→ Implementation Guide Card
  │   ├─→ Timeline Details
  │   └─→ Resource Requirements
  │
  ├─→ AI Reasoning Card
  │   └─→ Reasoning List Items
  │
  └─→ Multi-Season Planning Card
      ├─→ Summary Metrics
      ├─→ Season Timeline
      └─→ Risk Assessment
```

## 🔄 Data Flow Diagram

```
User Opens Field Details
  ↓
Clicks "Smart Crop Rotation Planner"
  ↓
Navigate to /crop-rotation/{fieldId}
  ↓
CropRotation Page Loads
  ↓
Fetch Field Data from localStorage
  ↓
CropRotationView Component Mounts
  ↓
Call cropRotationService.getRotationRecommendation(fieldId)
  ↓
Service Queries:
  ├─→ BlackBox (field history, diseases)
  ├─→ Supabase (soil health)
  └─→ Marketplace (prices) [future]
  ↓
Algorithm Processes Data:
  ├─→ Generate candidates
  ├─→ Rank by multiple factors
  └─→ Build recommendation
  ↓
Return CropRotationRecommendation
  ↓
UI Renders:
  ├─→ Transition visualization
  ├─→ Soil health metrics
  ├─→ Market intelligence
  ├─→ Implementation guide
  └─→ AI reasoning
  ↓
User Clicks "Generate Plan"
  ↓
Call cropRotationService.getMultiSeasonPlan(fieldId, 3)
  ↓
Simulate 3-year rotation
  ↓
Return MultiSeasonPlan
  ↓
UI Renders Timeline & Risk Assessment
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('CropRotationService', () => {
  test('recommends legumes after heavy nitrogen users', () => {
    // Test nitrogen fixation rule
  });
  
  test('breaks disease cycles correctly', () => {
    // Test disease breaking rule
  });
  
  test('ranks candidates by multiple factors', () => {
    // Test scoring algorithm
  });
  
  test('generates valid multi-season plans', () => {
    // Test multi-season planning
  });
});
```

### Integration Tests
```typescript
describe('Crop Rotation Integration', () => {
  test('fetches field history from BlackBox', () => {
    // Test BlackBox integration
  });
  
  test('fetches soil health from Supabase', () => {
    // Test Supabase integration
  });
  
  test('generates recommendation with real data', () => {
    // Test end-to-end flow
  });
});
```

### UI Tests
```typescript
describe('CropRotationView', () => {
  test('renders recommendation correctly', () => {
    // Test UI rendering
  });
  
  test('handles loading state', () => {
    // Test loading spinner
  });
  
  test('handles no data state', () => {
    // Test empty state
  });
  
  test('generates multi-season plan on click', () => {
    // Test button interaction
  });
});
```

## 🚀 Performance Optimization

### Caching Strategy
```typescript
// Cache recommendations for 24 hours
const CACHE_KEY = `rotation_rec_${fieldId}`;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Check cache before computing
const cached = localStorage.getItem(CACHE_KEY);
if (cached) {
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return data;
  }
}

// Compute and cache
const recommendation = await computeRecommendation(fieldId);
localStorage.setItem(CACHE_KEY, JSON.stringify({
  data: recommendation,
  timestamp: Date.now()
}));
```

### Lazy Loading
```typescript
// Load multi-season plan only when requested
const [multiSeasonPlan, setMultiSeasonPlan] = useState<MultiSeasonPlan | null>(null);

const loadMultiSeasonPlan = async () => {
  if (!multiSeasonPlan) {
    const plan = await cropRotationService.getMultiSeasonPlan(fieldId, 3);
    setMultiSeasonPlan(plan);
  }
};
```

### Memoization
```typescript
// Memoize expensive calculations
const soilScore = useMemo(() => 
  calculateSoilScore(recommendation.soilRegeneration),
  [recommendation]
);
```

## 🔐 Security Considerations

### Data Privacy
- Field data stays in localStorage (client-side)
- No sensitive data sent to external APIs
- User authentication required for access

### Input Validation
```typescript
// Validate field ID
if (!fieldId || typeof fieldId !== 'string') {
  throw new Error('Invalid field ID');
}

// Validate crop names
const validCrops = Object.keys(CROP_DATABASE);
if (!validCrops.includes(crop.toLowerCase())) {
  throw new Error('Invalid crop type');
}
```

### Error Handling
```typescript
try {
  const recommendation = await cropRotationService.getRotationRecommendation(fieldId);
  setRecommendation(recommendation);
} catch (error) {
  console.error('Error loading rotation recommendation:', error);
  toast({
    title: "Error",
    description: "Failed to load recommendations. Please try again.",
    variant: "destructive"
  });
}
```

## 📈 Monitoring & Analytics

### Track Key Metrics
```typescript
// Log recommendation views
blackBoxService.logUserInteraction('view', 'crop_rotation_recommendation', fieldId, {
  currentCrop: recommendation.currentCrop,
  recommendedCrop: recommendation.recommendedNextCrop,
  confidence: recommendation.confidence
});

// Log multi-season plan generation
blackBoxService.logUserInteraction('generate', 'multi_season_plan', fieldId, {
  years: 3,
  totalImprovement: plan.totalSoilImprovement,
  totalProfit: plan.totalProfitIncrease
});

// Log recommendation acceptance
blackBoxService.logUserInteraction('accept', 'crop_rotation_recommendation', fieldId, {
  recommendedCrop: recommendation.recommendedNextCrop
});
```

## 🔮 Future Enhancements

### Phase 2: Advanced Features
```typescript
// Climate adaptation
interface ClimateAdaptation {
  droughtResistant: boolean;
  floodTolerant: boolean;
  heatTolerant: boolean;
}

// Government schemes
interface SchemeAlignment {
  schemeName: string;
  subsidy: number;
  eligibility: boolean;
}

// Expert validation
interface ExpertValidation {
  expertId: string;
  validated: boolean;
  comments: string;
  confidence: number;
}
```

### Phase 3: Machine Learning
```typescript
// Learn from successful rotations
class RotationLearningService {
  async trackSuccess(fieldId: string, rotation: string, outcome: RotationOutcome) {
    // Store successful rotation patterns
  }
  
  async improveRecommendations(region: string) {
    // Use ML to improve regional recommendations
  }
}
```

## 📚 Dependencies

### Required
- React 18+
- TypeScript 4.9+
- React Router 6+
- Lucide React (icons)
- Tailwind CSS

### Optional
- Chart.js (for visualization)
- Date-fns (for date handling)
- Axios (for API calls)

## 🎯 API Endpoints (Future)

```typescript
// REST API design
GET    /api/rotation/recommendation/:fieldId
POST   /api/rotation/plan/:fieldId
GET    /api/rotation/history/:fieldId
POST   /api/rotation/feedback/:fieldId
GET    /api/rotation/market-prices/:crop
GET    /api/rotation/expert-validation/:fieldId
```

---

**Architecture designed for scalability, maintainability, and performance! 🏗️🚀**
