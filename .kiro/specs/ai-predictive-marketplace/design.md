# Design Document: AI-Predictive Marketplace

## Overview

The AI-Predictive Marketplace transforms the placeholder marketplace into an intelligent shopping platform that analyzes farm data from BlackBoxService, DiseaseDetectionService, WeatherService, and YieldPredictionService to provide personalized, proactive product recommendations. The system maps soil deficiencies, disease patterns, weather conditions, and crop growth stages to specific agricultural products available through Amazon India affiliate links.

### Key Design Principles

1. **Data-Driven Intelligence**: Every recommendation is backed by actual farm data, not generic suggestions
2. **Proactive Recommendations**: Predict needs before problems occur based on patterns and growth stages
3. **Seamless Integration**: Leverage existing services without disrupting current functionality
4. **Mobile-First Experience**: Optimized for farmers using mobile devices in the field
5. **Transparent Reasoning**: Always explain why a product is recommended
6. **Localized for India**: Products, pricing, and recommendations tailored for Indian agriculture

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Marketplace View (UI)                     │
│  - Recommendation Cards  - Field Selector  - Categories      │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│               Context Cache Layer (NEW)                      │
│  - Last 3-5 field analyses  - 24hr TTL  - 40-60% speedup    │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│            MarketIntelligenceService (Core)                  │
│  - Data Analysis  - Recommendation Engine  - Priority Logic  │
│  - Confidence Weighting  - Feedback Learning                 │
└─┬──────────┬──────────┬──────────┬──────────┬──────────────┘
  │          │          │          │          │
  ▼          ▼          ▼          ▼          �▼
┌───────┐ ┌──────┐ ┌────────┐ ┌────────┐ ┌──────────────┐ ┌──────────┐
│BlackBox│ │Disease│ │Weather │ │Yield   │ │Product       │ │Rule DSL  │
│Service │ │Service│ │Service │ │Service │ │Catalog DB    │ │(JSON)    │
└────────┘ └───────┘ └────────┘ └────────┘ └──────────────┘ └──────────┘
                                                   │
                                                   ▼
                                          ┌────────────────┐
                                          │Amazon Affiliate│
                                          │Integration     │
                                          └────────────────┘
```

### Data Flow

1. **User Opens Marketplace** → MarketIntelligenceService fetches all field data
2. **Data Analysis** → Service analyzes NPK, diseases, weather, growth stages
3. **Recommendation Generation** → Maps deficiencies to products with priorities
4. **UI Rendering** → Displays personalized cards with explanations
5. **User Action** → Clicks buy → Opens Amazon affiliate link

## Components and Interfaces

### 1. Context Cache Layer (NEW)

**Purpose**: Cache recent field analyses to avoid redundant service queries, improving response time by 40-60%

**Interface**:
```typescript
interface CachedFieldAnalysis {
  fieldId: string;
  analysis: FieldAnalysis;
  cached_at: string;
  expires_at: string; // 24 hour TTL
  data_sources_version: {
    blackbox: string;
    disease: string;
    weather: string;
    yield: string;
  };
}

class ContextCacheService {
  private cache: Map<string, CachedFieldAnalysis> = new Map();
  private maxCacheSize = 5; // Last 3-5 fields
  
  get(fieldId: string): CachedFieldAnalysis | null;
  set(fieldId: string, analysis: FieldAnalysis): void;
  invalidate(fieldId: string): void;
  invalidateAll(): void;
  isValid(cached: CachedFieldAnalysis): boolean;
  prune(): void; // Remove oldest entries when cache exceeds maxCacheSize
}
```

### 2. MarketIntelligenceService

**Purpose**: Core service that analyzes farm data and generates product recommendations with confidence weighting

**Interface**:
```typescript
interface FieldAnalysis {
  fieldId: string;
  fieldName: string;
  region: string; // State code for regional intelligence
  npkDeficiencies: {
    nitrogen?: { level: number; severity: 'low' | 'medium' | 'high'; confidence: number };
    phosphorus?: { level: number; severity: 'low' | 'medium' | 'high'; confidence: number };
    potassium?: { level: number; severity: 'low' | 'medium' | 'high'; confidence: number };
  };
  diseaseHistory: {
    disease_name: string;
    last_detected: string;
    recurrence_risk: 'low' | 'medium' | 'high';
    confidence: number;
  }[];
  weatherRisks: {
    type: 'drought' | 'heavy_rain' | 'heat_stress' | 'cold_stress';
    probability: number;
    days_until: number;
    confidence: number;
  }[];
  growthStage: {
    percentage: number;
    stage_name: string;
    days_to_harvest: number;
    confidence: number;
  };
  data_quality_score: number; // Overall confidence in analysis (0-1)
}

