/**
 * Test script for local backend proxy
 * Run with: node test-local.js
 */

const testCoordinates = {
  // Rice field in India
  lat: 28.368717,
  lng: 77.540933,
  startDate: '2025-10-01',
  endDate: '2025-11-01'
};

async function testBackendProxy() {
  console.log('🧪 Testing Plant Saathi Satellite Proxy...\n');
  
  const baseUrl = process.env.PROXY_URL || 'http://localhost:3001';
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status === 'ok' && healthData.eeInitialized) {
      console.log('✅ Health check passed');
      console.log(`   Earth Engine: ${healthData.eeInitialized ? 'Initialized' : 'Not initialized'}`);
    } else {
      console.log('❌ Health check failed');
      console.log('   Earth Engine may not be initialized yet. Wait 5-10 seconds and try again.');
      return;
    }
    
    // Test 2: Fetch satellite data
    console.log('\n2️⃣ Testing satellite data endpoint...');
    console.log(`   Location: ${testCoordinates.lat}, ${testCoordinates.lng}`);
    console.log(`   Date range: ${testCoordinates.startDate} to ${testCoordinates.endDate}`);
    
    const startTime = Date.now();
    
    const response = await fetch(`${baseUrl}/api/satellite/vegetation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCoordinates)
    });
    
    const elapsed = Date.now() - startTime;
    
    if (!response.ok) {
      console.log(`❌ Request failed with status ${response.status}`);
      const errorText = await response.text();
      console.log('   Error:', errorText);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Satellite data fetched successfully');
      console.log(`   Response time: ${elapsed}ms`);
      console.log('\n📊 Results:');
      console.log(`   NDVI: ${data.data.ndvi?.toFixed(3) || 'N/A'}`);
      console.log(`   MSAVI2: ${data.data.msavi2?.toFixed(3) || 'N/A'}`);
      console.log(`   NDRE: ${data.data.ndre?.toFixed(3) || 'N/A'}`);
      console.log(`   NDWI: ${data.data.ndwi?.toFixed(3) || 'N/A'}`);
      console.log(`   NDMI: ${data.data.ndmi?.toFixed(3) || 'N/A'}`);
      console.log(`   SOC_VIS: ${data.data.soc_vis?.toFixed(3) || 'N/A'}`);
      console.log(`   RSM: ${data.data.rsm?.toFixed(3) || 'N/A'}`);
      console.log(`   RVI: ${data.data.rvi?.toFixed(3) || 'N/A'}`);
      console.log(`\n   Images used: ${data.data.imageCount}`);
      console.log(`   Cloud cover: ${data.data.cloudCover?.toFixed(1)}%`);
      console.log(`   Confidence: ${(data.data.confidence * 100).toFixed(0)}%`);
      console.log(`   Data source: ${data.data.dataSource}`);
      
      if (data.data.imageCount === 0) {
        console.log('\n⚠️  No satellite images found for this location/date range');
        console.log('   Try:');
        console.log('   - Increasing the date range');
        console.log('   - Increasing cloud cover threshold');
        console.log('   - Checking if coordinates are valid');
      }
    } else {
      console.log('❌ Request succeeded but returned no data');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.log('❌ Test failed with error:');
    console.log('   ', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Tip: Make sure the backend proxy is running:');
      console.log('   cd backend-proxy');
      console.log('   npm start');
    }
  }
}

// Run tests
testBackendProxy();
