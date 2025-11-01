/**
 * Core TypeScript interfaces for AI-Predictive Marketplace
 */

// ============================================================================
// Field Analysis Types
// ============================================================================

export interface NPKDeficiency {
  level: number;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface NPKDeficiencies {
  nitrogen?: NPKDeficiency;
  phosphorus?: NPKDeficiency;
  potassium?: NPKDeficiency;
}

export interface DiseaseHistoryItem {
  disease_name: string;
  last_detected: string;
  recurrence_risk: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface WeatherRisk {
  type: 'drought' | 'heavy_rain' | 'heat_stress' | 'cold_stress';
  probability: number;
  days_until: number;
  confidence: number;
}

export interface GrowthStage {
  percentage: number;
  stage_name: string;
  days_to_harvest: number;
  confidence: number;
}

export interface FieldAnalysis {
  fieldId: string;
  fieldName: string;
  region: string;
  npkDeficiencies: NPKDeficiencies;
  diseaseHistory: DiseaseHistoryItem[];
  weatherRisks: WeatherRisk[];
  growthStage: GrowthStage;
  data_quality_score: number;
  analyzed_at: string;
}

// ============================================================================
// Product Recommendation Types
// ============================================================================

export type ProductCategory = 'fertilizer' | 'pesticide' | 'fungicide' | 'equipment' | 'seed_treatment';
export type RecommendationPriority = 'immediate' | 'preventive' | 'seasonal';

export interface ProductRecommendation {
  id: string;
  product_name: string;
  category: ProductCategory;
  priority: RecommendationPriority;
  urgency_score: number;
  confidence: number;
  reason: string;
  detailed_explanation: string;
  timing_guidance: string;
  application_instructions: string;
  expected_benefit: string;
  amazon_link: string;
  price: number;
  package_size: string;
  image_url: string;
  eco_friendly: boolean;
  local_manufacturer: boolean;
  regional_available: boolean;
  fields_needing: string[];
  feedback_score?: number;
}

// ============================================================================
// Product Catalog Types
// ============================================================================

export interface ProductName {
  en: string;
  hi: string;
  bn: string;
  mr?: string;
  ta?: string;
  te?: string;
  pa?: string;
  ha?: string;
}

export interface ProductConditions {
  npk_deficiency?: 'nitrogen' | 'phosphorus' | 'potassium';
  disease_type?: string[];
  weather_condition?: string[];
  growth_stage?: string[];
}

export interface ProductCatalogEntry {
  product_id: string;
  product_name: ProductName;
  category: ProductCategory;
  subcategory: string;
  addresses_conditions: ProductConditions;
  amazon_asin: string;
  amazon_affiliate_tag: string;
  amazon_link?: string; // Manual Amazon link
  base_price: number;
  package_sizes: string[];
  manufacturer: string;
  is_local: boolean;
  is_eco_friendly: boolean;
  sustainability_rating: number;
  image_url: string;
  application_rate: string;
  safety_precautions: string[];
  effectiveness_rating: number;
  regional_availability: string[];
}

// ============================================================================
// Shopping Cart Types
// ============================================================================

export interface CartItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url: string;
  amazon_link: string;
  package_size: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// ============================================================================
// User Role Types
// ============================================================================

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

// ============================================================================
// Rule DSL Types
// ============================================================================

export interface RuleConditions {
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
  regions?: string[];
}

export interface ProductMapping {
  product_id: string;
  priority: RecommendationPriority;
  urgency_base_score: number;
  confidence_multiplier: number;
  reason_template: string;
}

export interface ProductMappingRule {
  rule_id: string;
  rule_name: string;
  enabled: boolean;
  conditions: RuleConditions;
  product_mapping: ProductMapping;
}

// ============================================================================
// Regional Intelligence Types
// ============================================================================

export interface RegionalIntelligence {
  state_code: string;
  state_name: string;
  banned_products: string[];
  monsoon_months: number[];
  primary_crops: string[];
  soil_type_distribution: { [soilType: string]: number };
  common_diseases: string[];
  preferred_suppliers: string[];
}

// ============================================================================
// Feedback Learning Types
// ============================================================================

export type FeedbackAction = 'purchased' | 'ignored' | 'dismissed' | 'viewed_details';

export interface UserFeedback {
  feedback_id: string;
  recommendation_id: string;
  product_id: string;
  field_id: string;
  action: FeedbackAction;
  timestamp: string;
  context: {
    urgency_score: number;
    confidence: number;
    priority: RecommendationPriority;
    reason: string;
  };
}

export interface FeedbackMetrics {
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

// ============================================================================
// Cache Types
// ============================================================================

export interface CachedFieldAnalysis {
  fieldId: string;
  analysis: FieldAnalysis;
  cached_at: string;
  expires_at: string;
  data_sources_version: {
    blackbox: string;
    disease: string;
    weather: string;
    yield: string;
  };
}

export interface RecommendationCache {
  field_id: string;
  generated_at: string;
  expires_at: string;
  recommendations: ProductRecommendation[];
}

// ============================================================================
// Offline Mode Types
// ============================================================================

export interface OfflineCache {
  recommendations: ProductRecommendation[];
  product_images: { [productId: string]: string };
  voice_summaries: { [recommendationId: string]: Blob };
  last_synced: string;
  cache_version: string;
}

// ============================================================================
// Storage Extension Types
// ============================================================================

export interface MarketplaceFieldData {
  last_analyzed: string;
  npk_status: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  disease_outbreaks: any[];
  weather_risks: WeatherRisk[];
  growth_stage: GrowthStage;
  active_recommendations: string[];
}

export interface PurchaseHistory {
  product_id: string;
  purchased_at: string;
  amazon_order_id?: string;
}

export interface ExtendedFieldData {
  id: string;
  name: string;
  coordinates: [number, number][];
  crop_type: string;
  planting_date: string;
  marketplace_analysis?: MarketplaceFieldData;
  purchase_history?: PurchaseHistory[];
}
