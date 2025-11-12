import { supabaseFieldService } from './supabaseFieldService';
import { supabase } from './supabase';

/**
 * Migrate fields from localStorage to Supabase
 * This preserves all your existing field data
 */
export const migrateLocalStorageToSupabase = async () => {
  try {
    console.log('🔄 Starting migration from localStorage to Supabase...');

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('❌ User not authenticated. Please log in first.');
      return { success: false, error: 'Not authenticated' };
    }

    // Load fields from localStorage
    const fieldsListStr = localStorage.getItem('fields_list');
    if (!fieldsListStr) {
      console.log('ℹ️ No fields found in localStorage');
      return { success: true, migrated: 0, message: 'No fields to migrate' };
    }

    const fieldsList = JSON.parse(fieldsListStr);
    console.log(`📦 Found ${fieldsList.length} fields in localStorage`);

    let migratedCount = 0;
    let errors: any[] = [];

    // Migrate each field
    for (const localField of fieldsList) {
      try {
        console.log(`📤 Migrating field: ${localField.name}`);

        // Create field in Supabase
        const newField = await supabaseFieldService.createField({
          name: localField.name,
          location: localField.location || 'Unknown',
          crop_type: localField.cropType || 'rice',
          area: localField.area || 0,
          coordinates: localField.coordinates || localField.polygon || null
        });

        if (!newField) {
          throw new Error('Failed to create field in Supabase');
        }

        // Load field data from localStorage
        const fieldDataKey = `field_${localField.id}_data`;
        const fieldDataStr = localStorage.getItem(fieldDataKey);
        
        if (fieldDataStr) {
          const fieldData = JSON.parse(fieldDataStr);
          
          // Save field data to Supabase
          await supabaseFieldService.saveFieldData(newField.id, {
            ndvi: fieldData.health?.ndvi || fieldData.ndvi || 0.5,
            ndwi: fieldData.ndwi || 0.3,
            evi: fieldData.evi || 0.4,
            soil_moisture: fieldData.moisture || fieldData.soilData?.moisture || 0.5,
            temperature: fieldData.temperature || fieldData.soilData?.temperature || 25,
            health_score: fieldData.health?.ndvi || fieldData.ndvi || 0.5,
            timestamp: fieldData.timestamp || new Date().toISOString()
          });

          console.log(`✅ Migrated field data for: ${localField.name}`);
        }

        migratedCount++;
      } catch (error) {
        console.error(`❌ Failed to migrate field ${localField.name}:`, error);
        errors.push({ field: localField.name, error });
      }
    }

    console.log(`✅ Migration complete! Migrated ${migratedCount}/${fieldsList.length} fields`);

    return {
      success: true,
      migrated: migratedCount,
      total: fieldsList.length,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error };
  }
};

/**
 * Check if migration is needed
 */
export const needsMigration = async () => {
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if there are fields in localStorage
    const fieldsListStr = localStorage.getItem('fields_list');
    if (!fieldsListStr) return false;

    const fieldsList = JSON.parse(fieldsListStr);
    if (fieldsList.length === 0) return false;

    // Check if there are fields in Supabase
    const supabaseFields = await supabaseFieldService.getFields();
    
    // If localStorage has fields but Supabase doesn't, migration is needed
    return fieldsList.length > 0 && supabaseFields.length === 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
};
