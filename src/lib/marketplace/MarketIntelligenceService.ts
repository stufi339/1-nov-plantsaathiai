/**
 * MarketIntelligenceService - Core recommendation engine
 * Analyzes farm data and generates personalized product recommendations
 */

import type { FieldAnalysis, ProductRecommendation, NPKDeficiencies, DiseaseHistoryItem, WeatherRisk, GrowthStage } from './types';
import { blackBoxService } from '../blackBoxService';
import { diseaseDetectionService } from '../diseaseDetectionService';
import { weatherService } from '../weatherService';
import { yieldPredictionService } from '../yieldPredictionService';
import { contextCacheService } from './ContextCacheService';
import { ruleDSLEngine } from './RuleDSLEngine';
import { regionalIntelligenceService } from './RegionalIntelligenceService';
import {
  calculateNPKSeverity,
  estimateGrowthStageFromPlantingDate,
  getStateCodeFromCoordinates,
  sortByUrgencyAndConfidence,
  deduplicateRecommendations,
  calculateOverallConfidence,
} from './utils';

export class MarketIntelligenceService {
  /**
   * Analyze single field with caching
   */
  async analyzeField(fieldId: string): Promise<FieldAnalysis> {
    // Check cache first
    const cached = contextCacheService.get(fieldId);
    if (cached) {
      return cached.analysis;
    }

    // Fetch field data from localStorage
    const fieldDataKey = `field_${fieldId}_data`;
    const fieldDataStr = localStorage.getItem(fieldDataKey);

    if (!fieldDataStr) {
      throw new Error(`Field data not found for ${fieldId}`);
    }

    const fieldData = JSON.parse(fieldDataStr);

    // Analyze NPK deficiencies
    const npkDeficiencies = this.analyzeNPK(fieldData);

    // Analyze disease history
    const diseaseHistory = this.analyzeDiseaseHistory(fieldId);

    // Analyze weather risks
    const weatherRisks = await this.analyzeWeatherRisks(fieldData);

    // Analyze growth stage
    const growthStage = this.analyzeGrowthStage(fieldData);

    // Determine region
    const region = this.determineRegion(fieldData);

    // Calculate data quality score
    const dataQualityScore = this.calculateDataQuality(npkDeficiencies, diseaseHistory, weatherRisks, growthStage);

    const analysis: FieldAnalysis = {
      fieldId,
      fieldName: fieldData.name || fieldId,
      region,
      npkDeficiencies,
      diseaseHistory,
      weatherRisks,
      growthStage,
      data_quality_score: dataQualityScore,
      analyzed_at: new Date().toISOString(),
    };

    // Cache the analysis
    contextCacheService.set(fieldId, analysis);

    return analysis;
  }

  /**
   * Analyze all user fields
   */
  async analyzeAllFields(): Promise<FieldAnalysis[]> {
    const fieldIds = this.getAllFieldIds();
    const analyses: FieldAnalysis[] = [];

    for (const fieldId of fieldIds) {
      try {
        const analysis = await this.analyzeField(fieldId);
        analyses.push(analysis);
      } catch (error) {
        console.error(`Failed to analyze field ${fieldId}:`, error);
      }
    }

    return analyses;
  }

  /**
   * Generate recommendations for a field
   */
  generateRecommendations(analysis: FieldAnalysis): ProductRecommendation[] {
    // Use Rule DSL Engine to generate recommendations
    let recommendations = ruleDSLEngine.evaluateRules(analysis);

    // Filter by regional availability
    recommendations = regionalIntelligenceService.filterByRegionalAvailability(recommendations, analysis.region);

    // Adjust for monsoon timing
    recommendations = regionalIntelligenceService.adjustMonsoonTiming(recommendations, analysis.region);

    // Prioritize and sort
    recommendations = this.prioritizeRecommendations(recommendations);

    // Deduplicate
    recommendations = deduplicateRecommendations(recommendations);

    // Log to BlackBox
    blackBoxService.logUserInteraction('button_click', 'recommendations_generated', analysis.fieldId, {
      count: recommendations.length,
      field_name: analysis.fieldName,
    });

    return recommendations;
  }

