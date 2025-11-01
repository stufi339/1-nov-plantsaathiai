/**
 * RuleDSLEngine - JSON-based product mapping rules engine
 * Allows non-developers to update product mappings without code changes
 */

import type { ProductMappingRule, FieldAnalysis, ProductRecommendation } from './types';
import { productCatalogService } from './ProductCatalogService';
import { fillTemplate, generateRecommendationId, truncateReason } from './utils';
import rulesData from './rules.json';

export class RuleDSLEngine {
  private rules: ProductMappingRule[] = [];

  constructor() {
    this.loadRules(JSON.stringify(rulesData));
  }

  /**
   * Load rules from JSON string
   */
  loadRules(rulesJson: string): void {
    try {
      const parsed = JSON.parse(rulesJson);
      this.rules = Array.isArray(parsed) ? parsed : [];
      console.log(`[RuleDSL] Loaded ${this.rules.length} rules`);
    } catch (error) {
      console.error('[RuleDSL] Failed to parse rules JSON:', error);
      this.rules = [];
    }
  }

  /**
   * Evaluate all rules against field analysis
   */
  evaluateRules(analysis: FieldAnalysis): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    // Filter enabled rules
    const enabledRules = this.rules.filter((rule) => rule.enabled);

    for (const rule of enabledRules) {
      if (this.matchesConditions(rule, analysis)) {
        const recommendation = this.createRecommendation(rule, analysis);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    }

    console.log(`[RuleDSL] Generated ${recommendations.length} recommendations from ${enabledRules.length} rules`);
    return recommendations;
  }

  /**
   * Check if rule conditions match field analysis
   */
  private matchesConditions(rule: ProductMappingRule, analysis: FieldAnalysis): boolean {
    const conditions = rule.conditions;

    // Check NPK deficiency condition
    if (conditions.npk_deficiency) {
      const { nutrient, min_severity, min_level, max_level } = conditions.npk_deficiency;
      const deficiency = analysis.npkDeficiencies[nutrient];

      if (!deficiency) return false;

      // Check severity
      const severityOrder = { low: 0, medium: 1, high: 2 };
      if (severityOrder[deficiency.severity] < severityOrder[min_severity]) {
        return false;
      }

      // Check level range
      if (min_level !== undefined && deficiency.level < min_level) return false;
      if (max_level !== undefined && deficiency.level > max_level) return false;
    }

    // Check disease type condition
    if (conditions.disease_type && conditions.disease_type.length > 0) {
      const hasMatchingDisease = analysis.diseaseHistory.some((disease) =>
        conditions.disease_type!.some((condDisease) =>
          disease.disease_name.toLowerCase().includes(condDisease.toLowerCase())
        )
      );
      if (!hasMatchingDisease) return false;
    }

    // Check weather condition
    if (conditions.weather_condition && conditions.weather_condition.length > 0) {
      const hasMatchingWeather = analysis.weatherRisks.some((risk) =>
        conditions.weather_condition!.includes(risk.type)
      );
      if (!hasMatchingWeather) return false;
    }

    // Check growth stage range
    if (conditions.growth_stage_range) {
      const { min, max } = conditions.growth_stage_range;
      const stage = analysis.growthStage.percentage;
      if (stage < min || stage > max) return false;
    }

    // Check crop types
    if (conditions.crop_types && conditions.crop_types.length > 0) {
      // Get crop type from field data (would need to be passed in analysis)
      // For now, assume it matches if not specified
    }

    // Check regions
    if (conditions.regions && conditions.regions.length > 0) {
      if (!conditions.regions.includes(analysis.region)) return false;
    }

    return true;
  }

