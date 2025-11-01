/**
 * Jal Saathi - Behavioral Water Scheduler
 * Helps farmers optimize irrigation based on weather, crop stage, and soil type
 * Prevents over-irrigation and missed irrigation through smart scheduling
 */

import { weatherService } from './weatherService';

export interface IrrigationSchedule {
  date: string;
  time: string;
  duration: number; // in hours
  waterAmount: number; // in liters per hour
  reason: string;
  skipReason?: string;
  isSkipped: boolean;
  confidence: number;
}

export interface CropStage {
  stage: 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturity';
  waterRequirement: 'low' | 'medium' | 'high' | 'very_high';
  daysInStage: number;
}

export interface SoilType {
  type: 'sandy' | 'loamy' | 'clay' | 'silt';
  waterRetention: 'low' | 'medium' | 'high';
  drainageRate: 'fast' | 'moderate' | 'slow';
}

export interface IrrigationRecommendation {
  schedule: IrrigationSchedule[];
  weeklyWaterSavings: number; // percentage
  costSavings: number; // in rupees
  tips: string[];
  alerts: string[];
}

export class JalSaathiService {
  /**
   * Generate irrigation schedule for next 7 days
   */
  async generateIrrigationSchedule(
    fieldId: string,
    cropType: string,
    cropStage: CropStage,
    soilType: SoilType,
    location: { lat: number; lon: number } | string
  ): Promise<IrrigationRecommendation> {
    try {
      // Get weather forecast
      const weatherData = typeof location === 'string'
        ? await weatherService.getWeatherByCity(location)
        : await weatherService.getWeatherByCoords(location.lat, location.lon);

      // Generate schedule based on weather, crop stage, and soil
      const schedule = this.calculateIrrigationSchedule(
        weatherData,
        cropType,
        cropStage,
        soilType
      );

      // Calculate water and cost savings
      const savings = this.calculateSavings(schedule, soilType);

      // Generate tips and alerts
      const tips = this.generateIrrigationTips(cropStage, soilType, weatherData);
      const alerts = this.generateAlerts(weatherData, schedule);

      return {
        schedule,
        weeklyWaterSavings: savings.waterSavings,
        costSavings: savings.costSavings,
        tips,
        alerts,
      };
    } catch (error) {
      console.error('Failed to generate irrigation schedule:', error);
      throw error;
    }
  }

  /**
   * Calculate irrigation schedule based on multiple factors
   */
  private calculateIrrigationSchedule(
    weatherData: any,
    cropType: string,
    cropStage: CropStage,
    soilType: SoilType
  ): IrrigationSchedule[] {
    const schedule: IrrigationSchedule[] = [];
    const baseWaterRequirement = this.getBaseWaterRequirement(cropType, cropStage);

    // Process next 7 days
    for (let i = 0; i < 7; i++) {
      const forecastDay = weatherData.forecast[i] || weatherData.forecast[weatherData.forecast.length - 1];
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Check if irrigation is needed
      const needsIrrigation = this.checkIrrigationNeed(
        forecastDay,
        cropStage,
        soilType,
        i
      );

      if (needsIrrigation.needed) {
        // Calculate optimal time (early morning or evening)
        const time = this.getOptimalIrrigationTime(forecastDay, i);

        // Adjust duration based on soil type and weather
        const duration = this.calculateIrrigationDuration(
          baseWaterRequirement,
          soilType,
          forecastDay
        );

        schedule.push({
          date: date.toISOString().split('T')[0],
          time,
          duration: duration.hours,
          waterAmount: duration.litersPerHour,
          reason: needsIrrigation.reason,
          isSkipped: false,
          confidence: needsIrrigation.confidence,
        });
      } else if (needsIrrigation.skipReason) {
        // Add skipped entry with reason
        schedule.push({
          date: date.toISOString().split('T')[0],
          time: '—',
          duration: 0,
          waterAmount: 0,
          reason: 'Irrigation not needed',
          skipReason: needsIrrigation.skipReason,
          isSkipped: true,
          confidence: needsIrrigation.confidence,
        });
      }
    }

    return schedule;
  }