  /**
   * Prioritize and sort recommendations
   */
  prioritizeRecommendations(recommendations: ProductRecommendation[]): ProductRecommendation[] {
    return sortByUrgencyAndConfidence(recommendations);
  }

  /**
   * Get recommendations by category
   */
  getRecommendationsByCategory(recommendations: ProductRecommendation[], category: string): ProductRecommendation[] {
    return recommendations.filter((rec) => rec.category === category);
  }

  /**
   * Get recommendations by priority
   */
  getRecommendationsByPriority(recommendations: ProductRecommendation[], priority: string): ProductRecommendation[] {
    return recommendations.filter((rec) => rec.priority === priority);
  }

  // ============================================================================
  // Private Analysis Methods
  // ============================================================================

  /**
   * Analyze NPK deficiencies from field data
   */
  private analyzeNPK(fieldData: any): NPKDeficiencies {
    const deficiencies: NPKDeficiencies = {};

    // Check if marketplace_analysis exists
    if (fieldData.marketplace_analysis?.npk_status) {
      const npk = fieldData.marketplace_analysis.npk_status;

      if (npk.nitrogen !== undefined) {
        deficiencies.nitrogen = {
          level: npk.nitrogen,
          severity: calculateNPKSeverity(npk.nitrogen),
          confidence: 0.85,
        };
      }

      if (npk.phosphorus !== undefined) {
        deficiencies.phosphorus = {
          level: npk.phosphorus,
          severity: calculateNPKSeverity(npk.phosphorus),
          confidence: 0.85,
        };
      }

      if (npk.potassium !== undefined) {
        deficiencies.potassium = {
          level: npk.potassium,
          severity: calculateNPKSeverity(npk.potassium),
          confidence: 0.85,
        };
      }
    }
    // Fallback: try to get from latest satellite data
    else if (fieldData.latest_satellite_data?.npk) {
      const npk = fieldData.latest_satellite_data.npk;

      if (npk.nitrogen !== undefined) {
        deficiencies.nitrogen = {
          level: npk.nitrogen,
          severity: calculateNPKSeverity(npk.nitrogen),
          confidence: npk.confidence || 0.75,
        };
      }

      if (npk.phosphorus !== undefined) {
        deficiencies.phosphorus = {
          level: npk.phosphorus,
          severity: calculateNPKSeverity(npk.phosphorus),
          confidence: npk.confidence || 0.75,
        };
      }

      if (npk.potassium !== undefined) {
        deficiencies.potassium = {
          level: npk.potassium,
          severity: calculateNPKSeverity(npk.potassium),
          confidence: npk.confidence || 0.75,
        };
      }
    }

    return deficiencies;
  }

  /**
   * Analyze disease history
   */
  private analyzeDiseaseHistory(fieldId: string): DiseaseHistoryItem[] {
    const outbreaks = diseaseDetectionService.getDiseaseOutbreaks(fieldId);

    return outbreaks.map((outbreak) => ({
      disease_name: outbreak.disease_name,
      last_detected: outbreak.detected_at,
      recurrence_risk: this.calculateRecurrenceRisk(outbreak),
      confidence: outbreak.confidence,
    }));
  }

