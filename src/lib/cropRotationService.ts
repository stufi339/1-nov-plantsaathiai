/**
 * Crop Rotation & Soil Regeneration Planner
 * AI-powered crop rotation recommendations based on:
 * - BlackBox historical data
 * - Soil Saathi nutrient analysis
 * - Disease patterns
 * - Market intelligence
 */

import { blackBoxService } from './blackBoxService';
import { supabase } from './supabase';

export interface CropRotationRecommendation {
  currentCrop: string;
  recommendedNextCrop: string;
  confidence: number; // 0-100
  soilRegeneration: {
    nitrogenRestoration: number;    // % improvement
    phosphorusBalance: number;      // % improvement
    potassiumEnhancement: number;   // % improvement
    organicMatterIncrease: number;  // % improvement
  };
  diseaseRiskReduction: number;     // % reduction
  marketAdvantage: {
    expectedPrice: number;          // ₹/kg
    demandTrend: 'high' | 'medium' | 'low';
    nearbyMarkets: string[];
    profitIncrease: number;         // ₹/acre
  };
  implementation: {
    preparationTime: number;        // days
    sowingWindow: string;           // "Oct 15 - Nov 15"
    expectedYield: number;          // tons/acre
    waterRequirement: 'low' | 'medium' | 'high';
    laborIntensity: 'low' | 'medium' | 'high';
  };
  reasoning: string[];              // Human-readable explanations
}

export interface MultiSeasonPlan {
  seasons: {
    season: string;
    crop: string;
    soilHealthImpact: number;
    expectedProfit: number;
  }[];
  totalSoilImprovement: number;     // % over plan duration
  totalProfitIncrease: number;      // ₹ over plan duration
  riskAssessment: string[];
}

// Crop knowledge base with nutrient profiles
const CROP_DATABASE = {
  wheat: {
    nutrients: { n: -40, p: -30, k: -25 },
    diseases: ['rust', 'blight'],
    season: 'rabi',
    marketPrice: 22,
    yieldPerAcre: 2.5,
    waterNeed: 'high',
    laborNeed: 'medium'
  },
  rice: {
    nutrients: { n: -45, p: -35, k: -30 },
    diseases: ['blast', 'blight'],
    season: 'kharif',
    marketPrice: 25,
    yieldPerAcre: 3.0,
    waterNeed: 'high',
    laborNeed: 'high'
  },
  moong: {
    nutrients: { n: +35, p: -10, k: -15 },
    diseases: ['mosaic'],
    season: 'kharif',
    marketPrice: 38,
    yieldPerAcre: 0.8,
    waterNeed: 'low',
    laborNeed: 'low'
  },
  chickpea: {
    nutrients: { n: +30, p: -15, k: -10 },
    diseases: ['wilt'],
    season: 'rabi',
    marketPrice: 45,
    yieldPerAcre: 1.2,
    waterNeed: 'low',
    laborNeed: 'medium'
  },
  maize: {
    nutrients: { n: -35, p: -20, k: -25 },
    diseases: ['borer'],
    season: 'kharif',
    marketPrice: 18,
    yieldPerAcre: 4.0,
    waterNeed: 'medium',
    laborNeed: 'medium'
  },
  mustard: {
    nutrients: { n: -25, p: -20, k: -20 },
    diseases: ['aphids'],
    season: 'rabi',
    marketPrice: 50,
    yieldPerAcre: 1.0,
    waterNeed: 'low',
    laborNeed: 'low'
  },
  cotton: {
    nutrients: { n: -50, p: -40, k: -45 },
    diseases: ['bollworm', 'wilt'],
    season: 'kharif',
    marketPrice: 55,
    yieldPerAcre: 2.0,
    waterNeed: 'high',
    laborNeed: 'high'
  },
  groundnut: {
    nutrients: { n: +25, p: -15, k: +20 },
    diseases: ['tikka'],
    season: 'kharif',
    marketPrice: 48,
    yieldPerAcre: 1.5,
    waterNeed: 'medium',
    laborNeed: 'medium'
  },
  tomato: {
    nutrients: { n: -40, p: -35, k: -40 },
    diseases: ['blight', 'wilt'],
    season: 'both',
    marketPrice: 20,
    yieldPerAcre: 8.0,
    waterNeed: 'high',
    laborNeed: 'high'
  },
  sugarcane: {
    nutrients: { n: -60, p: -50, k: -55 },
    diseases: ['red_rot'],
    season: 'annual',
    marketPrice: 3,
    yieldPerAcre: 40.0,
    waterNeed: 'high',
    laborNeed: 'high'
  }
};