interface ProductRecommendation {
  id: string;
  product_name: string;
  category: 'fertilizer' | 'pesticide' | 'fungicide' | 'equipment' | 'seed_treatment';
  priority: 'immediate' | 'preventive' | 'seasonal';
  urgency_score: number; // 0-100
  confidence: number; // 0-1, NEW: confidence in this recommendation
  reason: string; // Max 80 chars for lightweight explainability
  detailed_explanation: string; // Full explanation in collapsible section
  timing_guidance: string;
  application_instructions: string;
  expected_benefit: string;
  amazon_link: string;
  price: number;
  package_size: string;
  image_url: string;
  eco_friendly: boolean;
  local_manufacturer: boolean;
  regional_available: boolean; // NEW: Available in user's region
  fields_needing: string[]; // Field IDs that need this product
  feedback_score?: number; // NEW: Learning from user feedback
}

class MarketIntelligenceService {
  private cacheService: ContextCacheService;
  private ruleDSL: ProductMappingRules;
  
  analyzeField(fieldId: string): Promise<FieldAnalysis>;
  analyzeAllFields(): Promise<FieldAnalysis[]>;
  generateRecommendations(analysis: FieldAnalysis): ProductRecommendation[];
  prioritizeRecommendations(recommendations: ProductRecommendation[]): ProductRecommendation[];
  getRecommendationsByCategory(category: string): ProductRecommendation[];
  getRecommendationsByPriority(priority: string): ProductRecommendation[];
  
  // NEW: Feedback learning methods
  recordUserFeedback(recommendationId: string, action: 'purchased' | 'ignored' | 'dismissed', fieldId: string): void;
  adjustConfidenceScores(): void;
  
  // NEW: Regional intelligence
  filterByRegion(recommendations: ProductRecommendation[], region: string): ProductRecommendation[];
  checkProductAvailability(productId: string, region: string): boolean;
}
```

**Key Methods**:

- `analyzeField()`: Fetches and analyzes all data sources for a single field
- `analyzeAllFields()`: Aggregates analysis across all user fields
- `generateRecommendations()`: Maps analysis results to product recommendations
- `prioritizeRecommendations()`: Sorts by urgency score and priority level

### 3. Lightweight Rule DSL (NEW)

**Purpose**: JSON/YAML-based product mapping rules that non-developers can update without code changes

**Rule Structure**:
```typescript
interface ProductMappingRule {
  rule_id: string;
  rule_name: string;
  enabled: boolean;
  conditions: {
    npk_deficiency?: {
      nutrient: 'nitrogen' | 'phosphorus' | 'potassium';
      min_severity: 'low' | 'medium' | 'high';
      min_level?: number;
      max_level?: number;
    };
    disease_type?: string[];
    weather_condition?: string[];
    growth_stage_range?: { min: number; max: number };
    crop_types?: string[];
    regions?: string[]; // State codes
  };
  product_mapping: {
    product_id: string;
    priority: 'immediate' | 'preventive' | 'seasonal';
    urgency_base_score: number;
    confidence_multiplier: number;
    reason_template: string; // e.g., "N level at {level}% ({severity} deficiency)"
  };
}