  /**
   * Create recommendation from matched rule
   */
  private createRecommendation(
    rule: ProductMappingRule,
    analysis: FieldAnalysis
  ): ProductRecommendation | null {
    const product = productCatalogService.getProductById(rule.product_mapping.product_id);

    if (!product) {
      console.warn(`[RuleDSL] Product not found: ${rule.product_mapping.product_id}`);
      return null;
    }

    // Fill reason template with actual values
    const templateValues = this.extractTemplateValues(rule, analysis);
    const reason = fillTemplate(rule.product_mapping.reason_template, templateValues);

    // Calculate final confidence
    const baseConfidence = this.calculateBaseConfidence(rule, analysis);
    const finalConfidence = baseConfidence * rule.product_mapping.confidence_multiplier;

    // Generate detailed explanation
    const detailedExplanation = this.generateDetailedExplanation(rule, analysis, product);

    // Generate timing guidance
    const timingGuidance = this.generateTimingGuidance(rule, analysis);

    // Generate expected benefit
    const expectedBenefit = this.generateExpectedBenefit(rule, product);

    // Generate Amazon affiliate link
    const amazonLink = `https://www.amazon.in/dp/${product.amazon_asin}?tag=${product.amazon_affiliate_tag}`;

    const recommendation: ProductRecommendation = {
      id: generateRecommendationId(analysis.fieldId, product.product_id),
      product_name: product.product_name.en,
      category: product.category,
      priority: rule.product_mapping.priority,
      urgency_score: rule.product_mapping.urgency_base_score,
      confidence: finalConfidence,
      reason: truncateReason(reason, 80),
      detailed_explanation: detailedExplanation,
      timing_guidance: timingGuidance,
      application_instructions: product.application_rate,
      expected_benefit: expectedBenefit,
      amazon_link: amazonLink,
      price: product.base_price,
      package_size: product.package_sizes[0],
      image_url: product.image_url,
      eco_friendly: product.is_eco_friendly,
      local_manufacturer: product.is_local,
      regional_available: product.regional_availability.includes(analysis.region),
      fields_needing: [analysis.fieldId],
    };

    return recommendation;
  }

  /**
   * Extract values for template filling
   */
  private extractTemplateValues(rule: ProductMappingRule, analysis: FieldAnalysis): { [key: string]: any } {
    const values: { [key: string]: any } = {};

    // NPK level
    if (rule.conditions.npk_deficiency) {
      const nutrient = rule.conditions.npk_deficiency.nutrient;
      const deficiency = analysis.npkDeficiencies[nutrient];
      if (deficiency) {
        values.level = deficiency.level;
        values.severity = deficiency.severity;
      }
    }

    // Disease name
    if (rule.conditions.disease_type && analysis.diseaseHistory.length > 0) {
      values.disease = analysis.diseaseHistory[0].disease_name;
      values.days = Math.floor(
        (Date.now() - new Date(analysis.diseaseHistory[0].last_detected).getTime()) / (1000 * 60 * 60 * 24)
      );
    }

    // Weather days until
    if (rule.conditions.weather_condition && analysis.weatherRisks.length > 0) {
      values.days = analysis.weatherRisks[0].days_until;
    }

    // Harvest days
    if (rule.conditions.growth_stage_range) {
      values.harvest_days = analysis.growthStage.days_to_harvest;
    }

    return values;
  }

  /**
   * Calculate base confidence from analysis data quality
   */
  private calculateBaseConfidence(rule: ProductMappingRule, analysis: FieldAnalysis): number {
    let confidence = analysis.data_quality_score;

    // Adjust based on condition type
    if (rule.conditions.npk_deficiency) {
      const nutrient = rule.conditions.npk_deficiency.nutrient;
      const deficiency = analysis.npkDeficiencies[nutrient];
      if (deficiency) {
        confidence = Math.min(confidence, deficiency.confidence);
      }
    }

    if (rule.conditions.disease_type && analysis.diseaseHistory.length > 0) {
      confidence = Math.min(confidence, analysis.diseaseHistory[0].confidence);
    }

    if (rule.conditions.weather_condition && analysis.weatherRisks.length > 0) {
      confidence = Math.min(confidence, analysis.weatherRisks[0].confidence);
    }

    if (rule.conditions.growth_stage_range) {
      confidence = Math.min(confidence, analysis.growthStage.confidence);
    }

    return confidence;
  }