// Rotation rules based on agronomic science
const ROTATION_RULES = {
  // After heavy N users, plant N fixers
  nitrogenFixation: {
    after: ['wheat', 'rice', 'maize', 'cotton'],
    recommend: ['moong', 'chickpea', 'groundnut'],
    benefit: 'Restores nitrogen naturally through legume fixation'
  },
  // Break disease cycles
  diseaseBreaking: {
    'rust': ['maize', 'chickpea', 'mustard'],
    'blight': ['maize', 'mustard', 'chickpea'],
    'wilt': ['wheat', 'maize', 'rice'],
    'bollworm': ['wheat', 'chickpea'],
    'mosaic': ['wheat', 'maize']
  },
  // Seasonal compatibility
  seasonalRotation: {
    'kharif': ['rabi', 'both'],
    'rabi': ['kharif', 'both'],
    'both': ['kharif', 'rabi', 'both']
  }
};

class CropRotationService {
  /**
   * Get personalized crop rotation recommendation for a field
   */
  async getRotationRecommendation(fieldId: string): Promise<CropRotationRecommendation | null> {
    try {
      // 1. Get field history from BlackBox
      const fieldHistory = await this.getFieldHistory(fieldId);
      if (!fieldHistory) return null;

      // 2. Get current soil health from Soil Saathi
      const soilHealth = await this.getCurrentSoilHealth(fieldId);
      
      // 3. Get disease history
      const diseaseHistory = await this.getDiseaseHistory(fieldId);
      
      // 4. Analyze current crop
      const currentCrop = fieldHistory.currentCrop?.toLowerCase() || 'wheat';
      const cropData = CROP_DATABASE[currentCrop as keyof typeof CROP_DATABASE];
      
      if (!cropData) return null;

      // 5. Calculate best next crop
      const candidates = this.calculateCropCandidates(
        currentCrop,
        soilHealth,
        diseaseHistory,
        fieldHistory
      );

      // 6. Rank by multiple factors
      const bestCandidate = this.rankCandidates(candidates, soilHealth);
      
      if (!bestCandidate) return null;

      // 7. Build comprehensive recommendation
      return this.buildRecommendation(
        currentCrop,
        bestCandidate,
        soilHealth,
        diseaseHistory,
        fieldHistory
      );
    } catch (error) {
      console.error('Error generating rotation recommendation:', error);
      return null;
    }
  }

  /**
   * Generate multi-season rotation plan (3-5 years)
   */
  async getMultiSeasonPlan(fieldId: string, years: number = 3): Promise<MultiSeasonPlan | null> {
    try {
      const fieldHistory = await this.getFieldHistory(fieldId);
      if (!fieldHistory) return null;

      const soilHealth = await this.getCurrentSoilHealth(fieldId);
      const plan: MultiSeasonPlan = {
        seasons: [],
        totalSoilImprovement: 0,
        totalProfitIncrease: 0,
        riskAssessment: []
      };

      let currentCrop = fieldHistory.currentCrop?.toLowerCase() || 'wheat';
      let simulatedSoil = { ...soilHealth };

      // Simulate rotation over multiple seasons
      for (let i = 0; i < years * 2; i++) { // 2 seasons per year
        const candidates = this.calculateCropCandidates(
          currentCrop,
          simulatedSoil,
          [],
          fieldHistory
        );

        const nextCrop = this.rankCandidates(candidates, simulatedSoil);
        if (!nextCrop) break;

        const cropData = CROP_DATABASE[nextCrop as keyof typeof CROP_DATABASE];
        const season = i % 2 === 0 ? 'Kharif' : 'Rabi';
        
        // Calculate impact
        const soilImpact = this.calculateSoilImpact(nextCrop, simulatedSoil);
        const profit = cropData.marketPrice * cropData.yieldPerAcre * 40; // ₹ per acre

        plan.seasons.push({
          season: `${season} Year ${Math.floor(i / 2) + 1}`,
          crop: nextCrop,
          soilHealthImpact: soilImpact,
          expectedProfit: profit
        });

        // Update simulated soil
        simulatedSoil = this.updateSimulatedSoil(simulatedSoil, nextCrop);
        currentCrop = nextCrop;
        
        plan.totalSoilImprovement += soilImpact;
        plan.totalProfitIncrease += profit;
      }

      // Risk assessment
      plan.riskAssessment = this.assessRotationRisks(plan.seasons);

      return plan;
    } catch (error) {
      console.error('Error generating multi-season plan:', error);
      return null;
    }
  }