// Example rules.json
const PRODUCT_MAPPING_RULES: ProductMappingRule[] = [
  {
    rule_id: "npk_nitrogen_high",
    rule_name: "High Nitrogen Deficiency → Urea",
    enabled: true,
    conditions: {
      npk_deficiency: {
        nutrient: "nitrogen",
        min_severity: "high",
        max_level: 50
      }
    },
    product_mapping: {
      product_id: "fert_urea_001",
      priority: "immediate",
      urgency_base_score: 95,
      confidence_multiplier: 1.0,
      reason_template: "N at {level}% (high deficiency)"
    }
  },
  {
    rule_id: "disease_blast_recent",
    rule_name: "Recent Rice Blast → Propiconazole",
    enabled: true,
    conditions: {
      disease_type: ["Rice Blast", "Blast"],
      crop_types: ["rice"]
    },
    product_mapping: {
      product_id: "fung_propi_001",
      priority: "immediate",
      urgency_base_score: 90,
      confidence_multiplier: 0.95,
      reason_template: "Blast detected {days} days ago"
    }
  }
];

class RuleDSLEngine {
  private rules: ProductMappingRule[];
  
  loadRules(rulesJson: string): void;
  evaluateRules(analysis: FieldAnalysis): ProductRecommendation[];
  updateRule(ruleId: string, updates: Partial<ProductMappingRule>): void;
  addRule(rule: ProductMappingRule): void;
  disableRule(ruleId: string): void;
}
```

### 4. Product Catalog Database

**Purpose**: Stores product information and Amazon affiliate links

**Data Structure**:
```typescript
interface ProductCatalogEntry {
  product_id: string;
  product_name: {
    en: string;
    hi: string;
    bn: string;
    // ... other languages
  };
  category: string;
  subcategory: string;
  addresses_conditions: {
    npk_deficiency?: 'nitrogen' | 'phosphorus' | 'potassium';
    disease_type?: string[];
    weather_condition?: string[];
    growth_stage?: string[];
  };
  amazon_asin: string;
  amazon_affiliate_tag: string;
  base_price: number;
  package_sizes: string[];
  manufacturer: string;
  is_local: boolean;
  is_eco_friendly: boolean;
  sustainability_rating: number; // 1-5
  image_url: string;
  application_rate: string;
  safety_precautions: string[];
  effectiveness_rating: number; // 1-5
  regional_availability: string[]; // State codes
}

// Example entries
const PRODUCT_CATALOG: ProductCatalogEntry[] = [
  {
    product_id: 'fert_urea_001',
    product_name: { en: 'Urea 46-0-0 Fertilizer', hi: 'यूरिया 46-0-0 उर्वरक' },
    category: 'fertilizer',
    subcategory: 'nitrogen',
    addresses_conditions: { npk_deficiency: 'nitrogen' },
    amazon_asin: 'B08XYZ1234',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 1250,
    package_sizes: ['50kg'],
    manufacturer: 'IFFCO',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: 'https://...',
    application_rate: '100-150 kg/hectare',
    safety_precautions: ['Wear gloves', 'Avoid inhalation'],
    effectiveness_rating: 4.5,
    regional_availability: ['DL', 'UP', 'HR', 'PB']
  },
  // ... more products
];
```

### 5. Feedback Learning System (NEW)

**Purpose**: Capture user interactions (purchases, ignores, dismissals) to improve recommendation relevance

**Interface**:
```typescript
interface UserFeedback {
  feedback_id: string;
  recommendation_id: string;
  product_id: string;
  field_id: string;
  action: 'purchased' | 'ignored' | 'dismissed' | 'viewed_details';
  timestamp: string;
  context: {
    urgency_score: number;
    confidence: number;
    priority: string;
    reason: string;
  };
}

interface FeedbackMetrics {
  product_id: string;
  total_recommendations: number;
  purchases: number;
  ignores: number;
  dismissals: number;
  conversion_rate: number;
  ignore_rate: number;
  avg_confidence_when_purchased: number;
  avg_confidence_when_ignored: number;
}