  /**
   * Generate detailed explanation
   */
  private generateDetailedExplanation(rule: ProductMappingRule, analysis: FieldAnalysis, product: any): string {
    let explanation = '';

    if (rule.conditions.npk_deficiency) {
      const nutrient = rule.conditions.npk_deficiency.nutrient;
      const nutrientNames = { nitrogen: 'Nitrogen', phosphorus: 'Phosphorus', potassium: 'Potassium' };
      explanation = `${nutrientNames[nutrient]} is essential for crop growth. Your soil analysis shows deficiency that may reduce yield by 20-30%. ${product.product_name.en} provides the necessary nutrients to restore optimal levels.`;
    } else if (rule.conditions.disease_type) {
      explanation = `Disease detected in your field requires immediate treatment. ${product.product_name.en} is effective against this condition and will help protect your crop from further damage.`;
    } else if (rule.conditions.weather_condition) {
      explanation = `Weather forecast indicates conditions favorable for crop stress or disease. ${product.product_name.en} provides protection and helps maintain crop health during adverse conditions.`;
    } else if (rule.conditions.growth_stage_range) {
      explanation = `Your crop is at a critical growth stage requiring specific inputs. ${product.product_name.en} supports optimal development during this phase.`;
    }

    return explanation;
  }

  /**
   * Generate timing guidance
   */
  private generateTimingGuidance(rule: ProductMappingRule, analysis: FieldAnalysis): string {
    if (rule.product_mapping.priority === 'immediate') {
      if (rule.conditions.npk_deficiency?.min_severity === 'high') {
        return 'Apply within 1 week for best results';
      }
      if (rule.conditions.disease_type) {
        return 'Apply immediately, repeat after 10 days if needed';
      }
      if (rule.conditions.weather_condition) {
        const days = analysis.weatherRisks[0]?.days_until || 7;
        return `Apply 1-2 days before expected weather event (in ${days} days)`;
      }
      return 'Apply within 1-2 weeks';
    } else if (rule.product_mapping.priority === 'preventive') {
      return 'Apply within 2-3 weeks as preventive measure';
    } else {
      return 'Plan for upcoming season';
    }
  }

  /**
   * Generate expected benefit
   */
  private generateExpectedBenefit(rule: ProductMappingRule, product: any): string {
    if (rule.conditions.npk_deficiency) {
      return 'Restore nutrient levels, improve crop health, increase yield potential by 15-25%';
    } else if (rule.conditions.disease_type) {
      return 'Control disease spread, protect crop from damage, maintain yield potential';
    } else if (rule.conditions.weather_condition) {
      return 'Protect crop from weather stress, maintain plant health, prevent yield loss';
    } else if (rule.conditions.growth_stage_range) {
      return 'Support optimal growth, improve grain filling, maximize yield potential';
    }
    return 'Improve overall crop health and productivity';
  }

  /**
   * Update existing rule
   */
  updateRule(ruleId: string, updates: Partial<ProductMappingRule>): void {
    const index = this.rules.findIndex((r) => r.rule_id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updates };
      console.log(`[RuleDSL] Updated rule: ${ruleId}`);
    }
  }

  /**
   * Add new rule
   */
  addRule(rule: ProductMappingRule): void {
    this.rules.push(rule);
    console.log(`[RuleDSL] Added new rule: ${rule.rule_id}`);
  }

  /**
   * Disable rule
   */
  disableRule(ruleId: string): void {
    this.updateRule(ruleId, { enabled: false });
  }

  /**
   * Enable rule
   */
  enableRule(ruleId: string): void {
    this.updateRule(ruleId, { enabled: true });
  }

  /**
   * Get all rules
   */
  getAllRules(): ProductMappingRule[] {
    return [...this.rules];
  }

  /**
   * Get enabled rules
   */
  getEnabledRules(): ProductMappingRule[] {
    return this.rules.filter((r) => r.enabled);
  }

  /**
   * Export rules as JSON
   */
  exportRules(): string {
    return JSON.stringify(this.rules, null, 2);
  }
}

// Create singleton instance
export const ruleDSLEngine = new RuleDSLEngine();