  /**
   * Get field history from BlackBox
   */
  private async getFieldHistory(fieldId: string) {
    const events = await blackBoxService.getFieldEvents(fieldId);
    
    // Extract crop history
    const cropHistory = events
      .filter(e => e.event_type === 'crop_planted' || e.event_type === 'harvest')
      .map(e => e.metadata?.crop)
      .filter(Boolean);

    return {
      currentCrop: cropHistory[cropHistory.length - 1] || 'wheat',
      previousCrops: cropHistory.slice(0, -1),
      totalEvents: events.length
    };
  }

  /**
   * Get current soil health from latest field data
   */
  private async getCurrentSoilHealth(fieldId: string) {
    const { data: field } = await supabase
      .from('fields')
      .select('soil_properties')
      .eq('id', fieldId)
      .single();

    return field?.soil_properties || {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      ph: 7.0,
      organicMatter: 2.5
    };
  }

  /**
   * Get disease history from BlackBox
   */
  private async getDiseaseHistory(fieldId: string) {
    const events = await blackBoxService.getFieldEvents(fieldId);
    
    return events
      .filter(e => e.event_type === 'disease_detected')
      .map(e => e.metadata?.disease_name?.toLowerCase())
      .filter(Boolean);
  }

  /**
   * Calculate candidate crops based on rotation rules
   */
  private calculateCropCandidates(
    currentCrop: string,
    soilHealth: any,
    diseaseHistory: string[],
    fieldHistory: any
  ): string[] {
    const candidates: string[] = [];
    const currentData = CROP_DATABASE[currentCrop as keyof typeof CROP_DATABASE];
    
    if (!currentData) return Object.keys(CROP_DATABASE);

    // Rule 1: Nitrogen fixation after heavy users
    if (currentData.nutrients.n < -30) {
      candidates.push('moong', 'chickpea', 'groundnut');
    }

    // Rule 2: Disease cycle breaking
    const currentDiseases = currentData.diseases;
    currentDiseases.forEach(disease => {
      const breakingCrops = ROTATION_RULES.diseaseBreaking[disease as keyof typeof ROTATION_RULES.diseaseBreaking];
      if (breakingCrops) {
        candidates.push(...breakingCrops);
      }
    });

    // Rule 3: Avoid recent crops (diversity)
    const recentCrops = fieldHistory.previousCrops.slice(-3);
    const diverseCrops = Object.keys(CROP_DATABASE).filter(
      crop => !recentCrops.includes(crop) && crop !== currentCrop
    );
    candidates.push(...diverseCrops);

    // Rule 4: Soil nutrient balance
    if (soilHealth.nitrogen < 40) {
      candidates.push('moong', 'chickpea', 'groundnut');
    }
    if (soilHealth.potassium < 40) {
      candidates.push('groundnut', 'mustard');
    }

    // Remove duplicates
    return [...new Set(candidates)];
  }

  /**
   * Rank candidates by multiple factors
   */
  private rankCandidates(candidates: string[], soilHealth: any): string | null {
    if (candidates.length === 0) return null;

    const scores = candidates.map(crop => {
      const cropData = CROP_DATABASE[crop as keyof typeof CROP_DATABASE];
      if (!cropData) return { crop, score: 0 };

      let score = 0;

      // Factor 1: Soil regeneration (40% weight)
      const soilScore = (
        (cropData.nutrients.n > 0 ? 20 : 0) +
        (cropData.nutrients.k > 0 ? 15 : 0) +
        (cropData.nutrients.p > 0 ? 5 : 0)
      );
      score += soilScore * 0.4;

      // Factor 2: Market profitability (35% weight)
      const profitScore = (cropData.marketPrice * cropData.yieldPerAcre) / 100;
      score += profitScore * 0.35;

      // Factor 3: Resource efficiency (25% weight)
      const resourceScore = (
        (cropData.waterNeed === 'low' ? 15 : cropData.waterNeed === 'medium' ? 10 : 5) +
        (cropData.laborNeed === 'low' ? 10 : cropData.laborNeed === 'medium' ? 7 : 4)
      );
      score += resourceScore * 0.25;

      return { crop, score };
    });

    // Return highest scoring crop
    scores.sort((a, b) => b.score - a.score);
    return scores[0].crop;
  }