class FeedbackLearningService {
  recordFeedback(feedback: UserFeedback): void;
  getProductMetrics(productId: string): FeedbackMetrics;
  adjustProductConfidence(productId: string): number; // Returns new confidence multiplier
  identifyLowPerformingProducts(): string[]; // Products with high ignore rates
  identifyHighPerformingProducts(): string[]; // Products with high conversion rates
  
  // Analyze patterns
  analyzeIgnorePatterns(): {
    common_reasons: string[];
    low_confidence_threshold: number;
    timing_issues: boolean;
  };
}
```

### 6. Offline Mode Support (NEW)

**Purpose**: Cache product cards and voice summaries for low-network users

**Interface**:
```typescript
interface OfflineCache {
  recommendations: ProductRecommendation[];
  product_images: { [productId: string]: string }; // Base64 encoded
  voice_summaries: { [recommendationId: string]: Blob }; // Pre-generated audio
  last_synced: string;
  cache_version: string;
}

class OfflineService {
  cacheRecommendations(recommendations: ProductRecommendation[]): Promise<void>;
  cacheProductImages(productIds: string[]): Promise<void>;
  cacheVoiceSummaries(recommendations: ProductRecommendation[]): Promise<void>;
  
  getOfflineRecommendations(): ProductRecommendation[];
  isOffline(): boolean;
  syncWhenOnline(): Promise<void>;
  
