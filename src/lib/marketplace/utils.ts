/**
 * Utility functions for marketplace data validation and transformation
 */

import type {
  FieldAnalysis,
  ProductRecommendation,
  NPKDeficiency,
  WeatherRisk,
  GrowthStage,
} from './types';

// ============================================================================
// Validation Functions
// ============================================================================

export function validateFieldAnalysis(analysis: any): analysis is FieldAnalysis {
  return (
    analysis &&
    typeof analysis.fieldId === 'string' &&
    typeof analysis.fieldName === 'string' &&
    typeof analysis.region === 'string' &&
    typeof analysis.data_quality_score === 'number'
  );
}

export function validateProductRecommendation(rec: any): rec is ProductRecommendation {
  return (
    rec &&
    typeof rec.id === 'string' &&
    typeof rec.product_name === 'string' &&
    typeof rec.category === 'string' &&
    typeof rec.priority === 'string' &&
    typeof rec.urgency_score === 'number' &&
    typeof rec.confidence === 'number'
  );
}

// ============================================================================
// NPK Analysis Functions
// ============================================================================

export function calculateNPKSeverity(level: number): 'low' | 'medium' | 'high' {
  if (level < 40) return 'high';
  if (level < 60) return 'medium';
  return 'low';
}

export function calculateNPKUrgency(severity: 'low' | 'medium' | 'high'): number {
  switch (severity) {
    case 'high':
      return 95;
    case 'medium':
      return 70;
    case 'low':
      return 50;
    default:
      return 50;
  }
}

export function getNPKDeficiencyDescription(
  nutrient: 'nitrogen' | 'phosphorus' | 'potassium',
  level: number,
  severity: 'low' | 'medium' | 'high'
): string {
  const nutrientNames = {
    nitrogen: 'Nitrogen (N)',
    phosphorus: 'Phosphorus (P)',
    potassium: 'Potassium (K)',
  };

  return `${nutrientNames[nutrient]} at ${level}% (${severity} deficiency)`;
}

// ============================================================================
// Date and Time Functions
// ============================================================================

export function calculateDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// Growth Stage Functions
// ============================================================================

export function estimateGrowthStageFromPlantingDate(
  plantingDate: string,
  cropType: string
): GrowthStage {
  const daysSincePlanting = calculateDaysSince(plantingDate);

  // Crop maturity days (approximate)
  const maturityDays: { [key: string]: number } = {
    rice: 120,
    wheat: 130,
    maize: 100,
    cotton: 150,
    soybean: 110,
    default: 120,
  };

  const totalDays = maturityDays[cropType.toLowerCase()] || maturityDays.default;
  const percentage = Math.min((daysSincePlanting / totalDays) * 100, 100);
  const daysToHarvest = Math.max(totalDays - daysSincePlanting, 0);

  let stageName = 'Vegetative';
  if (percentage >= 85) stageName = 'Maturity';
  else if (percentage >= 60) stageName = 'Reproductive';
  else if (percentage >= 30) stageName = 'Tillering/Branching';

  return {
    percentage: Math.round(percentage),
    stage_name: stageName,
    days_to_harvest: daysToHarvest,
    confidence: 0.7, // Lower confidence for estimated data
  };
}

// ============================================================================
// String Formatting Functions
// ============================================================================

export function truncateReason(reason: string, maxLength: number = 80): string {
  if (reason.length <= maxLength) return reason;
  return reason.substring(0, maxLength - 3) + '...';
}

export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num);
}

// ============================================================================
// Confidence Score Functions
// ============================================================================

export function calculateOverallConfidence(scores: number[]): number {
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc, score) => acc + score, 0);
  return sum / scores.length;
}

export function adjustConfidenceByDataQuality(
  baseConfidence: number,
  dataQualityScore: number
): number {
  return baseConfidence * dataQualityScore;
}

export function getConfidenceBadgeVariant(
  confidence: number
): 'success' | 'warning' | 'destructive' {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.6) return 'warning';
  return 'destructive';
}

// ============================================================================
// Priority and Urgency Functions
// ============================================================================