  /**
   * Build comprehensive recommendation
   */
  private buildRecommendation(
    currentCrop: string,
    nextCrop: string,
    soilHealth: any,
    diseaseHistory: string[],
    fieldHistory: any
  ): CropRotationRecommendation {
    const currentData = CROP_DATABASE[currentCrop as keyof typeof CROP_DATABASE];
    const nextData = CROP_DATABASE[nextCrop as keyof typeof CROP_DATABASE];

    const reasoning: string[] = [];

    // Soil regeneration analysis
    const soilRegen = {
      nitrogenRestoration: Math.max(0, nextData.nutrients.n),
      phosphorusBalance: Math.max(0, nextData.nutrients.p),
      potassiumEnhancement: Math.max(0, nextData.nutrients.k),
      organicMatterIncrease: nextData.nutrients.n > 0 ? 15 : 5
    };

    if (soilRegen.nitrogenRestoration > 0) {
      reasoning.push(`Restores ${soilRegen.nitrogenRestoration}% nitrogen naturally through legume fixation`);
    }

    // Disease risk reduction
    const diseaseReduction = this.calculateDiseaseReduction(currentData.diseases, nextData.diseases);
    if (diseaseReduction > 0) {
      reasoning.push(`Breaks disease cycle, reducing risk by ${diseaseReduction}%`);
    }

    // Market advantage
    const profitIncrease = (nextData.marketPrice - currentData.marketPrice) * nextData.yieldPerAcre * 40;
    reasoning.push(`Expected profit increase: ₹${profitIncrease.toLocaleString('en-IN')}/acre`);

    if (nextData.marketPrice > 35) {
      reasoning.push(`High market demand with premium pricing at ₹${nextData.marketPrice}/kg`);
    }

    // Resource efficiency
    if (nextData.waterNeed === 'low') {
      reasoning.push('Low water requirement - ideal for water conservation');
    }
    if (nextData.laborNeed === 'low') {
      reasoning.push('Low labor intensity - reduces operational costs');
    }

    return {
      currentCrop,
      recommendedNextCrop: nextCrop,
      confidence: 85,
      soilRegeneration: soilRegen,
      diseaseRiskReduction: diseaseReduction,
      marketAdvantage: {
        expectedPrice: nextData.marketPrice,
        demandTrend: nextData.marketPrice > 35 ? 'high' : nextData.marketPrice > 25 ? 'medium' : 'low',
        nearbyMarkets: ['Azadpur Mandi', 'Local Market'],
        profitIncrease
      },
      implementation: {
        preparationTime: 15,
        sowingWindow: this.getSowingWindow(nextData.season),
        expectedYield: nextData.yieldPerAcre,
        waterRequirement: nextData.waterNeed,
        laborIntensity: nextData.laborNeed
      },
      reasoning
    };
  }

  private calculateDiseaseReduction(currentDiseases: string[], nextDiseases: string[]): number {
    const overlap = currentDiseases.filter(d => nextDiseases.includes(d)).length;
    const reduction = ((currentDiseases.length - overlap) / currentDiseases.length) * 100;
    return Math.round(reduction);
  }

  private getSowingWindow(season: string): string {
    const windows = {
      'kharif': 'Jun 15 - Jul 15',
      'rabi': 'Oct 15 - Nov 15',
      'both': 'Jun-Jul or Oct-Nov',
      'annual': 'Feb-Mar'
    };
    return windows[season as keyof typeof windows] || 'Consult local expert';
  }

  private calculateSoilImpact(crop: string, soilHealth: any): number {
    const cropData = CROP_DATABASE[crop as keyof typeof CROP_DATABASE];
    if (!cropData) return 0;

    const impact = (
      cropData.nutrients.n +
      cropData.nutrients.p +
      cropData.nutrients.k
    ) / 3;

    return Math.round(impact);
  }

  private updateSimulatedSoil(soil: any, crop: string) {
    const cropData = CROP_DATABASE[crop as keyof typeof CROP_DATABASE];
    if (!cropData) return soil;

    return {
      ...soil,
      nitrogen: Math.max(0, Math.min(100, soil.nitrogen + cropData.nutrients.n)),
      phosphorus: Math.max(0, Math.min(100, soil.phosphorus + cropData.nutrients.p)),
      potassium: Math.max(0, Math.min(100, soil.potassium + cropData.nutrients.k))
    };
  }

  private assessRotationRisks(seasons: any[]): string[] {
    const risks: string[] = [];

    // Check for crop diversity
    const uniqueCrops = new Set(seasons.map(s => s.crop));
    if (uniqueCrops.size < seasons.length / 2) {
      risks.push('Low crop diversity - consider more variety');
    }

    // Check for continuous heavy feeders
    let heavyFeederStreak = 0;
    seasons.forEach(s => {
      const cropData = CROP_DATABASE[s.crop as keyof typeof CROP_DATABASE];
      if (cropData && cropData.nutrients.n < -30) {
        heavyFeederStreak++;
      } else {
        heavyFeederStreak = 0;
      }
    });

    if (heavyFeederStreak > 2) {
      risks.push('Too many heavy nitrogen users in sequence');
    }

    if (risks.length === 0) {
      risks.push('Well-balanced rotation plan with good diversity');
    }

    return risks;
  }
}

export const cropRotationService = new CropRotationService();