  /**
   * Get base water requirement for crop and stage
   */
  private getBaseWaterRequirement(cropType: string, cropStage: CropStage): number {
    const cropWaterNeeds: { [key: string]: { [key: string]: number } } = {
      rice: {
        germination: 50,
        vegetative: 80,
        flowering: 100,
        fruiting: 90,
        maturity: 40,
      },
      wheat: {
        germination: 30,
        vegetative: 50,
        flowering: 70,
        fruiting: 60,
        maturity: 30,
      },
      cotton: {
        germination: 40,
        vegetative: 60,
        flowering: 80,
        fruiting: 70,
        maturity: 30,
      },
      sugarcane: {
        germination: 60,
        vegetative: 90,
        flowering: 100,
        fruiting: 90,
        maturity: 50,
      },
      default: {
        germination: 40,
        vegetative: 60,
        flowering: 80,
        fruiting: 70,
        maturity: 40,
      },
    };

    const cropData = cropWaterNeeds[cropType.toLowerCase()] || cropWaterNeeds.default;
    return cropData[cropStage.stage] || 60;
  }

  /**
   * Check if irrigation is needed on a given day
   */
  private checkIrrigationNeed(
    forecastDay: any,
    cropStage: CropStage,
    soilType: SoilType,
    dayIndex: number
  ): { needed: boolean; reason: string; skipReason?: string; confidence: number } {
    // Heavy rain expected - skip irrigation
    if (forecastDay.precipitation > 70) {
      return {
        needed: false,
        reason: '',
        skipReason: `Heavy rainfall expected (${forecastDay.precipitation}% chance). Save water and diesel!`,
        confidence: 95,
      };
    }

    // Moderate rain expected - reduce irrigation
    if (forecastDay.precipitation > 40) {
      return {
        needed: false,
        reason: '',
        skipReason: `Moderate rainfall expected (${forecastDay.precipitation}% chance). Skip irrigation today.`,
        confidence: 85,
      };
    }

    // High humidity + clay soil - skip irrigation
    if (forecastDay.humidity > 80 && soilType.waterRetention === 'high') {
      return {
        needed: false,
        reason: '',
        skipReason: 'High humidity and good soil moisture retention. No irrigation needed.',
        confidence: 80,
      };
    }

    // Critical growth stages need regular irrigation
    if (cropStage.stage === 'flowering' || cropStage.stage === 'fruiting') {
      // Irrigate every 2-3 days during critical stages
      if (dayIndex % 2 === 0 || forecastDay.temp_max > 35) {
        return {
          needed: true,
          reason: `Critical ${cropStage.stage} stage requires consistent moisture. Temperature: ${forecastDay.temp_max}°C`,
          confidence: 90,
        };
      }
    }

    // Hot and dry conditions
    if (forecastDay.temp_max > 35 && forecastDay.humidity < 40) {
      return {
        needed: true,
        reason: `Hot and dry conditions (${forecastDay.temp_max}°C, ${forecastDay.humidity}% humidity). Prevent crop stress.`,
        confidence: 95,
      };
    }

    // Sandy soil needs more frequent irrigation
    if (soilType.waterRetention === 'low' && dayIndex % 2 === 0) {
      return {
        needed: true,
        reason: 'Sandy soil drains quickly. Regular irrigation needed to maintain moisture.',
        confidence: 85,
      };
    }

    // Normal irrigation schedule (every 3-4 days)
    if (dayIndex % 3 === 0) {
      return {
        needed: true,
        reason: `Regular irrigation for ${cropStage.stage} stage. Maintain optimal soil moisture.`,
        confidence: 80,
      };
    }

    return {
      needed: false,
      reason: '',
      skipReason: 'Soil moisture adequate. No irrigation needed today.',
      confidence: 75,
    };
  }

