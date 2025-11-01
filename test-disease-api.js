/**
 * Test script for Disease Detection API
 * Tests the Supabase Edge Function for disease analysis
 */

const DISEASE_API_BASE_URL = 'https://teejiieuaxzrucsttrid.supabase.co/functions/v1';
const DISEASE_API_KEY = 'pk_4af2789fa35a45d896311651f967b40c';
const DISEASE_API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWppaWV1YXh6cnVjc3R0cmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODYyMDQsImV4cCI6MjA3NTY2MjIwNH0.i6X9SMD1K7WId384sZcQVX3H-FB_2jZtLidwYp3qZjA';

// Sample base64 image (1x1 pixel red PNG)
const SAMPLE_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testDiseaseAnalysis() {
  console.log('🧪 Testing Disease Detection API...\n');

  try {
    console.log('📡 Sending request to:', `${DISEASE_API_BASE_URL}/analyze-disease`);
    console.log('🔑 Using API Key:', DISEASE_API_KEY.substring(0, 10) + '...');
    console.log('🖼️  Image format: Base64 encoded PNG\n');

    const requestBody = {
      image: SAMPLE_IMAGE,
      crop: "tomato",
      location: "India",
      symptoms: "Yellowing leaves"
    };

    const response = await fetch(`${DISEASE_API_BASE_URL}/analyze-disease`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DISEASE_API_TOKEN}`,
        'x-api-key': DISEASE_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📊 Response Status:', response.status, response.statusText);
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('\n❌ API Error:', errorText);
      throw new Error(`API request failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    console.log('\n✅ Disease Analysis Result:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🦠 Disease Name:', result.disease_name);
    console.log('📊 Confidence:', (result.confidence * 100).toFixed(1) + '%');
    console.log('📈 Yield Impact:', result.yield_impact);
    console.log('🔄 Recovery Chance:', result.recovery_chance);
    console.log('\n💊 Treatments:');
    console.log('  Cultural:', result.treatments.cultural.length, 'methods');
    console.log('  Chemical:', result.treatments.chemical.length, 'methods');
    console.log('  Organic:', result.treatments.organic.length, 'methods');
    console.log('  IPM:', result.treatments.ipm.length, 'methods');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📄 Full Response:');
    console.log(JSON.stringify(result, null, 2));

    console.log('\n✅ Test completed successfully!');
    return result;

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    throw error;
  }
}

// Run the test
testDiseaseAnalysis()
  .then(() => {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  });
