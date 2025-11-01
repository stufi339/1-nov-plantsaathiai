import { supabase } from './supabase';
import { blackBoxService } from './blackBoxService';

/**
 * Supabase Analytics Service
 * Syncs BlackBox analytics data to Supabase for persistence and analysis
 */
export const supabaseAnalyticsService = {
  /**
   * Log analytics event to both BlackBox and Supabase
   */
  async logEvent(eventType: string, eventData: any) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Log to BlackBox (real-time) - using correct method
      blackBoxService.logUserInteraction(
        eventType as any,
        'analytics_event',
        undefined,
        eventData
      );
      
      // Log to Supabase (persistent storage)
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          user_id: user?.id || null,
          event_type: eventType,
          event_data: eventData
        }]);
      
      if (error) {
        console.error('Error logging to Supabase:', error);
      }
    } catch (error) {
      console.error('Analytics logging error:', error);
    }
  },

  /**
   * Get analytics for current user
   */
  async getUserAnalytics(limit = 100) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching analytics:', error);
      return [];
    }

    return data || [];
  },

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Get event counts by type
    const { data, error } = await supabase
      .from('analytics_events')
      .select('event_type')
      .eq('user_id', user.id);

    if (error) return null;

    // Count events by type
    const summary = data.reduce((acc: any, event: any) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {});

    return summary;
  },

  /**
   * Sync BlackBox data to Supabase (batch operation)
   */
  async syncBlackBoxData() {
    try {
      // Get BlackBox analytics summary
      const blackBoxData = blackBoxService.getAnalyticsSummary();
      
      if (!blackBoxData) return;

      // Log summary as a single event
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          event_type: 'blackbox_sync',
          event_data: blackBoxData
        }]);

      if (error) {
        console.error('Batch sync error:', error);
      }
    } catch (error) {
      console.error('BlackBox sync error:', error);
    }
  }
};
