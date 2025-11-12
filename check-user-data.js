import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oislgcwardyvphznqoku.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pc2xnY3dhcmR5dnBoem5xb2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMDQ1NTgsImV4cCI6MjA3NzU4MDU1OH0.hJCvKI8Qs4tAkWBa4xKakmQs90xrhdRDQ6MkStiAzKA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUserData() {
  try {
    console.log('🔍 Checking authentication status...');

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('❌ Authentication error:', authError.message);
      return;
    }

    if (!user) {
      console.log('❌ No user logged in. Please log in to the app first.');
      return;
    }

    console.log('✅ User authenticated:', user.email);
    console.log('🆔 User ID:', user.id);

    // Check fields
    console.log('\n🏞️ Checking fields...');
    const { data: fields, error: fieldsError } = await supabase
      .from('fields')
      .select('*')
      .eq('user_id', user.id);

    if (fieldsError) {
      console.log('❌ Error fetching fields:', fieldsError.message);
    } else {
      console.log(`✅ Found ${fields.length} fields:`);
      fields.forEach(field => {
        console.log(`  - ${field.name} (${field.crop_type}, ${field.area} acres)`);
      });
    }

    // Check field data
    console.log('\n📊 Checking field data...');
    const { data: fieldData, error: dataError } = await supabase
      .from('field_data')
      .select('*')
      .eq('field_id', fields[0]?.id)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (dataError) {
      console.log('❌ Error fetching field data:', dataError.message);
    } else {
      console.log(`✅ Found ${fieldData.length} recent data points`);
      if (fieldData.length > 0) {
        console.log('📈 Latest data:', {
          ndvi: fieldData[0].ndvi,
          health_score: fieldData[0].health_score,
          timestamp: fieldData[0].timestamp
        });
      }
    }

    // Check disease detections
    console.log('\n🦠 Checking disease detections...');
    const { data: diseases, error: diseaseError } = await supabase
      .from('disease_detections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (diseaseError) {
      console.log('❌ Error fetching disease data:', diseaseError.message);
    } else {
      console.log(`✅ Found ${diseases.length} disease detections`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserData();