  // Storage management
  getOfflineCacheSize(): number;
  clearOfflineCache(): void;
}
```

### 7. Recommendation Engine Logic

**NPK Deficiency Mapping (with Confidence Weighting)**:
```typescript
function mapNPKToProducts(npkData: NPKDeficiencies, region: string): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];
  
  // Nitrogen deficiency
  if (npkData.nitrogen && npkData.nitrogen.level < 60) {
    const severity = npkData.nitrogen.severity;
    const urgency = severity === 'high' ? 95 : severity === 'medium' ? 70 : 50;
    const confidence = npkData.nitrogen.confidence; // From data source
    
    // Apply feedback learning adjustment
    const feedbackMultiplier = feedbackLearningService.adjustProductConfidence('fert_urea_001');
    const finalConfidence = confidence * feedbackMultiplier;
    
    // Check regional availability
    const regionalAvailable = checkProductAvailability('fert_urea_001', region);
    
    recommendations.push({
      product_name: 'Urea 46-0-0 Fertilizer',
      priority: severity === 'high' ? 'immediate' : 'preventive',
      urgency_score: urgency,
      confidence: finalConfidence,
      reason: `N at ${npkData.nitrogen.level}% (${severity})`, // Max 80 chars
      detailed_explanation: 'Nitrogen is essential for leaf growth and chlorophyll production. Your soil analysis shows deficiency that may reduce crop yield by 20-30%.',
      timing_guidance: severity === 'high' ? 'Apply within 1 week' : 'Apply within 2-3 weeks',
      expected_benefit: 'Restore healthy green color, improve vegetative growth, increase yield potential by 15-25%',
      regional_available: regionalAvailable,
      // ... other fields
    });
  }
  
  // Similar logic for Phosphorus and Potassium
  
  return recommendations;
}
```

**Disease History Mapping**:
```typescript
function mapDiseaseToProducts(diseaseHistory: DiseaseRecord[]): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];
  
  diseaseHistory.forEach(disease => {
    const daysSinceDetection = calculateDaysSince(disease.detected_at);
    
    // Recommend treatment if recent
    if (daysSinceDetection < 30) {
      if (disease.disease_name.includes('Blast')) {
        recommendations.push({
          product_name: 'Propiconazole 25% EC Fungicide',
          priority: 'immediate',
          urgency_score: 90,
          reason: `Rice Blast detected ${daysSinceDetection} days ago`,
          detailed_explanation: 'Systemic fungicide effective against blast disease. Acts by inhibiting fungal growth.',
          timing_guidance: 'Apply immediately, repeat after 10 days if symptoms persist',
          // ... other fields
        });
      }
    }
    
    // Recommend preventive if history of recurrence
    if (disease.recurrence_risk === 'high') {
      recommendations.push({
        product_name: 'Copper Oxychloride 50% WP',
        priority: 'preventive',
        urgency_score: 60,
        reason: `High risk of ${disease.disease_name} recurrence based on history`,
        // ... other fields
      });
    }
  });
  
  return recommendations;
}
```

**Weather-Based Mapping**:
```typescript
function mapWeatherToProducts(weatherRisks: WeatherRisk[]): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];
  
  weatherRisks.forEach(risk => {
    if (risk.type === 'heavy_rain' && risk.days_until < 7) {
      recommendations.push({
        product_name: 'Mancozeb 75% WP Fungicide',
        priority: 'preventive',
        urgency_score: 75,
        reason: `Heavy rainfall predicted in ${risk.days_until} days (${risk.probability}% probability)`,
        detailed_explanation: 'Rainfall creates humid conditions favorable for fungal diseases. Preventive application protects crops.',
        timing_guidance: 'Apply 1-2 days before expected rainfall',
        // ... other fields
      });
    }
    
    if (risk.type === 'drought' && risk.days_until < 14) {
      recommendations.push({
        product_name: 'Drip Irrigation Kit',
        priority: 'immediate',
        urgency_score: 85,
        reason: `Drought conditions expected in ${risk.days_until} days`,
        // ... other fields
      });
    }
  });
  
  return recommendations;
}
```

**Growth Stage Mapping**:
```typescript
function mapGrowthStageToProducts(growthStage: GrowthStage, cropType: string): ProductRecommendation[] {
  const recommendations: ProductRecommendation[] = [];
  
  if (cropType === 'rice') {
    // Flowering stage (60-75%)
    if (growthStage.percentage >= 60 && growthStage.percentage <= 75) {
      recommendations.push({
        product_name: 'Potash (MOP) 0-0-60',
        priority: 'immediate',
        urgency_score: 80,
        reason: 'Rice entering reproductive stage - critical potassium requirement',
        detailed_explanation: 'Potassium is essential during flowering for grain filling and disease resistance.',
        timing_guidance: 'Apply now during panicle initiation stage',
        // ... other fields
      });
    }
    
    // Pre-harvest (85-95%)
    if (growthStage.percentage >= 85 && growthStage.percentage <= 95) {
      recommendations.push({
        product_name: 'Harvest Tarpaulin (20x20 ft)',
        priority: 'seasonal',
        urgency_score: 50,
        reason: `Harvest expected in ${growthStage.days_to_harvest} days`,
        // ... other fields
      });
    }
  }
  
  return recommendations;
}
```

### 8. Regional Intelligence (NEW)

**Purpose**: Filter products based on regional availability, banned substances, and monsoon timing

**Interface**:
```typescript
interface RegionalIntelligence {
  state_code: string;
  state_name: string;
  banned_products: string[]; // Product IDs banned in this region
  monsoon_months: number[]; // Months when monsoon is active
  primary_crops: string[];
  soil_type_distribution: { [soilType: string]: number };
  common_diseases: string[];
  preferred_suppliers: string[];
}

const REGIONAL_DATA: { [stateCode: string]: RegionalIntelligence } = {
  'PB': {
    state_code: 'PB',
    state_name: 'Punjab',
    banned_products: [], // Punjab-specific bans
    monsoon_months: [7, 8, 9], // July-September
    primary_crops: ['rice', 'wheat'],
    soil_type_distribution: { 'alluvial': 0.8, 'sandy_loam': 0.2 },
    common_diseases: ['Rice Blast', 'Brown Spot'],
    preferred_suppliers: ['IFFCO', 'Punjab Agro']
  },
  // ... other states
};

class RegionalIntelligenceService {
  getRegionalData(stateCode: string): RegionalIntelligence;
  isProductBanned(productId: string, stateCode: string): boolean;
  adjustMonsoonTiming(recommendations: ProductRecommendation[], stateCode: string): ProductRecommendation[];
  filterByRegionalAvailability(products: ProductRecommendation[], stateCode: string): ProductRecommendation[];
}
```

### 9. Amazon Affiliate Integration

**Purpose**: Generate trackable affiliate links and handle purchases

**Interface**:
```typescript
class AmazonAffiliateService {
  private affiliateTag = 'plantsaathi-21';
  
