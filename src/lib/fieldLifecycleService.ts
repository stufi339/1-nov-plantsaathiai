/**
 * Field Lifecycle Management Service
 * 
 * Manages field states: Active → Harvested → Dormant → Active
 * Optimizes costs by stopping satellite data fetching for inactive fields
 * Provides intelligent harvest detection and reactivation workflows
 */

import { supabase } from './supabase';
import { fieldDataCacheService } from './fieldDataCacheService';

export type FieldStatus = 'active' | 'harvested' | 'dormant';

export interface FieldLifecycleMetadata {
  peakNDVI?: number;
  peakNDRE?: number;
  harvestDetectionDate?: string;
  harvestConfirmedDate?: string;
  dormantUntil?: string;
  reactivationReason?: string;
  previousCropYield?: number;
  notes?: string;
}

export interface FieldLifecycleEvent {
  id: string;
  field_id: string;
  event_type: 'created' | 'activated' | 'harvest_detected' | 'harvest_confirmed' | 'dormant' | 'reactivated';
  from_status?: FieldStatus;
  to_status: FieldStatus;
  metadata?: any;
  created_at: string;
}

export interface HarvestCandidate {
  fieldId: string;
  fieldName: string;
  currentNDVI: number;
  currentNDRE: number;
  peakNDVI: number;
  peakNDRE: number;
  ndviDropPercent: number;
  ndreDropPercent: number;
  consecutiveDays: number;
  detectedDate: string;
  confidence: 'high' | 'medium' | 'low';
}

class FieldLifecycleService {
  // Configuration
  private readonly HARVEST_THRESHOLD = 0.60; // 60% of peak
  private readonly SUSTAIN_DAYS = 5; // Minimum consecutive days
  private readonly DORMANT_LOCK_DAYS = 21; // Minimum dormant period
  private readonly RAPID_RESOW_DAYS = 14; // Monitor for rapid re-sowing

  /**
   * Check if field should fetch satellite data
   * Returns false for harvested/dormant fields to save costs
   */
  shouldFetchData(status: FieldStatus): boolean {
    return status === 'active';
  }

  /**
   * Detect harvest candidates using dual-index rule
   * NDVI + NDRE both ≤60% of season peak for 5-7 consecutive days
   */
  async detectHarvestCandidates(): Promise<HarvestCandidate[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get all active fields
      const { data: fields } = await supabase
        .from('fields')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!fields || fields.length === 0) return [];

      const candidates: HarvestCandidate[] = [];

      for (const field of fields) {
        // Get field data history (last 30 days)
        const { data: fieldData } = await supabase
          .from('field_data')
          .select('*')
          .eq('field_id', field.id)
          .order('timestamp', { ascending: false })
          .limit(30);

        if (!fieldData || fieldData.length < this.SUSTAIN_DAYS) continue;

        // Calculate peak values
        const peakNDVI = Math.max(...fieldData.map(d => d.ndvi || 0));
        const peakNDRE = Math.max(...fieldData.map(d => d.ndre || d.ndvi * 0.85 || 0));

        // Check recent consecutive days
        const recentData = fieldData.slice(0, this.SUSTAIN_DAYS);
        const allBelowThreshold = recentData.every(d => {
          const ndvi = d.ndvi || 0;
          const ndre = d.ndre || ndvi * 0.85;
          return (
            ndvi <= peakNDVI * this.HARVEST_THRESHOLD &&
            ndre <= peakNDRE * this.HARVEST_THRESHOLD
          );
        });

        if (allBelowThreshold) {
          const latestData = recentData[0];
          const currentNDVI = latestData.ndvi || 0;
          const currentNDRE = latestData.ndre || currentNDVI * 0.85;

          const ndviDropPercent = ((peakNDVI - currentNDVI) / peakNDVI) * 100;
          const ndreDropPercent = ((peakNDRE - currentNDRE) / peakNDRE) * 100;

          // Determine confidence based on drop percentage
          let confidence: 'high' | 'medium' | 'low' = 'medium';
          if (ndviDropPercent > 50 && ndreDropPercent > 50) {
            confidence = 'high';
          } else if (ndviDropPercent < 35 || ndreDropPercent < 35) {
            confidence = 'low';
          }

          candidates.push({
            fieldId: field.id,
            fieldName: field.name,
            currentNDVI,
            currentNDRE,
            peakNDVI,
            peakNDRE,
            ndviDropPercent,
            ndreDropPercent,
            consecutiveDays: this.SUSTAIN_DAYS,
            detectedDate: new Date().toISOString(),
            confidence
          });
        }
      }