export function sortByUrgencyAndConfidence(
  recommendations: ProductRecommendation[]
): ProductRecommendation[] {
  return [...recommendations].sort((a, b) => {
    // First sort by priority
    const priorityOrder = { immediate: 0, preventive: 1, seasonal: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by urgency score
    const urgencyDiff = b.urgency_score - a.urgency_score;
    if (urgencyDiff !== 0) return urgencyDiff;

    // Finally by confidence
    return b.confidence - a.confidence;
  });
}

export function filterByPriority(
  recommendations: ProductRecommendation[],
  priority: 'immediate' | 'preventive' | 'seasonal'
): ProductRecommendation[] {
  return recommendations.filter((rec) => rec.priority === priority);
}

export function filterByCategory(
  recommendations: ProductRecommendation[],
  category: string
): ProductRecommendation[] {
  return recommendations.filter((rec) => rec.category === category);
}

// ============================================================================
// Deduplication Functions
// ============================================================================

export function deduplicateRecommendations(
  recommendations: ProductRecommendation[]
): ProductRecommendation[] {
  const seen = new Set<string>();
  return recommendations.filter((rec) => {
    if (seen.has(rec.product_name)) return false;
    seen.add(rec.product_name);
    return true;
  });
}

// ============================================================================
// Storage Functions
// ============================================================================

export function getFieldDataKey(fieldId: string): string {
  return `field_${fieldId}_data`;
}

export function getMarketplaceCacheKey(fieldId: string): string {
  return `marketplace_cache_${fieldId}`;
}

export function getFeedbackKey(recommendationId: string): string {
  return `feedback_${recommendationId}`;
}

// ============================================================================
// Error Handling Functions
// ============================================================================

export function createErrorRecommendation(
  errorMessage: string,
  fieldId: string
): ProductRecommendation {
  return {
    id: `error_${Date.now()}`,
    product_name: 'Error Loading Recommendation',
    category: 'equipment',
    priority: 'seasonal',
    urgency_score: 0,
    confidence: 0,
    reason: errorMessage,
    detailed_explanation: 'An error occurred while generating this recommendation.',
    timing_guidance: 'N/A',
    application_instructions: 'N/A',
    expected_benefit: 'N/A',
    amazon_link: '',
    price: 0,
    package_size: 'N/A',
    image_url: '',
    eco_friendly: false,
    local_manufacturer: false,
    regional_available: false,
    fields_needing: [fieldId],
  };
}

// ============================================================================
// Template String Functions
// ============================================================================

export function fillTemplate(template: string, values: { [key: string]: any }): string {
  let result = template;
  Object.keys(values).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    result = result.replace(regex, String(values[key]));
  });
  return result;
}

// ============================================================================
// Regional Functions
// ============================================================================

export function getStateCodeFromCoordinates(lat: number, lng: number): string {
  // Simplified mapping - in production, use proper geocoding
  // This is a rough approximation for major Indian states
  if (lat >= 30 && lat <= 32 && lng >= 74 && lng <= 76) return 'PB'; // Punjab
  if (lat >= 28 && lat <= 30 && lng >= 76 && lng <= 78) return 'HR'; // Haryana
  if (lat >= 26 && lat <= 30 && lng >= 78 && lng <= 84) return 'UP'; // Uttar Pradesh
  if (lat >= 18 && lat <= 22 && lng >= 72 && lng <= 80) return 'MH'; // Maharashtra
  if (lat >= 12 && lat <= 18 && lng >= 74 && lng <= 78) return 'KA'; // Karnataka
  if (lat >= 8 && lat <= 13 && lng >= 76 && lng <= 80) return 'TN'; // Tamil Nadu
  if (lat >= 22 && lat <= 27 && lng >= 85 && lng <= 89) return 'WB'; // West Bengal

  return 'IN'; // Default India
}

// ============================================================================
// Recommendation ID Generation
// ============================================================================

export function generateRecommendationId(
  fieldId: string,
  productId: string,
  timestamp: number = Date.now()
): string {
  return `rec_${fieldId}_${productId}_${timestamp}`;
}

export function generateFeedbackId(): string {
  return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