  generateAffiliateLink(asin: string, productName: string): string {
    // Generate Amazon India affiliate link
    return `https://www.amazon.in/dp/${asin}?tag=${this.affiliateTag}&linkCode=ogi&th=1&psc=1`;
  }
  
  trackClick(productId: string, fieldId: string, recommendationContext: any): void {
    // Log click to BlackBoxService for analytics
    blackBoxService.logUserInteraction('button_click', 'marketplace_product_click', fieldId, {
      product_id: productId,
      recommendation_context: recommendationContext,
      timestamp: new Date().toISOString()
    });
  }
  
  openProductPage(affiliateLink: string): void {
    // Open in new tab/window
    window.open(affiliateLink, '_blank', 'noopener,noreferrer');
  }
}
```

### 10. Marketplace View Component

**Purpose**: User interface for displaying recommendations

**Component Structure**:
```typescript
interface MarketplaceViewProps {
  selectedFieldId?: string;
  filterCategory?: string;
  filterPriority?: string;
}

const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  selectedFieldId,
  filterCategory,
  filterPriority
}) => {
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string | 'all'>('all');
  
  // Fetch recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, [selectedField]);
  
  return (
    <div className="marketplace-container">
      {/* Header with field selector */}
      <MarketplaceHeader 
        selectedField={selectedField}
        onFieldChange={setSelectedField}
      />
      
      {/* Priority sections */}
      <RecommendationSection 
        title="🚨 Immediate Needs"
        recommendations={recommendations.filter(r => r.priority === 'immediate')}
        urgencyIndicator="high"
      />
      
      <RecommendationSection 
        title="🛡️ Preventive Measures"
        recommendations={recommendations.filter(r => r.priority === 'preventive')}
        urgencyIndicator="medium"
      />
      
      <RecommendationSection 
        title="📅 Seasonal Planning"
        recommendations={recommendations.filter(r => r.priority === 'seasonal')}
        urgencyIndicator="low"
      />
    </div>
  );
};
```

**Recommendation Card Component**:
```typescript
const RecommendationCard: React.FC<{ recommendation: ProductRecommendation }> = ({ 
  recommendation 
}) => {
  const { t } = useLanguage();
  
  return (
    <Card className="recommendation-card">
      {/* Product image */}
      <img src={recommendation.image_url} alt={recommendation.product_name} />
      
      {/* Badges */}
      <div className="badges">
        {recommendation.eco_friendly && <Badge>🌱 Eco-Friendly</Badge>}
        {recommendation.local_manufacturer && <Badge>🇮🇳 Made in India</Badge>}
      </div>
      
      {/* Product name */}
      <h3>{recommendation.product_name}</h3>
      
      {/* Reason (why recommended) - Max 80 chars */}
      <div className="reason-box">
        <AlertCircle className="icon" />
        <p><strong>Why:</strong> {recommendation.reason}</p>
        {/* Confidence indicator */}
        <Badge variant={recommendation.confidence > 0.8 ? 'success' : 'warning'}>
          {Math.round(recommendation.confidence * 100)}% confidence
        </Badge>
      </div>
      
      {/* Timing */}
      <div className="timing">
        <Clock className="icon" />
        <p><strong>When:</strong> {recommendation.timing_guidance}</p>
      </div>
      
      {/* Expected benefit */}
      <div className="benefit">
        <TrendingUp className="icon" />
        <p><strong>Benefit:</strong> {recommendation.expected_benefit}</p>
      </div>
      
      {/* Price and buy button */}
      <div className="footer">
        <div className="price">
          <span className="currency">₹</span>
          <span className="amount">{recommendation.price.toLocaleString('en-IN')}</span>
          <span className="package">({recommendation.package_size})</span>
        </div>
        
        <Button 
          onClick={() => handleBuyClick(recommendation)}
          className="buy-button"
        >
          <ShoppingCart className="icon" />
          {t('marketplace.buy_now')}
        </Button>
      </div>
      
      {/* Expandable details */}
      <Collapsible>
        <CollapsibleTrigger>View Details</CollapsibleTrigger>
        <CollapsibleContent>
          <p>{recommendation.detailed_explanation}</p>
          <p><strong>Application:</strong> {recommendation.application_instructions}</p>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
```

## Data Models

### Field Data Storage

Extend existing field data structure in localStorage:
```typescript
interface FieldData {
  // Existing fields
  id: string;
  name: string;
  coordinates: [number, number][];
  crop_type: string;
  planting_date: string;
  
  // New marketplace-related fields
  marketplace_analysis?: {
    last_analyzed: string;
    npk_status: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    disease_outbreaks: DiseaseOutbreakRecord[];
    weather_risks: WeatherRisk[];
    growth_stage: GrowthStage;
    active_recommendations: string[]; // Product IDs
  };
  
  purchase_history?: {
    product_id: string;
    purchased_at: string;
    amazon_order_id?: string;
  }[];
}
```

### Recommendation Cache

Store recommendations in localStorage to avoid re-computation:
```typescript
interface RecommendationCache {
  field_id: string;
  generated_at: string;
  expires_at: string; // Refresh every 24 hours
  recommendations: ProductRecommendation[];
}
```

## Error Handling

### API Failures
- **BlackBoxService unavailable**: Use cached data if available, show warning
- **Weather API fails**: Skip weather-based recommendations, continue with others
- **Amazon link broken**: Log error, show alternative products

### Data Quality Issues
- **Missing NPK data**: Skip fertilizer recommendations, focus on other categories
- **No disease history**: Only show preventive products based on regional patterns
- **Invalid growth stage**: Use planting date to estimate stage

### User Experience
- **No recommendations**: Show educational content about maintaining field data
- **Slow loading**: Show skeleton loaders, load recommendations progressively
- **Network offline**: Show cached recommendations with "offline" indicator

## Testing Strategy

### Unit Tests
1. **MarketIntelligenceService**
   - Test NPK deficiency detection and severity classification
   - Test disease history analysis and recurrence risk calculation
   - Test weather risk assessment and timing calculations
   - Test growth stage determination from planting date

2. **Recommendation Engine**
   - Test product mapping for each condition type
   - Test priority and urgency score calculation
   - Test recommendation deduplication
   - Test multi-field aggregation

3. **Product Catalog**
   - Test product search by condition
   - Test multi-language product names
   - Test regional availability filtering

### Integration Tests
1. **Data Flow**
   - Test end-to-end flow from field data to recommendations
   - Test integration with BlackBoxService
   - Test integration with DiseaseDetectionService
   - Test integration with WeatherService

2. **UI Components**
   - Test recommendation card rendering
   - Test field selector functionality
   - Test category filtering
   - Test buy button and affiliate link generation

### User Acceptance Testing
1. **Farmer Scenarios**
   - Farmer with nitrogen deficiency sees urea recommendation
   - Farmer with disease history sees preventive fungicide
   - Farmer approaching harvest sees seasonal equipment
   - Farmer with multiple fields sees aggregated recommendations

2. **Edge Cases**
   - New user with no field data
   - Field with perfect conditions (no recommendations)
   - Field with multiple urgent issues (prioritization)
   - Offline usage with cached data

## Performance Considerations

### Optimization Strategies
1. **Context Cache Layer**: Cache last 3-5 field analyses (40-60% speedup)
2. **Lazy Loading**: Load recommendations progressively by priority
3. **Caching**: Cache recommendations for 24 hours, refresh on field data update
4. **Debouncing**: Debounce field selector changes to avoid excessive re-computation
5. **Image Optimization**: Use compressed product images, lazy load below fold
6. **Bundle Splitting**: Code-split marketplace components for faster initial load
7. **Async Service Calls**: Parallelize calls to BlackBox, Disease, Weather, Yield services
8. **Offline Mode**: Pre-cache product cards and voice summaries for low-network scenarios

### Performance Targets
- Initial load: < 2 seconds (< 1 second with cache hit)
- Recommendation generation: < 500ms (< 200ms with cache)
- Field switching: < 300ms (< 100ms with cache)
- Buy button click to Amazon page: < 200ms

### Scalability Testing
- **Load Test**: Simulate 10,000+ simultaneous field recommendation calls
- **Target**: Linear scaling with async service calls
- **Bottleneck Monitoring**: Track MarketIntelligenceService response times
- **Cache Hit Rate**: Target 70%+ cache hit rate for returning users

## Security and Privacy

### Data Protection
- **No PII in recommendations**: Product recommendations don't expose personal information
- **Secure affiliate links**: Use HTTPS for all Amazon links
- **Local storage encryption**: Consider encrypting sensitive field data
- **Analytics anonymization**: Aggregate purchase patterns without user identification

### Compliance
- **Amazon Affiliate TOS**: Comply with disclosure requirements
- **Indian data laws**: Ensure compliance with IT Act and data protection regulations
- **User consent**: Obtain consent for data usage in recommendations

## Localization

### Multi-Language Support
- Integrate with existing i18n system (English, Hindi, Bengali, Marathi, Tamil, Telugu, Punjabi, Hausa)
- Translate product names, descriptions, and recommendations
- Localize currency formatting (₹ symbol, Indian number system)
- Adapt agricultural terminology for regional dialects

### Voice Integration
- Integrate with existing audioService for voice-guided shopping
- Voice commands: "Show fertilizer recommendations", "Buy this product"
- Read product details aloud in selected language
- Voice confirmation before opening Amazon link

## Monetization and Analytics

### Revenue Tracking
- Track affiliate link clicks in BlackBoxService
- Monitor conversion rates by product category
- Analyze recommendation acceptance rates
- Calculate revenue per user and per field

### Analytics Dashboard (Future)
- Most recommended products
- Highest conversion products
- Regional purchasing patterns
- Seasonal demand trends
- User engagement metrics

## Future Enhancements

### Phase 2 Features
1. **Price Comparison**: Show multiple vendors for same product
2. **Bulk Ordering**: Group orders for multiple fields
3. **FPO Integration**: Direct purchasing from Farmer Producer Organizations
4. **Subscription Model**: Auto-deliver recurring products (fertilizers)
5. **Community Reviews**: Farmer ratings and reviews for products

### Phase 3 Features
1. **AI Chat Integration**: "Krishi Voice, what fertilizer do I need?"
2. **Predictive Ordering**: Auto-suggest orders based on crop calendar
3. **Carbon Footprint**: Show environmental impact of product choices
4. **Government Subsidy Integration**: Apply subsidies automatically at checkout
5. **Inventory Management**: Track purchased products and usage

## Migration Plan

### Phase 1: Foundation (Current Spec)
- Replace placeholder Marketplace.tsx with intelligent version
- Implement MarketIntelligenceService
- Create Product Catalog database
- Build basic recommendation engine
- Integrate Amazon affiliate links

### Phase 2: Enhancement
- Add voice integration
- Implement advanced analytics
- Add seasonal forecasting
- Optimize performance

### Phase 3: Scale
- Add more product categories
- Integrate with payment gateways
- Build admin dashboard
- Launch B2B partnerships

## Success Metrics

### Key Performance Indicators
1. **Recommendation Accuracy**: % of recommendations that lead to purchases
2. **User Engagement**: Time spent on marketplace, products viewed
3. **Conversion Rate**: % of users who click buy buttons
4. **Revenue**: Total affiliate commissions earned
5. **User Satisfaction**: Ratings and feedback on recommendations
6. **Impact**: Measured improvement in crop yields for users who follow recommendations

### Target Goals (6 months)
- 40% of active users visit marketplace monthly
- 15% conversion rate on immediate priority recommendations
- ₹50,000+ monthly affiliate revenue
- 4.5+ star average rating on recommendation quality
- 20% measured yield improvement for engaged users