  /**
   * Get optimal irrigation time based on weather
   */
  private getOptimalIrrigationTime(forecastDay: any, dayIndex: number): string {
    // Hot days - irrigate early morning or late evening
    if (forecastDay.temp_max > 32) {
      return dayIndex % 2 === 0 ? '05:00 AM' : '06:00 PM';
    }

    // Moderate days - morning irrigation preferred
    if (forecastDay.temp_max > 25) {
      return '06:00 AM';
    }

    // Cool days - mid-morning irrigation
    return '08:00 AM';
  }

  /**
   * Calculate irrigation duration based on multiple factors
   */
  private calculateIrrigationDuration(
    baseRequirement: number,
    soilType: SoilType,
    forecastDay: any
  ): { hours: number; litersPerHour: number } {
    let duration = baseRequirement / 30; // Convert mm to hours (rough estimate)

    // Adjust for soil type
    if (soilType.waterRetention === 'low') {
      duration *= 1.3; // Sandy soil needs more water
    } else if (soilType.waterRetention === 'high') {
      duration *= 0.8; // Clay soil retains water better
    }

    // Adjust for temperature
    if (forecastDay.temp_max > 35) {
      duration *= 1.2; // More water needed in hot weather
    } else if (forecastDay.temp_max < 20) {
      duration *= 0.8; // Less water needed in cool weather
    }

    // Adjust for humidity
    if (forecastDay.humidity < 40) {
      duration *= 1.1; // More water needed in dry conditions
    }

    // Round to practical values
    duration = Math.round(duration * 2) / 2; // Round to nearest 0.5 hour
    duration = Math.max(0.5, Math.min(3, duration)); // Clamp between 0.5 and 3 hours

    // Estimate liters per hour (varies by irrigation method)
    const litersPerHour = 1000; // Approximate for drip/sprinkler

    return {
      hours: duration,
      litersPerHour,
    };
  }

  /**
   * Calculate water and cost savings
   */
  private calculateSavings(
    schedule: IrrigationSchedule[],
    soilType: SoilType
  ): { waterSavings: number; costSavings: number } {
    // Traditional farmers typically over-irrigate by 20-30%
    const overIrrigationRate = soilType.waterRetention === 'low' ? 0.25 : 0.30;

    // Calculate total scheduled water
    const totalScheduledWater = schedule.reduce(
      (sum, s) => sum + (s.isSkipped ? 0 : s.duration * s.waterAmount),
      0
    );

    // Calculate what traditional irrigation would use
    const traditionalWater = totalScheduledWater / (1 - overIrrigationRate);

    // Water savings percentage
    const waterSavings = Math.round((1 - totalScheduledWater / traditionalWater) * 100);

    // Cost savings (diesel/electricity)
    // Assume ₹50 per hour of irrigation (diesel/electricity cost)
    const totalHours = schedule.reduce((sum, s) => sum + (s.isSkipped ? 0 : s.duration), 0);
    const traditionalHours = totalHours / (1 - overIrrigationRate);
    const costSavings = Math.round((traditionalHours - totalHours) * 50);

    return {
      waterSavings: Math.min(waterSavings, 35), // Cap at 35%
      costSavings,
    };
  }

