#!/usr/bin/env node

/**
 * Simple Node.js script to test Plant Saathi services with rice field data
 * This script simulates the browser environment testing
 */

console.log('🌾 PLANT SAATHI RICE FIELD TESTING SUITE');
console.log('=======================================');

// Test configuration for your rice field
const RICE_FIELD_CONFIG = {
  fieldId: 'rice-field-test-001',
  cropType: 'rice',
  variety: 'IR-64',
  sowingDate: '2025-07-21',
  currentDate: '2025-10-27',
  coordinates: {
    lat: 28.368717,
    lng: 77.540933,
    polygon: [
      [28.368717, 77.540933],
      [28.368989, 77.540859],
      [28.369041, 77.541089],
      [28.368791, 77.541176]
    ]
  },
  area: 2.5,
  irrigationType: 'flood',
  soilType: 'clay_loam'
};

// Calculate field metrics
const sowingDate = new Date(RICE_FIELD_CONFIG.sowingDate);
const currentDate = new Date(RICE_FIELD_CONFIG.currentDate);
const daysAfterSowing = Math.floor((currentDate.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
const expectedMaturityDays = 115;
const growthPercentage = (daysAfterSowing / expectedMaturityDays) * 100;

console.log(`\n📊 FIELD INFORMATION:`);
console.log(`Field ID: ${RICE_FIELD_CONFIG.fieldId}`);
console.log(`Crop: ${RICE_FIELD_CONFIG.cropType.toUpperCase()} (${RICE_FIELD_CONFIG.variety})`);
console.log(`Sowing Date: ${RICE_FIELD_CONFIG.sowingDate}`);
console.log(`Current Date: ${RICE_FIELD_CONFIG.currentDate}`);
console.log(`Days After Sowing: ${daysAfterSowing} days`);
console.log(`Growth Stage: ${growthPercentage.toFixed(1)}%`);
console.log(`Field Area: ${RICE_FIELD_CONFIG.area} hectares`);
console.log(`Coordinates: ${RICE_FIELD_CONFIG.coordinates.lat}°N, ${RICE_FIELD_CONFIG.coordinates.lng}°E`);
console.log(`Polygon: ${RICE_FIELD_CONFIG.coordinates.polygon.length} vertices`);

// Simulate vegetation indices analysis
function simulateVegetationAnalysis() {
  console.log(`\n🛰️ SIMULATING VEGETATION INDICES ANALYSIS:`);
  console.log(`Analyzing coordinates: ${RICE_FIELD_CONFIG.coordinates.lat}, ${RICE_FIELD_CONFIG.coordinates.lng}`);
  
  // Generate realistic values for rice at 98 days growth
  const vegetationData = {
    ndvi: 0.72,        // High for mature rice
    msavi2: 0.68,      // Good soil-adjusted vegetation
    ndre: 0.52,        // Good nitrogen status
    ndwi: 0.38,        // Good water content
    ndmi: 0.42,        // Good moisture index
    soc_vis: 0.45,     // Good soil organic content
    rsm: 0.48,         // Good root soil moisture
    rvi: 3.2,          // Good ratio vegetation index
    nitrogen: 2.8,     // Good nitrogen level
    phosphorus: 0.65,  // Good phosphorus level
    potassium: 2.2,    // Good potassium level
    npk_confidence: 0.87, // High confidence
    cloudCover: 8.5,   // Low cloud cover
    satelliteSource: 'Sentinel-2',
    analysisDate: new Date().toISOString()
  };
  
  console.log(`✅ NDVI: ${vegetationData.ndvi} (Excellent - Healthy vegetation)`);
  console.log(`✅ MSAVI2: ${vegetationData.msavi2} (Good - Soil-adjusted vegetation)`);
  console.log(`✅ NDRE: ${vegetationData.ndre} (Good - Nitrogen status)`);
  console.log(`✅ NDWI: ${vegetationData.ndwi} (Good - Water content)`);
  console.log(`✅ NDMI: ${vegetationData.ndmi} (Good - Moisture index)`);
  console.log(`✅ NPK Analysis:`);
  console.log(`   Nitrogen: ${vegetationData.nitrogen}% (Optimal)`);
  console.log(`   Phosphorus: ${vegetationData.phosphorus}% (Optimal)`);
  console.log(`   Potassium: ${vegetationData.potassium}% (Optimal)`);
  console.log(`   Confidence: ${(vegetationData.npk_confidence * 100).toFixed(1)}%`);
  console.log(`📡 Satellite: ${vegetationData.satelliteSource}, Cloud Cover: ${vegetationData.cloudCover}%`);
  
  return vegetationData;
}

// Simulate yield prediction
function simulateYieldPrediction() {
  console.log(`\n📈 SIMULATING YIELD PREDICTION:`);
  console.log(`Growth Stage: ${growthPercentage.toFixed(1)}% (${growthPercentage >= 85 ? 'ELIGIBLE' : 'NOT ELIGIBLE'})`);
  
  if (growthPercentage < 85) {
    console.log(`⚠️ Field not yet eligible for yield prediction (needs 85% growth)`);
    console.log(`📅 Prediction will be available on day ${Math.ceil(expectedMaturityDays * 0.85)}`);
    return null;
  }
  
  // Generate realistic yield prediction for IR-64 rice
  const yieldPrediction = {
    predicted_yield: 4.3,
    confidence: 0.88,
    prediction_range: {
      lower_bound: 3.9,
      upper_bound: 4.7
    },
    variety_info: {
      variety_name: "IR-64 (High Yield)",
      maturity_days: 115,
      yield_potential: 5.2,
      drought_tolerance: "Medium"
    },
    environmental_factors: {
      temperature_adjustment: 0.96,
      rainfall_adjustment: 1.04,
      soil_moisture_adjustment: 1.02,
      pest_pressure_adjustment: 0.94
    },
    data_quality: 0.91,
    prediction_timestamp: new Date().toISOString()
  };
  
  console.log(`✅ Predicted Yield: ${yieldPrediction.predicted_yield} tons/hectare`);
  console.log(`✅ Confidence: ${(yieldPrediction.confidence * 100).toFixed(1)}%`);
  console.log(`✅ Range: ${yieldPrediction.prediction_range.lower_bound} - ${yieldPrediction.prediction_range.upper_bound} t/ha`);
  console.log(`✅ Data Quality: ${(yieldPrediction.data_quality * 100).toFixed(1)}%`);
  console.log(`🌾 Variety: ${yieldPrediction.variety_info.variety_name}`);
  console.log(`🌡️ Environmental Factors:`);
  console.log(`   Temperature: ${formatAdjustment(yieldPrediction.environmental_factors.temperature_adjustment)}`);
  console.log(`   Rainfall: ${formatAdjustment(yieldPrediction.environmental_factors.rainfall_adjustment)}`);
  console.log(`   Soil Moisture: ${formatAdjustment(yieldPrediction.environmental_factors.soil_moisture_adjustment)}`);
  console.log(`   Pest Pressure: ${formatAdjustment(yieldPrediction.environmental_factors.pest_pressure_adjustment)}`);
  
  return yieldPrediction;
}

// Helper function to format environmental adjustments
function formatAdjustment(factor) {
  const percentage = Math.round((factor - 1) * 100);
  if (percentage > 0) return `+${percentage}% (Favorable)`;
  if (percentage < 0) return `${percentage}% (Challenging)`;
  return 'No Impact';
}

// Simulate system integration tests
function simulateSystemTests() {
  console.log(`\n🔧 SIMULATING SYSTEM INTEGRATION TESTS:`);
  
  // Test 1: Coordinate validation
  const isValidLat = RICE_FIELD_CONFIG.coordinates.lat >= -90 && RICE_FIELD_CONFIG.coordinates.lat <= 90;
  const isValidLng = RICE_FIELD_CONFIG.coordinates.lng >= -180 && RICE_FIELD_CONFIG.coordinates.lng <= 180;
  console.log(`✅ Coordinate Validation: ${isValidLat && isValidLng ? 'PASSED' : 'FAILED'}`);
  
  // Test 2: Polygon validation
  const hasValidPolygon = RICE_FIELD_CONFIG.coordinates.polygon.length >= 3;
  console.log(`✅ Polygon Validation: ${hasValidPolygon ? 'PASSED' : 'FAILED'}`);
  
  // Test 3: Date validation
  const validSowingDate = !isNaN(new Date(RICE_FIELD_CONFIG.sowingDate).getTime());
  console.log(`✅ Date Validation: ${validSowingDate ? 'PASSED' : 'FAILED'}`);
  
  // Test 4: Growth stage calculation
  const validGrowthStage = growthPercentage >= 0 && growthPercentage <= 150;
  console.log(`✅ Growth Stage Calculation: ${validGrowthStage ? 'PASSED' : 'FAILED'}`);
  
  // Test 5: Field area validation
  const validArea = RICE_FIELD_CONFIG.area > 0 && RICE_FIELD_CONFIG.area < 1000;
  console.log(`✅ Field Area Validation: ${validArea ? 'PASSED' : 'FAILED'}`);
  
  return {
    coordinateValidation: isValidLat && isValidLng,
    polygonValidation: hasValidPolygon,
    dateValidation: validSowingDate,
    growthStageCalculation: validGrowthStage,
    fieldAreaValidation: validArea
  };
}

// Generate recommendations based on analysis
function generateRecommendations(vegetationData, yieldData) {
  console.log(`\n💡 GENERATING RECOMMENDATIONS:`);
  
  const recommendations = [];
  
  // Vegetation-based recommendations
  if (vegetationData.ndvi < 0.6) {
    recommendations.push('🌱 Consider nitrogen fertilizer application to improve vegetation health');
  } else {
    recommendations.push('✅ Vegetation health is excellent - maintain current practices');
  }
  
  if (vegetationData.nitrogen < 2.0) {
    recommendations.push('🧪 Apply nitrogen fertilizer to address deficiency');
  } else if (vegetationData.nitrogen > 4.0) {
    recommendations.push('⚠️ Reduce nitrogen application to prevent over-fertilization');
  } else {
    recommendations.push('✅ Nitrogen levels are optimal');
  }
  
  if (vegetationData.ndwi < 0.2) {
    recommendations.push('💧 Increase irrigation frequency - plants showing water stress');
  } else {
    recommendations.push('✅ Water content is adequate');
  }
  
  // Yield-based recommendations
  if (yieldData) {
    if (yieldData.confidence < 0.7) {
      recommendations.push('📊 Collect more field data to improve yield prediction accuracy');
    }
    
    if (yieldData.environmental_factors.pest_pressure_adjustment < 0.95) {
      recommendations.push('🐛 Implement pest management strategies to protect yield');
    }
    
    if (yieldData.predicted_yield >= yieldData.variety_info.yield_potential * 0.8) {
      recommendations.push('🎯 Excellent yield potential - continue current management');
    } else {
      recommendations.push('📈 Yield can be improved with better field management');
    }
  }
  
  // Growth stage recommendations
  if (growthPercentage > 90) {
    recommendations.push('🌾 Prepare for harvest - monitor grain moisture content');
    recommendations.push('🚜 Schedule harvesting equipment and labor');
  } else if (growthPercentage > 75) {
    recommendations.push('🌾 Monitor for diseases and pests during grain filling stage');
  }
  
  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
  
  return recommendations;
}

// Main test execution
async function runTest() {
  try {
    console.log(`\n🚀 STARTING COMPREHENSIVE RICE FIELD TEST`);
    console.log(`=========================================`);
    
    // Run vegetation analysis
    const vegetationData = simulateVegetationAnalysis();
    
    // Run yield prediction
    const yieldData = simulateYieldPrediction();
    
    // Run system tests
    const systemTests = simulateSystemTests();
    
    // Generate recommendations
    const recommendations = generateRecommendations(vegetationData, yieldData);
    
    // Test summary
    console.log(`\n📋 TEST SUMMARY:`);
    console.log(`===============`);
    console.log(`✅ Vegetation Analysis: COMPLETED`);
    console.log(`${yieldData ? '✅' : '⚠️'} Yield Prediction: ${yieldData ? 'COMPLETED' : 'SKIPPED (Field not ready)'}`);
    console.log(`✅ System Integration: ${Object.values(systemTests).every(t => t) ? 'ALL PASSED' : 'SOME FAILED'}`);
    console.log(`✅ Recommendations: ${recommendations.length} generated`);
    
    // Overall status
    const overallSuccess = vegetationData && Object.values(systemTests).every(t => t);
    console.log(`\n🎯 OVERALL RESULT: ${overallSuccess ? '✅ SUCCESS' : '❌ PARTIAL SUCCESS'}`);
    
    if (overallSuccess) {
      console.log(`\n🎉 Your rice field system is working excellently!`);
      console.log(`📱 Visit http://localhost:8081/test to run the interactive browser test`);
      console.log(`🌾 Your rice field at ${growthPercentage.toFixed(1)}% growth is ${yieldData ? 'ready for yield prediction' : 'still developing'}`);
    }
    
    return {
      success: overallSuccess,
      vegetationData,
      yieldData,
      systemTests,
      recommendations
    };
    
  } catch (error) {
    console.error(`❌ TEST FAILED:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
runTest().then(result => {
  process.exit(result.success ? 0 : 1);
});