  /**
   * Calculate disease recurrence risk
   */
  private calculateRecurrenceRisk(outbreak: any): 'low' | 'medium' | 'high' {
    const daysSince = Math.floor((Date.now() - new Date(outbreak.detected_at).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince < 30) return 'high';
    if (daysSince < 90) return 'medium';
    return 'low';
  }

  /**
   * Analyze weather risks
   */
  private async analyzeWeatherRisks(fieldData: any): Promise<WeatherRisk[]> {
    const risks: WeatherRisk[] = [];

    try {
      // Get weather data
      let weatherData;
      if (fieldData.coordinates && fieldData.coordinates.length > 0) {
        const [lng, lat] = fieldData.coordinates[0];
        weatherData = await weatherService.getWeatherByCoords(lat, lng);
      }

      if (!weatherData) return risks;

      // Analyze forecast for risks
      const forecast = weatherData.forecast || [];

      // Check for heavy rain
      const heavyRainDays = forecast.filter((day: any) => day.precipitation > 70);
      if (heavyRainDays.length > 0) {
        const daysUntil = forecast.indexOf(heavyRainDays[0]);
        risks.push({
          type: 'heavy_rain',
          probability: heavyRainDays[0].precipitation / 100,
          days_until: daysUntil,
          confidence: 0.8,
        });
      }

      // Check for drought (no rain in forecast)
      const noRainDays = forecast.filter((day: any) => day.precipitation < 20);
      if (noRainDays.length >= 5) {
        risks.push({
          type: 'drought',
          probability: 0.7,
          days_until: 0,
          confidence: 0.75,
        });
      }

      // Check for heat stress
      const hotDays = forecast.filter((day: any) => day.temp_max > 35);
      if (hotDays.length > 0) {
        risks.push({
          type: 'heat_stress',
          probability: 0.8,
          days_until: forecast.indexOf(hotDays[0]),
          confidence: 0.85,
        });
      }

      // Check for cold stress
      const coldDays = forecast.filter((day: any) => day.temp_min < 10);
      if (coldDays.length > 0) {
        risks.push({
          type: 'cold_stress',
          probability: 0.7,
          days_until: forecast.indexOf(coldDays[0]),
          confidence: 0.8,
        });
      }
    } catch (error) {
      console.error('Failed to analyze weather risks:', error);
    }

    return risks;
  }

  /**
   * Analyze growth stage
   */
  private analyzeGrowthStage(fieldData: any): GrowthStage {
    // Try to get from yield prediction service
    if (fieldData.marketplace_analysis?.growth_stage) {
      return fieldData.marketplace_analysis.growth_stage;
    }

    // Estimate from planting date
    if (fieldData.planting_date && fieldData.crop_type) {
      return estimateGrowthStageFromPlantingDate(fieldData.planting_date, fieldData.crop_type);
    }

    // Default fallback
    return {
      percentage: 50,
      stage_name: 'Vegetative',
      days_to_harvest: 60,
      confidence: 0.5,
    };
  }

  /**
   * Determine region from field data
   */
  private determineRegion(fieldData: any): string {
    // Try to get from field data
    if (fieldData.region) {
      return fieldData.region;
    }

    // Estimate from coordinates
    if (fieldData.coordinates && fieldData.coordinates.length > 0) {
      const [lng, lat] = fieldData.coordinates[0];
      return getStateCodeFromCoordinates(lat, lng);
    }

    return 'IN'; // Default to India
  }

  /**
   * Calculate overall data quality score
   */
  private calculateDataQuality(
    npk: NPKDeficiencies,
    diseases: DiseaseHistoryItem[],
    weather: WeatherRisk[],
    growth: GrowthStage
  ): number {
    const scores: number[] = [];

    // NPK confidence
    if (npk.nitrogen) scores.push(npk.nitrogen.confidence);
    if (npk.phosphorus) scores.push(npk.phosphorus.confidence);
    if (npk.potassium) scores.push(npk.potassium.confidence);

    // Disease confidence
    if (diseases.length > 0) {
      scores.push(...diseases.map((d) => d.confidence));
    }

    // Weather confidence
    if (weather.length > 0) {
      scores.push(...weather.map((w) => w.confidence));
    }

    // Growth stage confidence
    scores.push(growth.confidence);

    return calculateOverallConfidence(scores);
  }

  /**
   * Get all field IDs from localStorage
   */
  private getAllFieldIds(): string[] {
    const fieldIds: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('field_') && key.endsWith('_data')) {
        const fieldId = key.replace('field_', '').replace('_data', '');
        fieldIds.push(fieldId);
      }
    }

    return fieldIds;
  }
}

// Create singleton instance
export const marketIntelligenceService = new MarketIntelligenceService();
