/**
 * RegionalIntelligenceService - State-specific agricultural intelligence
 * Filters products based on regional availability, banned substances, and monsoon timing
 */

import type { RegionalIntelligence, ProductRecommendation } from './types';

const REGIONAL_DATA: { [stateCode: string]: RegionalIntelligence } = {
  PB: {
    state_code: 'PB',
    state_name: 'Punjab',
    banned_products: [],
    monsoon_months: [7, 8, 9],
    primary_crops: ['rice', 'wheat'],
    soil_type_distribution: { alluvial: 0.8, sandy_loam: 0.2 },
    common_diseases: ['Rice Blast', 'Brown Spot', 'Bacterial Blight'],
    preferred_suppliers: ['IFFCO', 'Punjab Agro'],
  },
  HR: {
    state_code: 'HR',
    state_name: 'Haryana',
    banned_products: [],
    monsoon_months: [7, 8, 9],
    primary_crops: ['rice', 'wheat', 'cotton'],
    soil_type_distribution: { alluvial: 0.7, sandy: 0.3 },
    common_diseases: ['Rice Blast', 'Leaf Blight'],
    preferred_suppliers: ['IFFCO', 'Coromandel'],
  },
  UP: {
    state_code: 'UP',
    state_name: 'Uttar Pradesh',
    banned_products: [],
    monsoon_months: [6, 7, 8, 9],
    primary_crops: ['rice', 'wheat', 'sugarcane'],
    soil_type_distribution: { alluvial: 0.9, clay: 0.1 },
    common_diseases: ['Rice Blast', 'Brown Spot', 'Sheath Blight'],
    preferred_suppliers: ['IFFCO', 'Rallis India'],
  },
  MH: {
    state_code: 'MH',
    state_name: 'Maharashtra',
    banned_products: [],
    monsoon_months: [6, 7, 8, 9],
    primary_crops: ['cotton', 'soybean', 'sugarcane'],
    soil_type_distribution: { black_soil: 0.6, red_soil: 0.4 },
    common_diseases: ['Bacterial Blight', 'Leaf Spot'],
    preferred_suppliers: ['Coromandel', 'UPL'],
  },
  KA: {
    state_code: 'KA',
    state_name: 'Karnataka',
    banned_products: [],
    monsoon_months: [6, 7, 8, 9, 10],
    primary_crops: ['rice', 'ragi', 'maize'],
    soil_type_distribution: { red_soil: 0.5, black_soil: 0.3, laterite: 0.2 },
    common_diseases: ['Blast', 'Brown Spot'],
    preferred_suppliers: ['Coromandel', 'Rallis India'],
  },
  TN: {
    state_code: 'TN',
    state_name: 'Tamil Nadu',
    banned_products: [],
    monsoon_months: [10, 11, 12],
    primary_crops: ['rice', 'sugarcane', 'cotton'],
    soil_type_distribution: { alluvial: 0.4, red_soil: 0.3, black_soil: 0.3 },
    common_diseases: ['Rice Blast', 'Bacterial Blight'],
    preferred_suppliers: ['Coromandel', 'Rallis India'],
  },
  WB: {
    state_code: 'WB',
    state_name: 'West Bengal',
    banned_products: [],
    monsoon_months: [6, 7, 8, 9],
    primary_crops: ['rice', 'jute', 'potato'],
    soil_type_distribution: { alluvial: 0.9, laterite: 0.1 },
    common_diseases: ['Rice Blast', 'Brown Spot', 'Sheath Blight'],
    preferred_suppliers: ['IFFCO', 'Rallis India'],
  },
  IN: {
    state_code: 'IN',
    state_name: 'India (General)',
    banned_products: [],
    monsoon_months: [6, 7, 8, 9],
    primary_crops: ['rice', 'wheat', 'cotton'],
    soil_type_distribution: { alluvial: 0.5, black_soil: 0.3, red_soil: 0.2 },
    common_diseases: ['Rice Blast', 'Bacterial Blight', 'Brown Spot'],
    preferred_suppliers: ['IFFCO', 'Coromandel', 'Rallis India'],
  },
};