  /**
   * Generate actionable irrigation tips based on field conditions
   */
  private generateIrrigationTips(
    cropStage: CropStage,
    soilType: SoilType,
    weatherData: any
  ): string[] {
    const tips: string[] = [];

    // Soil-specific actionable tips
    if (soilType.waterRetention === 'low') {
      tips.push('🏖️ Sandy soil detected: Apply 5-7 cm mulch (straw/dry grass) to reduce evaporation by 30%. Water every 2 days instead of daily.');
      tips.push('💧 Split irrigation: Instead of 2 hours once, do 1 hour twice a day. Water penetrates better and reduces runoff.');
      tips.push('🌾 Add organic matter: Mix 2-3 tons compost per acre to improve water retention. Apply before next sowing.');
    } else if (soilType.waterRetention === 'high') {
      tips.push('🏔️ Clay soil detected: Water deeply but less frequently (every 4-5 days). Avoid daily watering - causes waterlogging and root rot.');
      tips.push('🚜 Break soil crust: Use light cultivation after irrigation to improve air circulation. Prevents anaerobic conditions.');
      tips.push('🌱 Check drainage: Dig 1-foot pit after irrigation. If water stays >6 hours, improve drainage with channels.');
    } else {
      tips.push('✅ Loamy soil - ideal! Maintain current irrigation schedule. Check moisture at 6-inch depth before watering.');
      tips.push('🌾 Preserve soil health: Add FYM (5 tons/acre) annually. Rotate crops. Avoid over-tilling.');
    }

    // Stage-specific critical tips
    if (cropStage.stage === 'flowering') {
      tips.push('🌸 FLOWERING STAGE - CRITICAL! Even 1 day of water stress reduces yield by 15-20%. Irrigate every 2-3 days. Don\'t skip!');
      tips.push('💧 Maintain 70-80% soil moisture. Check daily. If top 2 inches are dry, irrigate immediately. Use tensiometer if available.');
      tips.push('🚫 Don\'t apply nitrogen now - causes flower drop. Apply Potash (10kg/acre) and Boron (500g/acre) for better fruit set.');
    } else if (cropStage.stage === 'fruiting') {
      tips.push('🍅 FRUITING STAGE - CRITICAL! Water stress causes fruit cracking and reduces size. Maintain consistent moisture.');
      tips.push('💧 Irrigate when 50% of available water is used. For most soils, this is every 3-4 days. Don\'t let soil dry completely.');
      tips.push('🌾 Apply Calcium Nitrate (5kg/acre) with irrigation to prevent blossom end rot in tomatoes, peppers.');
    } else if (cropStage.stage === 'vegetative') {
      tips.push('🌱 Vegetative stage: Build strong root system. Water deeply (wet soil to 12 inches) but less frequently.');
      tips.push('💪 Slight water stress is OK - makes roots go deeper. But don\'t let plants wilt. Irrigate when leaves start drooping.');
    } else if (cropStage.stage === 'germination') {
      tips.push('🌱 Germination stage: Keep soil moist but not waterlogged. Light irrigation daily or alternate days.');
      tips.push('💧 Use sprinkler or rose can for gentle watering. Heavy irrigation washes away seeds. Maintain 80-90% moisture.');
    } else if (cropStage.stage === 'maturity') {
      tips.push('🌾 Maturity stage: Reduce irrigation gradually. Stop watering 7-10 days before harvest for better grain quality.');
      tips.push('⚠️ Excess water now causes lodging and delays harvest. Let crop mature naturally.');
    }

    // Weather-based practical tips
    const upcomingHeat = weatherData.forecast.some((d: any) => d.temp_max > 35);
    const upcomingRain = weatherData.forecast.some((d: any) => d.precipitation > 50);
    
    if (upcomingHeat) {
      tips.push('🔥 Heat wave coming: Increase irrigation by 20%. Water at 5-6 AM (best) or 6-7 PM. Wet the leaves in evening to cool plants.');
      tips.push('💨 Avoid 10 AM-4 PM irrigation: You lose 50% water to evaporation. That\'s ₹50 wasted per hour of pumping!');
      tips.push('🌾 Apply light mulch if not done. Even newspaper works! Reduces soil temperature by 5-7°C.');
    }

    if (upcomingRain) {
      tips.push('🌧️ Rain expected: Skip next irrigation. Save ₹50-100 on diesel/electricity. Let nature do the work!');
      tips.push('🚜 Check drainage channels before rain. Clear blockages. Prevent waterlogging which kills crops in 24 hours.');
    }

    // Irrigation method tips
    tips.push('💧 Drip irrigation saves 40-50% water vs flood. Initial cost ₹25,000/acre but recovers in 2 years. Government subsidy available (50-80%).');
    tips.push('🚿 Sprinkler saves 30-35% water. Good for vegetables, wheat. Cost ₹15,000/acre. Check with agriculture department for subsidy.');
    tips.push('🌊 If using flood irrigation: Make small basins. Water one basin at a time. Saves 20% water vs flooding entire field.');

    // Practical water-saving tips
    tips.push('📱 Set 2 alarms: One for start, one for stop. Farmers often forget and over-irrigate by 30-40%. Costs ₹30-50 extra per irrigation.');
    tips.push('✅ Soil moisture check: Dig 6 inches. Squeeze soil. If it forms ball and leaves moisture on hand = good. If dry and crumbly = irrigate now.');
    tips.push('🔧 Check for leaks: Walk along pipes/channels before starting. A small leak wastes 1000L per hour. That\'s ₹20-30 wasted!');

    // Timing optimization
    tips.push('⏰ Best irrigation times: 5-7 AM (best - cool, no wind, plants absorb well) or 6-8 PM (good but risk of fungal disease).');
    tips.push('🚫 Never irrigate: 10 AM-4 PM (50% evaporation), during strong wind (water doesn\'t reach roots), just before rain (waste of money).');

    // Cost-saving tips
    tips.push('💰 Track savings: Note diesel/electricity used. With this schedule, you should save ₹300-500 per week. If not, check for leaks or over-irrigation.');
    tips.push('📊 Compare with neighbor: If they irrigate daily and you follow schedule, you use 30% less water for same yield. That\'s ₹1,500-2,000 saved per month!');

    return tips;
  }

