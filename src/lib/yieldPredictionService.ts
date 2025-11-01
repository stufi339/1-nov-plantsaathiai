/**
 * YieldPredictionService - Handles yield prediction API integration
 * Provides field data preparation and API communication for yield predictions
 */

import { yieldPredictionAPI } from './apiService';

export interface FieldData {
  field_id: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  crop_type: string;
  planting_date: string;
  variety?: string;
  field_size: number; // hectares
  soil_type?: string;
  irrigation_type?: string;
  growth_stage?: number; // percentage completion
}

export interface YieldPredictionResponse {
  predicted_yield: number;
  confidence: number;
  prediction_range: {
    lower_bound: number;
    upper_bound: number;
  };
  variety_info?: {
    variety_name: string;
    maturity_days: number;
    yield_potential: number;
    drought_tolerance: "Low" | "Medium" | "High";
  };
  environmental_factors?: {
    temperature_adjustment: number;
    rainfall_adjustment: number;
    soil_moisture_adjustment: number;
    pest_pressure_adjustment: number;
  };
  data_quality: number;
  prediction_timestamp: string;
}

export class YieldPredictionService {
  /**
   * Prepare field data from Supabase or mock data
   */
  static async prepareFieldData(fieldId: string): Promise<FieldData> {
    // TODO: Replace with actual Supabase query when backend is available
    // For now, return mock field data based on fieldId
    
    const mockFieldData: Record<string, FieldData> = {
      'field-001': {
        field_id: fieldId,
        coordinates: {
          latitude: 28.6139, // Delhi, India
          longitude: 77.2090
        },
        crop_type: "rice",
        planting_date: "2024-06-15",
        variety: "IR64",
        field_size: 2.5,
        soil_type: "clay_loam",
        irrigation_type: "flood",
        growth_stage: 85
      },
      'field-002': {
        field_id: fieldId,
        coordinates: {
          latitude: 19.0760, // Mumbai, India
          longitude: 72.8777
        },
        crop_type: "wheat",
        planting_date: "2024-11-20",
        variety: "HD2967",
        field_size: 1.8,
        soil_type: "sandy_loam",
        irrigation_type: "drip",
        growth_stage: 92
      }
    };

    return mockFieldData[fieldId] || mockFieldData['field-001'];
  }

  /**
   * Get yield prediction from API
   */
  static async getPrediction(fieldId: string): Promise<YieldPredictionResponse> {
    try {
      // Prepare field data
      const fieldData = await this.prepareFieldData(fieldId);

      // Validate field data
      this.validateFieldData(fieldData);

      // Make API call
      const response = await yieldPredictionAPI.post<YieldPredictionResponse>(
        '/predict/field-analysis',
        fieldData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Add timeout for API calls
          signal: AbortSignal.timeout(30000) // 30 second timeout
        }
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to get yield prediction');
      }
    } catch (error) {
      console.error('Yield prediction service error:', error);
      
      // Return mock data as fallback
      return this.getMockPrediction(fieldId);
    }
  }

  /**
   * Validate field data before API call
   */
  private static validateFieldData(fieldData: FieldData): void {
    const requiredFields = ['field_id', 'coordinates', 'crop_type', 'planting_date', 'field_size'];
    
    for (const field of requiredFields) {
      if (!fieldData[field as keyof FieldData]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate coordinates
    const { latitude, longitude } = fieldData.coordinates;
    if (latitude < -90 || latitude > 90) {
      throw new Error('Invalid latitude value');
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Invalid longitude value');
    }

    // Validate field size
    if (fieldData.field_size <= 0) {
      throw new Error('Field size must be greater than 0');
    }

    // Validate planting date
    const plantingDate = new Date(fieldData.planting_date);
    if (isNaN(plantingDate.getTime())) {
      throw new Error('Invalid planting date format');
    }
  }

  /**
   * Get mock prediction data for development and fallback
   */
  private static getMockPrediction(fieldId: string): YieldPredictionResponse {
    const mockPredictions: Record<string, YieldPredictionResponse> = {
      'field-001': {
        predicted_yield: 4.2,
        confidence: 0.85,
        prediction_range: {
          lower_bound: 3.8,
          upper_bound: 4.6
        },
        variety_info: {
          variety_name: "IR64 (High Yield)",
          maturity_days: 115,
          yield_potential: 5.0,
          drought_tolerance: "Medium"
        },
        environmental_factors: {
          temperature_adjustment: 0.95,
          rainfall_adjustment: 1.02,
          soil_moisture_adjustment: 0.98,
          pest_pressure_adjustment: 0.92
        },
        data_quality: 0.88,
        prediction_timestamp: new Date().toISOString()
      },
      'field-002': {
        predicted_yield: 3.8,
        confidence: 0.78,
        prediction_range: {
          lower_bound: 3.4,
          upper_bound: 4.2
        },
        variety_info: {
          variety_name: "HD2967 (Wheat)",
          maturity_days: 125,
          yield_potential: 4.5,
          drought_tolerance: "High"
        },
        environmental_factors: {
          temperature_adjustment: 1.05,
          rainfall_adjustment: 0.88,
          soil_moisture_adjustment: 1.12,
          pest_pressure_adjustment: 0.96
        },
        data_quality: 0.82,
        prediction_timestamp: new Date().toISOString()
      }
    };

    return mockPredictions[fieldId] || mockPredictions['field-001'];
  }

  /**
   * Refresh prediction with updated data
   */
  static async refreshPrediction(fieldId: string): Promise<YieldPredictionResponse> {
    // Add a small delay to simulate API processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return this.getPrediction(fieldId);
  }

  /**
   * Check if field is eligible for yield prediction
   */
  static async isEligibleForPrediction(fieldId: string): Promise<boolean> {
    try {
      const fieldData = await this.prepareFieldData(fieldId);
      
      // Check if growth stage is at least 85%
      if (fieldData.growth_stage && fieldData.growth_stage >= 85) {
        return true;
      }

      // Check if planting date is old enough (at least 60 days ago)
      const plantingDate = new Date(fieldData.planting_date);
      const daysSincePlanting = (Date.now() - plantingDate.getTime()) / (1000 * 60 * 60 * 24);
      
      return daysSincePlanting >= 60;
    } catch (error) {
      console.error('Error checking prediction eligibility:', error);
      return false;
    }
  }
}