export class RegionalIntelligenceService {
  private regionalData: { [stateCode: string]: RegionalIntelligence } = REGIONAL_DATA;

  /**
   * Get regional data for a state
   */
  getRegionalData(stateCode: string): RegionalIntelligence {
    return this.regionalData[stateCode] || this.regionalData['IN'];
  }

  /**
   * Check if product is banned in region
   */
  isProductBanned(productId: string, stateCode: string): boolean {
    const regional = this.getRegionalData(stateCode);
    return regional.banned_products.includes(productId);
  }

  /**
   * Adjust monsoon timing for recommendations
   */
  adjustMonsoonTiming(
    recommendations: ProductRecommendation[],
    stateCode: string
  ): ProductRecommendation[] {
    const regional = this.getRegionalData(stateCode);
    const currentMonth = new Date().getMonth() + 1;

    return recommendations.map((rec) => {
      // Check if monsoon-related product
      if (rec.category === 'fungicide' || rec.category === 'seed_treatment') {
        const monthsUntilMonsoon = this.getMonthsUntilMonsoon(currentMonth, regional.monsoon_months);

        if (monthsUntilMonsoon <= 2 && monthsUntilMonsoon >= 0) {
          // Increase urgency if monsoon is approaching
          return {
            ...rec,
            urgency_score: Math.min(rec.urgency_score + 15, 100),
            timing_guidance: `Apply before monsoon (in ${monthsUntilMonsoon} months)`,
          };
        }
      }

      return rec;
    });
  }

  /**
   * Filter recommendations by regional availability
   */
  filterByRegionalAvailability(
    recommendations: ProductRecommendation[],
    stateCode: string
  ): ProductRecommendation[] {
    return recommendations.filter((rec) => {
      // Check if product is banned
      if (this.isProductBanned(rec.id, stateCode)) {
        console.log(`[Regional] Product ${rec.product_name} banned in ${stateCode}`);
        return false;
      }

      // Check if product is regionally available
      if (!rec.regional_available) {
        console.log(`[Regional] Product ${rec.product_name} not available in ${stateCode}`);
        return false;
      }

      return true;
    });
  }

  /**
   * Get months until monsoon
   */
  private getMonthsUntilMonsoon(currentMonth: number, monsoonMonths: number[]): number {
    const nextMonsoonMonth = monsoonMonths.find((m) => m >= currentMonth);

    if (nextMonsoonMonth) {
      return nextMonsoonMonth - currentMonth;
    }

    // Monsoon is next year
    return 12 - currentMonth + monsoonMonths[0];
  }

  /**
   * Get common diseases for region
   */
  getCommonDiseases(stateCode: string): string[] {
    const regional = this.getRegionalData(stateCode);
    return regional.common_diseases;
  }

  /**
   * Get primary crops for region
   */
  getPrimaryCrops(stateCode: string): string[] {
    const regional = this.getRegionalData(stateCode);
    return regional.primary_crops;
  }

  /**
   * Get preferred suppliers for region
   */
  getPreferredSuppliers(stateCode: string): string[] {
    const regional = this.getRegionalData(stateCode);
    return regional.preferred_suppliers;
  }

  /**
   * Check if crop is suitable for region
   */
  isCropSuitable(cropType: string, stateCode: string): boolean {
    const regional = this.getRegionalData(stateCode);
    return regional.primary_crops.some((crop) => crop.toLowerCase() === cropType.toLowerCase());
  }

  /**
   * Get all available regions
   */
  getAllRegions(): RegionalIntelligence[] {
    return Object.values(this.regionalData);
  }
}

// Create singleton instance
export const regionalIntelligenceService = new RegionalIntelligenceService();
