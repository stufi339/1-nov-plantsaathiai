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
      
      // Log to BlackBox (real-time)
      await blackBoxService.logEvent(eventType, eventData);
      
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
      // Get BlackBox analytics
      const blackBoxData = await blackBoxService.getAnalytics();
      
      if (!blackBoxData || !blackBoxData.events) return;

      // Batch insert to Supabase
      const events = blackBoxData.events.map((event: any) => ({
        event_type: event.type,
        event_data: event.data,
        created_at: event.timestamp
      }));

      const { error } = await supabase
        .from('analytics_events')
        .insert(events);

      if (error) {
        console.error('Batch sync error:', error);
      }
    } catch (error) {
      console.error('BlackBox sync error:', error);
    }
  }
};
