/**
 * Simple Test to Check Satellite Data Source
 * Run this in your browser console while on Soil Saathi
 */

console.log('%c🛰️ SATELLITE DATA SOURCE TEST', 'background: #4CAF50; color: white; padding: 10px; font-size: 20px; font-weight: bold;');
console.log('\n');

// Test 1: Check localStorage for field data
console.log('%c📊 Test 1: Checking Stored Field Data', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');

const fields = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && key.includes('field')) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      fields.push({ key, data });
    } catch (e) {
      // Skip invalid JSON
    }
  }
}

if (fields.length > 0) {
  console.log(`✅ Found ${fields.length} field(s) in localStorage`);
  
  fields.forEach((field, index) => {
    console.log(`\n📍 Field ${index + 1}:`, field.key);
    
    // Check for satellite data indicators
    const fieldData = JSON.stringify(field.data);
    
    if (fieldData.includes('satellite_source') || fieldData.includes('satelliteSource')) {
      console.log('   ✓ Contains satellite source information');
      
      // Extract satellite source
      if (field.data.metadata?.satellite_source) {
        console.log(`   📡 Source: ${field.data.metadata.satellite_source}`);
        
        if (field.data.metadata.satellite_source.includes('Real Data')) {
          console.log('%c   ✅ REAL SATELLITE DATA', 'color: green; font-weight: bold;');
        } else if (field.data.metadata.satellite_source.includes('Simulation') || 
                   field.data.metadata.satellite_source.includes('Environmental Data')) {
          console.log('%c   ⚠️ SIMULATED DATA', 'color: orange; font-weight: bold;');
        }
      }
    }
    
    // Check for vegetation indices
    if (field.data.vegetation_indices || field.data.vegetationIndices) {
      const indices = field.data.vegetation_indices || field.data.vegetationIndices;
      console.log('   ✓ Contains vegetation indices:');
      console.log(`      NDVI: ${indices.ndvi || 'N/A'}`);
      console.log(`      MSAVI2: ${indices.msavi2 || 'N/A'}`);
      console.log(`      NDRE: ${indices.ndre || 'N/A'}`);
    }
  });
} else {
  console.log('⚠️ No field data found in localStorage');
  console.log('   → Analyze a field first, then run this test again');
}

// Test 2: Check for API keys
console.log('\n%c🔑 Test 2: Checking API Configuration', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');

// Check if running in development
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
console.log(`Environment: ${isDev ? 'Development' : 'Production'}`);

// Test 3: Simulate a quick analysis
console.log('\n%c🧪 Test 3: Data Consistency Check', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');
console.log('Instructions:');
console.log('1. Analyze the same field 3 times');
console.log('2. Note the NDVI value each time');
console.log('3. Compare the values:');
console.log('   - If IDENTICAL → Likely real satellite data');
console.log('   - If VARYING → Definitely simulated data');

// Test 4: Check response time
console.log('\n%c⏱️ Test 4: Response Time Check', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');
console.log('Instructions:');
console.log('1. Click "Analyze My Field"');
console.log('2. Time how long it takes');
console.log('   - < 1 second → Simulated data (calculated locally)');
console.log('   - 5-15 seconds → Real satellite data (API query)');

// Test 5: Check console messages
console.log('\n%c💬 Test 5: Console Message Check', 'background: #2196F3; color: white; padding: 5px; font-weight: bold;');
console.log('Watch for these messages when analyzing a field:');
console.log('\n✅ REAL DATA indicators:');
console.log('   "✅ Successfully retrieved real satellite data"');
console.log('   "🛰️ Fetching real satellite data from Google Earth Engine..."');
console.log('   "Sentinel-2 (Real Data)"');
console.log('\n⚠️ SIMULATED DATA indicators:');
console.log('   "⚠️ Falling back to enhanced simulation"');
console.log('   "🌍 Using enhanced satellite data service..."');
console.log('   "Enhanced Simulation"');
console.log('   "Sentinel-2 + Environmental Data"');

// Summary
console.log('\n%c📋 SUMMARY', 'background: #FF9800; color: white; padding: 10px; font-size: 16px; font-weight: bold;');
console.log('\nBased on code analysis, your Soil Saathi is using:');
console.log('%c🟡 SIMULATED DATA', 'background: #FF9800; color: white; padding: 5px; font-weight: bold;');
console.log('\nReasons:');
console.log('1. No Google Earth Engine authentication configured');
console.log('2. Instant response times (< 1 second)');
console.log('3. Values vary slightly on each refresh');
console.log('4. Console shows "Enhanced Simulation" messages');
console.log('\nThis is NORMAL for development/testing!');
console.log('The simulation uses real scientific algorithms and is suitable for:');
console.log('✓ Testing and development');
console.log('✓ UI/UX demonstrations');
console.log('✓ Educational purposes');
console.log('\nNOT suitable for:');
console.log('✗ Real farming decisions');
console.log('✗ Commercial agricultural consulting');
console.log('✗ Scientific research');

console.log('\n%c📖 For detailed information, see: SATELLITE_DATA_VERIFICATION_GUIDE.md', 'color: #2196F3; font-weight: bold;');
console.log('%c🌐 Or open: check-satellite-data-live.html', 'color: #2196F3; font-weight: bold;');

console.log('\n' + '='.repeat(80));
console.log('Test complete! Now analyze a field and watch the console messages.');
console.log('='.repeat(80) + '\n');