      return candidates;
    } catch (error) {
      console.error('Error detecting harvest candidates:', error);
      return [];
    }
  }

  /**
   * Confirm harvest and transition field to harvested state
   */
  async confirmHarvest(
    fieldId: string,
    metadata?: Partial<FieldLifecycleMetadata>
  ): Promise<boolean> {
    try {
      const { data: field } = await supabase
        .from('fields')
        .select('*')
        .eq('id', fieldId)
        .single();

      if (!field) return false;

      const now = new Date();
      const dormantUntil = new Date(now.getTime() + this.DORMANT_LOCK_DAYS * 24 * 60 * 60 * 1000);

      // Update field status
      const lifecycleMetadata: FieldLifecycleMetadata = {
        ...metadata,
        harvestConfirmedDate: now.toISOString(),
        dormantUntil: dormantUntil.toISOString()
      };

      const { error: updateError } = await supabase
        .from('fields')
        .update({
          status: 'harvested',
          harvest_date: now.toISOString(),
          last_crop_type: field.crop_type,
          lifecycle_metadata: lifecycleMetadata
        })
        .eq('id', fieldId);

      if (updateError) throw updateError;

      // Log lifecycle event
      await this.logLifecycleEvent(
        fieldId,
        'harvest_confirmed',
        'active',
        'harvested',
        { ...metadata, autoDetected: false }
      );

      // Compress cache on harvest
      fieldDataCacheService.clearCache(fieldId);

      console.log(`✅ Field ${fieldId} marked as harvested, dormant until ${dormantUntil.toLocaleDateString()}`);
      return true;
    } catch (error) {
      console.error('Error confirming harvest:', error);
      return false;
    }
  }

  /**
   * Transition field to dormant state after harvest
   */
  async transitionToDormant(fieldId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('fields')
        .update({ status: 'dormant' })
        .eq('id', fieldId)
        .eq('status', 'harvested');

      if (error) throw error;

      await this.logLifecycleEvent(fieldId, 'dormant', 'harvested', 'dormant');

      console.log(`✅ Field ${fieldId} transitioned to dormant`);
      return true;
    } catch (error) {
      console.error('Error transitioning to dormant:', error);
      return false;
    }
  }

  /**
   * Reactivate field for new crop
   */
  async reactivateField(
    fieldId: string,
    newCropType: string,
    metadata?: Partial<FieldLifecycleMetadata>
  ): Promise<boolean> {
    try {
      const { data: field } = await supabase
        .from('fields')
        .select('*')
        .eq('id', fieldId)
        .single();

      if (!field) return false;

      // Check if dormant lock period has passed
      const lifecycleMetadata = field.lifecycle_metadata as FieldLifecycleMetadata;
      if (lifecycleMetadata?.dormantUntil) {
        const dormantUntil = new Date(lifecycleMetadata.dormantUntil);
        const now = new Date();
        
        if (now < dormantUntil) {
          const daysRemaining = Math.ceil((dormantUntil.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          console.warn(`⚠️ Field still in dormant lock period. ${daysRemaining} days remaining.`);
          // Allow override but log warning
        }
      }

      const reactivationMetadata: FieldLifecycleMetadata = {
        ...lifecycleMetadata,
        ...metadata,
        reactivationReason: metadata?.reactivationReason || 'New crop sowing'
      };

      const { error } = await supabase
        .from('fields')
        .update({
          status: 'active',
          crop_type: newCropType,
          reactivation_date: new Date().toISOString(),
          lifecycle_metadata: reactivationMetadata
        })
        .eq('id', fieldId);

      if (error) throw error;

      await this.logLifecycleEvent(
        fieldId,
        'reactivated',
        field.status,
        'active',
        { newCropType, ...metadata }
      );

      // Clear old cache for fresh data
      fieldDataCacheService.clearCache(fieldId);

      console.log(`✅ Field ${fieldId} reactivated with crop: ${newCropType}`);
      return true;
    } catch (error) {
      console.error('Error reactivating field:', error);
      return false;
    }
  }

  /**
   * Check for rapid re-sowing (multi-cropping detection)
   */
  async checkRapidResowing(fieldId: string): Promise<boolean> {
    try {
      // Get recent field data
      const { data: fieldData } = await supabase
        .from('field_data')
        .select('*')
        .eq('field_id', fieldId)
        .order('timestamp', { ascending: false })
        .limit(this.RAPID_RESOW_DAYS);

      if (!fieldData || fieldData.length < 7) return false;

      // Check if NDVI is rising steadily (new crop growth)
      const recentData = fieldData.slice(0, 7);
      let risingTrend = 0;

      for (let i = 0; i < recentData.length - 1; i++) {
        if (recentData[i].ndvi > recentData[i + 1].ndvi) {
          risingTrend++;
        }
      }

      // If 5+ out of 7 days show rising NDVI, likely new crop
      return risingTrend >= 5;
    } catch (error) {
      console.error('Error checking rapid resowing:', error);
      return false;
    }
  }

  /**
   * Get field lifecycle history
   */
  async getLifecycleHistory(fieldId: string): Promise<FieldLifecycleEvent[]> {
    try {
      const { data, error } = await supabase
        .from('field_lifecycle_events')
        .select('*')
        .eq('field_id', fieldId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching lifecycle history:', error);
      return [];
    }
  }

  /**
   * Log lifecycle event
   */
  private async logLifecycleEvent(
    fieldId: string,
    eventType: FieldLifecycleEvent['event_type'],
    fromStatus: FieldStatus | undefined,
    toStatus: FieldStatus,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('field_lifecycle_events')
        .insert([{
          field_id: fieldId,
          event_type: eventType,
          from_status: fromStatus,
          to_status: toStatus,
          metadata
        }]);
    } catch (error) {
      console.error('Error logging lifecycle event:', error);
    }
  }

  /**
   * Get fields that need monitoring (active + rapid resow check for harvested)
   */
  async getFieldsForMonitoring(): Promise<string[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get active fields
      const { data: activeFields } = await supabase
        .from('fields')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Get recently harvested fields (within rapid resow window)
      const rapidResowDate = new Date();
      rapidResowDate.setDate(rapidResowDate.getDate() - this.RAPID_RESOW_DAYS);

      const { data: recentlyHarvested } = await supabase
        .from('fields')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'harvested')
        .gte('harvest_date', rapidResowDate.toISOString());

      const fieldIds = [
        ...(activeFields || []).map(f => f.id),
        ...(recentlyHarvested || []).map(f => f.id)
      ];

      return fieldIds;
    } catch (error) {
      console.error('Error getting fields for monitoring:', error);
      return [];
    }
  }

  /**
   * Get cost savings statistics
   */
  async getCostSavingsStats(): Promise<{
    totalFields: number;
    activeFields: number;
    inactiveFields: number;
    estimatedSavingsPercent: number;
  }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalFields: 0, activeFields: 0, inactiveFields: 0, estimatedSavingsPercent: 0 };

      const { data: fields } = await supabase
        .from('fields')
        .select('status')
        .eq('user_id', user.id);

      if (!fields) return { totalFields: 0, activeFields: 0, inactiveFields: 0, estimatedSavingsPercent: 0 };

      const totalFields = fields.length;
      const activeFields = fields.filter(f => f.status === 'active').length;
      const inactiveFields = totalFields - activeFields;

      // Estimate 60-80% cost reduction for inactive fields
      const estimatedSavingsPercent = totalFields > 0 
        ? Math.round((inactiveFields / totalFields) * 70) 
        : 0;

      return {
        totalFields,
        activeFields,
        inactiveFields,
        estimatedSavingsPercent
      };
    } catch (error) {
      console.error('Error calculating cost savings:', error);
      return { totalFields: 0, activeFields: 0, inactiveFields: 0, estimatedSavingsPercent: 0 };
    }
  }
}

export const fieldLifecycleService = new FieldLifecycleService();
