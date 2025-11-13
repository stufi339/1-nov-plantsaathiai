import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oislgcwardyvphznqoku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc2xnY3dhcmR5dnBoem5xb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDQ1NTgsImV4cCI6MjA3NzU4MDU1OH0.hJCvKI8Qs4tAkWBa4xKakmQs90xrhdRDQ6MkStiAzKA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Field {
  id: string;
  user_id: string;
  name: string;
  location: string;
  crop_type: string;
  area: number;
  coordinates: any;
  status?: 'active' | 'harvested' | 'dormant';
  harvest_date?: string;
  last_crop_type?: string;
  reactivation_date?: string;
  lifecycle_metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface FieldData {
  id: string;
  field_id: string;
  ndvi: number;
  ndwi: number;
  evi: number;
  soil_moisture: number;
  temperature: number;
  health_score: number;
  timestamp: string;
  created_at: string;
}

export interface DiseaseDetection {
  id: string;
  user_id: string;
  field_id?: string;
  image_url: string;
  disease_name: string;
  confidence: number;
  severity: string;
  recommendations: any;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string;
  affiliate_link?: string;
  tags: string[];
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: any;
  total: number;
  status: string;
  created_at: string;
}
