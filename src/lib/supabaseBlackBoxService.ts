import { supabase } from './supabase';
import { blackBoxService } from './blackBoxService';

export interface BlackBoxSyncEvent {
  sessionId: string;
  eventTime: string;
  eventType: string;
  payload: any;
}

/**
 * Supabase-backed sync for BlackBox events.
 * Minimal: batches logs and sends them in one call.
 * Assumes caller ensures user is authenticated when using persistent memory.
 */
export class SupabaseBlackBoxService {
  /**
   * Sync a batch of events to Supabase blackbox_events.
   * - Uses a single bulk insert for efficiency.
   * - Server-side RLS ensures user_id scoping via auth token.
   */
  static async syncEvents(events: BlackBoxSyncEvent[]): Promise<{ stored: number }> {
    if (!events.length) return { stored: 0 };

    // Check if user is authenticated first
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('BlackBox sync skipped: user not authenticated');
      return { stored: 0 };
    }

    const mapped = events.map((e) => ({
      session_id: e.sessionId,
      event_time: e.eventTime,
      event_type: e.eventType,
      source_app: 'plant-saathi-web',
      payload: e.payload
    }));

    const { error, count } = await supabase
      .from('blackbox_events')
      .insert(mapped, { count: 'exact' });

    if (error) {
      console.error('BlackBox Supabase sync failed:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    return { stored: count ?? events.length };
  }

  /**
   * Example helper: flush all local BlackBox logs for current session to Supabase.
   * You can call this:
   * - After login
   * - Periodically
   * - On explicit "save memory" action
   *
   * NOTE:
   * - This reads from blackBoxService public APIs (exportLogs / getAllLogs)
   *   and transforms into generic events.
   * - Adjust mapping as needed to reflect actual log types.
   */
  static async flushCurrentSession(): Promise<{ stored: number }> {
    try {
      // Check if user is authenticated first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('BlackBox flush skipped: user not authenticated');
        return { stored: 0 };
      }

      const exportJson = JSON.parse(blackBoxService.exportLogs());
      const { sessionInfo, logs } = exportJson;

      const events: BlackBoxSyncEvent[] = [];

      // Vegetation indices
      (logs.vegetationIndices || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'vegetation_indices',
          payload: log
        });
      });

      // Field access
      (logs.fieldAccess || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'field_access',
          payload: log
        });
      });

      // User interactions
      (logs.userInteractions || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'user_interaction',
          payload: log
        });
      });

      // Audio interactions
      (logs.audioInteractions || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'audio_interaction',
          payload: log
        });
      });

      // Errors
      (logs.errors || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'error',
          payload: log
        });
      });

      // Feedback
      (logs.feedback || []).forEach((log: any) => {
        events.push({
          sessionId: sessionInfo.sessionId,
          eventTime: log.timestamp,
          eventType: 'user_feedback',
          payload: log
        });
      });

      if (!events.length) {
        return { stored: 0 };
      }

      const result = await SupabaseBlackBoxService.syncEvents(events);

      // Optional: clear local logs for this session after successful sync
      // to avoid duplicate uploads and free space.
      blackBoxService.clearLogs();

      return result;
    } catch (error: any) {
      console.error('BlackBox flushCurrentSession failed:', {
        message: error?.message || 'Unknown error',
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      return { stored: 0 };
    }
  }
}

export const supabaseBlackBoxService = SupabaseBlackBoxService;
