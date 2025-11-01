/**
 * DiseaseDetectionService - API integration for plant disease analysis
 * Connects to Supabase Edge Function for disease detection
 */

import { blackBoxService } from './blackBoxService';

const DISEASE_API_BASE_URL = 'https://teejiieuaxzrucsttrid.supabase.co/functions/v1';
const DISEASE_API_KEY = 'pk_4af2789fa35a45d896311651f967b40c';
const DISEASE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWppaWV1YXh6cnVjc3R0cmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODYyMDQsImV4cCI6MjA3NTY2MjIwNH0.i6X9SMD1K7WId384sZcQVX3H-FB_2jZtLidwYp3qZjA';

export interface DiseaseAnalysisRequest {
  image: string; // Base64 encoded image with data URI prefix
  crop?: string;
  location?: string;
  symptoms?: string;
}

export interface DiseaseAnalysisResponse {
  disease_name: string;
  confidence: number;
  treatments: {
    cultural: string[];
    chemical: string[];
    organic: string[];
    ipm: string[];
  };
  yield_impact: string;
  recovery_chance: string;
  disease_stage?: string;
  spread_risk?: string;
  affected_parts?: string[];
  prevention_tips?: string[];
}

export interface DiseaseOutbreakRecord {
  fieldId: string;
  fieldName: string;
  disease_name: string;
  confidence: number;
  detected_at: string;
  image: string;
  treatments: DiseaseAnalysisResponse['treatments'];
  yield_impact: string;
  recovery_chance: string;
}

export class DiseaseDetectionService {
  private apiBaseUrl: string;
  private apiKey: string;
  private apiToken: string;

  constructor() {
    this.apiBaseUrl = DISEASE_API_BASE_URL;
    this.apiKey = DISEASE_API_KEY;
    this.apiToken = DISEASE_API_TOKEN;
  }

  /**
   * Analyze plant disease from image
   */
  async analyzeDisease(request: DiseaseAnalysisRequest): Promise<DiseaseAnalysisResponse> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze-disease`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Disease analysis failed: ${response.status} - ${errorText}`);
      }

      const result: DiseaseAnalysisResponse = await response.json();

      // Log successful analysis
      blackBoxService.logUserInteraction('button_click', 'disease_api_success', undefined, {
        disease_name: result.disease_name,
        confidence: result.confidence,
        yield_impact: result.yield_impact,
        timestamp: new Date().toISOString()
      });

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log API error
      blackBoxService.logError(
        'api_failure',
        errorMessage,
        undefined,
        'disease_analysis_api_call'
      );

      throw error;
    }
  }

  /**
   * Save disease outbreak to field's black box data
   */
  saveDiseaseOutbreak(
    fieldId: string,
    fieldName: string,
    diseaseData: DiseaseAnalysisResponse,
    imageUrl: string
  ): void {
    try {
      // Get existing field data from localStorage
      const fieldDataKey = `field_${fieldId}_data`;
      const existingData = JSON.parse(localStorage.getItem(fieldDataKey) || '{}');

      // Initialize disease_outbreaks array if it doesn't exist
      if (!existingData.disease_outbreaks) {
        existingData.disease_outbreaks = [];
      }

      // Create outbreak record
      const outbreakRecord: DiseaseOutbreakRecord = {
        fieldId,
        fieldName,
        disease_name: diseaseData.disease_name,
        confidence: diseaseData.confidence,
        detected_at: new Date().toISOString(),
        image: imageUrl,
        treatments: diseaseData.treatments,
        yield_impact: diseaseData.yield_impact,
        recovery_chance: diseaseData.recovery_chance,
      };

      // Add to disease outbreaks array
      existingData.disease_outbreaks.push(outbreakRecord);

      // Save back to localStorage
      localStorage.setItem(fieldDataKey, JSON.stringify(existingData));

      // Log to black box service
      blackBoxService.logUserInteraction('button_click', 'disease_outbreak_saved', fieldId, {
        disease_name: diseaseData.disease_name,
        confidence: diseaseData.confidence,
        fieldName,
        timestamp: new Date().toISOString()
      });

      console.log('Disease outbreak saved to field:', fieldId, outbreakRecord);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      blackBoxService.logError(
        'component_error',
        errorMessage,
        fieldId,
        'save_disease_outbreak'
      );
      throw error;
    }
  }

  /**
   * Get disease outbreak history for a field
   */
  getDiseaseOutbreaks(fieldId: string): DiseaseOutbreakRecord[] {
    try {
      const fieldDataKey = `field_${fieldId}_data`;
      const fieldData = JSON.parse(localStorage.getItem(fieldDataKey) || '{}');
      return fieldData.disease_outbreaks || [];
    } catch (error) {
      console.error('Failed to get disease outbreaks:', error);
      return [];
    }
  }

  /**
   * Get all fields with disease outbreaks
   */
  getAllFieldsWithDiseases(): { fieldId: string; outbreaks: DiseaseOutbreakRecord[] }[] {
    try {
      const fields: { fieldId: string; outbreaks: DiseaseOutbreakRecord[] }[] = [];
      
      // Iterate through localStorage to find all field data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('field_') && key.endsWith('_data')) {
          const fieldData = JSON.parse(localStorage.getItem(key) || '{}');
          if (fieldData.disease_outbreaks && fieldData.disease_outbreaks.length > 0) {
            const fieldId = key.replace('field_', '').replace('_data', '');
            fields.push({
              fieldId,
              outbreaks: fieldData.disease_outbreaks
            });
          }
        }
      }

      return fields;
    } catch (error) {
      console.error('Failed to get fields with diseases:', error);
      return [];
    }
  }
}

// Create singleton instance
export const diseaseDetectionService = new DiseaseDetectionService();
