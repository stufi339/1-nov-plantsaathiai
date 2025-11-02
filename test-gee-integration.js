/**
 * Test Google Earth Engine Integration with Real Credentials
 * Tests the complete OAuth2 authentication and satellite data retrieval
 */

async function testGEEIntegration() {
  console.log('🛰️ TESTING GOOGLE EARTH ENGINE INTEGRATION');
  console.log('==========================================');

  try {
    // Test 1: Check if environment variables are loaded
    console.log('\n📋 Test 1: Environment Variables');
    console.log('-------------------------------');

    const projectId = import.meta.env?.VITE_GEE_PROJECT_ID;
    const clientEmail = import.meta.env?.VITE_GEE_CLIENT_EMAIL;
    const privateKey = import.meta.env?.VITE_GEE_PRIVATE_KEY;

    console.log(`Project ID: ${projectId ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Client Email: ${clientEmail ? '✅ Configured' : '❌ Missing'}`);
    console.log(`Private Key: ${privateKey ? '✅ Configured' : '❌ Missing'}`);

    if (!projectId || !clientEmail || !privateKey) {
      console.log('\n❌ Environment variables not configured. Please check your .env file.');
      return;
    }

    // Test 2: Test authentication service
    console.log('\n🔐 Test 2: Authentication Service');
    console.log('----------------------------------');

    const { geeAuthService } = await import('./src/lib/geeAuthService.ts');

    if (geeAuthService.isConfigured()) {
      console.log('✅ Authentication service configured');

      try {
        console.log('🔄 Attempting to get access token...');
        const accessToken = await geeAuthService.getAccessToken();
        console.log(`✅ Access token obtained: ${accessToken.substring(0, 20)}...`);
      } catch (error) {
        console.log(`❌ Failed to get access token: ${error.message}`);
        return;
      }
    } else {
      console.log('❌ Authentication service not configured');
      return;
    }

    // Test 3: Test GEE service
    console.log('\n🌍 Test 3: GEE Service Integration');
    console.log('----------------------------------');

    const { geeService } = await import('./src/lib/geeService.ts');

    // Test coordinates (your rice field)
    const testCoordinates = {
      lat: 28.368717,
      lng: 77.540933,
      polygon: [
        [28.368717, 77.540933],
        [28.368989, 77.540859],
        [28.369041, 77.541089],
        [28.368791, 77.541176]
      ]
    };

    console.log(`📍 Test Location: ${testCoordinates.lat}°N, ${testCoordinates.lng}°E`);
    console.log(`📐 Polygon Points: ${testCoordinates.polygon.length}`);

    // Get date range
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log(`📅 Date Range: ${startDate} to ${endDate}`);

    // Test vegetation analysis
    console.log('\n🔬 Testing vegetation indices analysis...');

    const result = await geeService.analyzeVegetationIndices({
      coordinates: testCoordinates,
      startDate,
      endDate
    });

    console.log('\n📊 ANALYSIS RESULTS:');
    console.log('===================');

    if (result.satelliteSource.includes('Real Data')) {
      console.log('🎉 SUCCESS: REAL SATELLITE DATA RETRIEVED!');
      console.log('==========================================');
    } else {
      console.log('⚠️ SIMULATION: Using enhanced simulation');
      console.log('=====================================');
    }

    console.log(`Satellite Source: ${result.satelliteSource}`);
    console.log(`Analysis Date: ${result.analysisDate}`);
    console.log(`Cloud Cover: ${result.cloudCover.toFixed(1)}%`);

    console.log('\n🌿 VEGETATION INDICES:');
    console.log(`NDVI (Vegetation Health): ${result.ndvi.toFixed(3)}`);
    console.log(`MSAVI2 (Soil-Adjusted): ${result.msavi2.toFixed(3)}`);
    console.log(`NDRE (Nitrogen Status): ${result.ndre.toFixed(3)}`);
    console.log(`NDWI (Water Content): ${result.ndwi.toFixed(3)}`);
    console.log(`NDMI (Moisture Index): ${result.ndmi.toFixed(3)}`);
    console.log(`SOC_VIS (Soil Organic): ${result.soc_vis.toFixed(3)}`);
    console.log(`RSM (Root Soil Moisture): ${result.rsm.toFixed(3)}`);
    console.log(`RVI (Ratio Vegetation): ${result.rvi.toFixed(2)}`);

    if (result.nitrogen || result.phosphorus || result.potassium) {
      console.log('\n🧪 NPK ESTIMATES:');
      if (result.nitrogen) console.log(`Nitrogen: ${result.nitrogen.toFixed(2)}%`);
      if (result.phosphorus) console.log(`Phosphorus: ${result.phosphorus.toFixed(2)}%`);
      if (result.potassium) console.log(`Potassium: ${result.potassium.toFixed(2)}%`);
      if (result.npk_confidence) console.log(`Confidence: ${(result.npk_confidence * 100).toFixed(1)}%`);
    }

    console.log('\n✅ INTEGRATION TEST COMPLETED SUCCESSFULLY!');

  } catch (error) {
    console.error('\n❌ INTEGRATION TEST FAILED:');
    console.error(error.message);
    console.error('\n🔧 Troubleshooting:');
    console.log('1. Check that your .env file has the correct GEE credentials');
    console.log('2. Ensure the service account has Earth Engine access');
    console.log('3. Verify the GCP project ID is correct');
    console.log('4. Check that Earth Engine API is enabled in GCP');
  }
}

// Run the test
testGEEIntegration();
