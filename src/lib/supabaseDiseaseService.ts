import { supabase, DiseaseDetection } from './supabase';

export const supabaseDiseaseService = {
  // Save disease detection
  async saveDiseaseDetection(detection: Omit<DiseaseDetection, 'id' | 'user_id' | 'created_at'>): Promise<DiseaseDetection | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('disease_detections')
      .insert([{ ...detection, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error saving disease detection:', error);
      return null;
    }

    return data;
  },

  // Get disease detection history
  async getDiseaseHistory(limit = 50): Promise<DiseaseDetection[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('disease_detections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching disease history:', error);
      return [];
    }

    return data || [];
  },

  // Get detections for specific field
  async getFieldDiseaseHistory(fieldId: string): Promise<DiseaseDetection[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('disease_detections')
      .select('*')
      .eq('user_id', user.id)
      .eq('field_id', fieldId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching field disease history:', error);
      return [];
    }

    return data || [];
  }
};