  /**
   * Generate actionable alerts for farmers
   */
  private generateAlerts(weatherData: any, schedule: IrrigationSchedule[]): string[] {
    const alerts: string[] = [];

    // Critical rain alerts with actions
    const heavyRainDays = weatherData.forecast.filter((d: any) => d.precipitation > 70);
    const moderateRainDays = weatherData.forecast.filter((d: any) => d.precipitation > 40 && d.precipitation <= 70);
    
    if (heavyRainDays.length > 0) {
      const rainDay = heavyRainDays[0].day;
      alerts.push(`🌧️ HEAVY RAIN ALERT: ${heavyRainDays.length} day(s) with >70% rain chance! ACTION: Clear drainage NOW. Harvest ripe crops today. Don't irrigate for 3 days. Save ₹${heavyRainDays.length * 50} on diesel!`);
    } else if (moderateRainDays.length > 0) {
      alerts.push(`🌦️ Rain likely in ${moderateRainDays.length} day(s) (40-70% chance). ACTION: Postpone fertilizer/pesticide spray. Skip irrigation. Check drainage channels.`);
    }

    // Critical heat alerts with actions
    const extremeHeatDays = weatherData.forecast.filter((d: any) => d.temp_max > 40);
    const hotDays = weatherData.forecast.filter((d: any) => d.temp_max > 38 && d.temp_max <= 40);
    
    if (extremeHeatDays.length > 0) {
      alerts.push(`🔥 EXTREME HEAT ALERT: ${extremeHeatDays[0].temp_max}°C expected! URGENT: Irrigate at 5 AM. Apply light irrigation at 7 PM too. Cover young plants with shade net. Spray water on leaves in evening.`);
    } else if (hotDays.length > 0) {
      alerts.push(`☀️ Heat Alert: ${hotDays.length} day(s) above 38°C. ACTION: Increase irrigation by 20%. Water only 5-7 AM or 6-8 PM. Apply mulch. Check plants twice daily.`);
    }

    // Cold/frost alerts
    const coldDays = weatherData.forecast.filter((d: any) => d.temp_min < 10);
    if (coldDays.length > 0) {
      alerts.push(`❄️ COLD ALERT: Temperature dropping to ${coldDays[0].temp_min}°C! URGENT: Cover crops with plastic/straw before sunset. Light smoke in field at 5 AM. Don't irrigate in morning.`);
    }

    // Wind alerts
    const windyDays = weatherData.forecast.filter((d: any) => d.wind_speed > 25);
    if (windyDays.length > 0) {
      alerts.push(`💨 WIND ALERT: Strong winds (>25 km/h) in ${windyDays.length} day(s). ACTION: Don't spray pesticides (waste ₹200-300). Stake tall plants. Cover nursery. Postpone drone operations.`);
    }

    // Water savings alert with money
    const skippedDays = schedule.filter(s => s.isSkipped).length;
    const irrigationDays = schedule.filter(s => !s.isSkipped).length;
    const savedMoney = skippedDays * 50; // ₹50 per irrigation saved
    
    if (skippedDays > 0) {
      alerts.push(`💰 SAVINGS ALERT: You'll skip irrigation on ${skippedDays} day(s) this week! Save ₹${savedMoney} on diesel/electricity. That's ${Math.round((skippedDays / 7) * 100)}% water saved!`);
    }

    // Optimal farming window alert
    const goodDays = weatherData.forecast.filter((d: any) => 
      d.temp_max >= 25 && d.temp_max <= 32 && 
      d.precipitation < 20 && 
      d.wind_speed < 15
    );
    if (goodDays.length > 0) {
      alerts.push(`✅ PERFECT WEATHER: ${goodDays.length} day(s) with ideal conditions! ACTION: Apply fertilizers, spray pesticides, transplant seedlings. Make most of this window!`);
    }

    // Disease risk alert
    const highHumidityDays = weatherData.forecast.filter((d: any) => d.humidity > 80);
    if (highHumidityDays.length > 2) {
      alerts.push(`🦠 DISEASE RISK: High humidity (>80%) for ${highHumidityDays.length} days. ACTION: Spray Mancozeb (2g/L) preventively. Remove infected leaves. Improve air circulation.`);
    }

    // Pest risk alert
    const hotDryDays = weatherData.forecast.filter((d: any) => d.temp_max > 32 && d.humidity < 50);
    if (hotDryDays.length > 2) {
      alerts.push(`🐛 PEST RISK: Hot & dry weather favors aphids, whiteflies. ACTION: Check undersides of leaves daily. Spray Neem oil (5ml/L) or Imidacloprid (0.3ml/L) in evening.`);
    }

    // Harvest window alert
    const goodHarvestDays = weatherData.forecast.filter((d: any) => 
      d.humidity < 60 && 
      d.precipitation < 10 && 
      d.wind_speed < 15
    );
    if (goodHarvestDays.length > 2) {
      alerts.push(`🌾 HARVEST WINDOW: ${goodHarvestDays.length} days with low humidity & no rain. ACTION: Harvest ripe crops. Dry immediately. Good for threshing. Store in moisture-proof bags.`);
    }

    // Fertilizer application window
    const goodFertilizerDays = weatherData.forecast.filter((d: any) => 
      d.temp_max >= 20 && d.temp_max <= 35 && 
      d.precipitation < 30 && 
      d.wind_speed < 15
    );
    if (goodFertilizerDays.length > 1 && irrigationDays > 0) {
      alerts.push(`🌱 FERTILIZER WINDOW: Good conditions for fertilizer application. ACTION: Apply with irrigation. Use split doses. Water immediately after. Don't apply if rain expected.`);
    }

    // Cost tracking alert
    const totalIrrigationHours = schedule.filter(s => !s.isSkipped).reduce((sum, s) => sum + s.duration, 0);
    const estimatedCost = Math.round(totalIrrigationHours * 50);
    alerts.push(`📊 WEEKLY COST: Estimated ₹${estimatedCost} for ${totalIrrigationHours.toFixed(1)} hours irrigation. Track actual cost. If higher, check for leaks or over-irrigation.`);

    return alerts;
  }

  /**
   * Get crop stage from sowing date
   */
  getCropStage(sowingDate: Date, cropType: string): CropStage {
    const daysFromSowing = Math.floor(
      (Date.now() - sowingDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Crop-specific growth stages (in days)
    const stages: { [key: string]: any } = {
      rice: [
        { stage: 'germination', days: 15, water: 'high' },
        { stage: 'vegetative', days: 40, water: 'very_high' },
        { stage: 'flowering', days: 30, water: 'very_high' },
        { stage: 'fruiting', days: 30, water: 'high' },
        { stage: 'maturity', days: 15, water: 'low' },
      ],
      wheat: [
        { stage: 'germination', days: 10, water: 'medium' },
        { stage: 'vegetative', days: 50, water: 'high' },
        { stage: 'flowering', days: 20, water: 'high' },
        { stage: 'fruiting', days: 30, water: 'medium' },
        { stage: 'maturity', days: 10, water: 'low' },
      ],
      default: [
        { stage: 'germination', days: 10, water: 'medium' },
        { stage: 'vegetative', days: 40, water: 'high' },
        { stage: 'flowering', days: 25, water: 'very_high' },
        { stage: 'fruiting', days: 30, water: 'high' },
        { stage: 'maturity', days: 15, water: 'low' },
      ],
    };

    const cropStages = stages[cropType.toLowerCase()] || stages.default;
    let cumulativeDays = 0;

    for (const stageInfo of cropStages) {
      cumulativeDays += stageInfo.days;
      if (daysFromSowing <= cumulativeDays) {
        return {
          stage: stageInfo.stage,
          waterRequirement: stageInfo.water,
          daysInStage: daysFromSowing - (cumulativeDays - stageInfo.days),
        };
      }
    }

    // Default to maturity if beyond all stages
    return {
      stage: 'maturity',
      waterRequirement: 'low',
      daysInStage: daysFromSowing - cumulativeDays,
    };
  }

  /**
   * Determine soil type from field data (BlackBox integration)
   */
  determineSoilType(soilData?: any): SoilType {
    // If we have comprehensive soil analysis data from BlackBox
    if (soilData) {
      // Check for texture field
      if (soilData.texture) {
        const texture = soilData.texture.toLowerCase();
        if (texture.includes('sand')) {
          return {
            type: 'sandy',
            waterRetention: 'low',
            drainageRate: 'fast',
          };
        } else if (texture.includes('clay')) {
          return {
            type: 'clay',
            waterRetention: 'high',
            drainageRate: 'slow',
          };
        } else if (texture.includes('silt')) {
          return {
            type: 'silt',
            waterRetention: 'medium',
            drainageRate: 'moderate',
          };
        } else if (texture.includes('loam')) {
          return {
            type: 'loamy',
            waterRetention: 'medium',
            drainageRate: 'moderate',
          };
        }
      }

      // Infer from soil moisture indicators (NDWI, NDMI, RSM)
      if (soilData.ndwi !== undefined || soilData.ndmi !== undefined || soilData.rsm !== undefined) {
        const moistureIndicator = soilData.rsm || soilData.ndmi || soilData.ndwi || 0;
        
        // High moisture retention (clay-like)
        if (moistureIndicator > 0.6) {
          return {
            type: 'clay',
            waterRetention: 'high',
            drainageRate: 'slow',
          };
        }
        // Low moisture retention (sandy)
        else if (moistureIndicator < 0.3) {
          return {
            type: 'sandy',
            waterRetention: 'low',
            drainageRate: 'fast',
          };
        }
      }

      // Infer from organic carbon (SOC)
      if (soilData.soc_vis !== undefined) {
        const soc = soilData.soc_vis;
        // High organic content suggests good loamy soil
        if (soc > 0.5) {
          return {
            type: 'loamy',
            waterRetention: 'medium',
            drainageRate: 'moderate',
          };
        }
      }
    }

    // Default to loamy soil (most common in India)
    return {
      type: 'loamy',
      waterRetention: 'medium',
      drainageRate: 'moderate',
    };
  }
}

// Create singleton instance
export const jalSaathiService = new JalSaathiService();
