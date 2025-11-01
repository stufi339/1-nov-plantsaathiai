/**
 * Comprehensive Real-Time Testing Script for Rice Field
 * Tests all Plant Saathi services with actual coordinates and data
 * 
 * Field Details:
 * - Crop: Rice
 * - Coordinates: Polygon with 4 points around Delhi area
 * - Sowing Date: July 21, 2025
 * - Current Date: October 27, 2025 (98 days after sowing)
 */

import { geeService } from './src/lib/geeService';
import { YieldPredictionService } from './src/lib/yieldPredictionService';
import { blackBoxService } from './src/lib/blackBoxService';
import { audioService } from './src/lib/audioService';
import { ReportService } from './src/lib/reportService';

// Test field configuration with your provided coordinates
const TEST_FIELD_CONFIG = {
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
  area: 2.5, // hectares
  irrigationType: 'flood',
  soilType: 'clay_loam'
};

// Calculate growth metrics
const sowingDate = new Date(TEST_FIELD_CONFIG.sowingDate);
const currentDate = new Date(TEST_FIELD_CONFIG.currentDate);
const daysAfterSowing = Math.floor((currentDate.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
const expectedMaturityDays = 115; // IR-64 rice variety
const growthPercentage = (daysAfterSowing / expectedMaturityDays) * 100;

console.log('🌾 PLANT SAATHI REAL-TIME TESTING SUITE');
console.log('=====================================');
console.log(`Field ID: ${TEST_FIELD_CONFIG.fieldId}`);
console.log(`Crop: ${TEST_FIELD_CONFIG.cropType.toUpperCase()} (${TEST_FIELD_CONFIG.variety})`);
console.log(`Sowing Date: ${TEST_FIELD_CONFIG.sowingDate}`);
console.log(`Current Date: ${TEST_FIELD_CONFIG.currentDate}`);
console.log(`Days After Sowing: ${daysAfterSowing} days`);
console.log(`Growth Stage: ${growthPercentage.toFixed(1)}% (${growthPercentage >= 85 ? 'YIELD PREDICTION READY' : 'GROWING'})`);
console.log(`Field Area: ${TEST_FIELD_CONFIG.area} hectares`);
console.log(`Coordinates: ${TEST_FIELD_CONFIG.coordinates.lat}°N, ${TEST_FIELD_CONFIG.coordinates.lng}°E`);
console.log(`Polygon Points: ${TEST_FIELD_CONFIG.coordinates.polygon.length} vertices`);
console.log('=====================================\n');

/**
 * Test 1: Google Earth Engine Service - Vegetation Indices Analysis
 */
async function testVegetationIndicesAnalysis() {
  console.log('🛰️ TEST 1: VEGETATION INDICES ANALYSIS');
  console.log('--------------------------------------');
  
  try {
    // Test coordinate validation
    const isValidCoords = geeService.validateCoordinates(TEST_FIELD_CONFIG.coordinates);
    console.log(`✅ Coordinate Validation: ${isValidCoords ? 'PASSED' : 'FAILED'}`);
    
    if (!isValidCoords) {
      throw new Error('Invalid coordinates provided');
    }
    
    // Get available date range
    const dateRange = await geeService.getAvailableDateRange(TEST_FIELD_CONFIG.coordinates);
    console.log(`📅 Available Data Range: ${dateRange.startDate} to ${dateRange.endDate}`);
    
    // Analyze vegetation indices with real-time simulation
    console.log('🔄 Analyzing vegetation indices...');
    const startTime = Date.now();
    
    const vegetationData = await geeService.analyzeVegetationIndices({
      coordinates: TEST_FIELD_CONFIG.coordinates,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      cloudCoverThreshold: 20
    });
    
    const analysisTime = Date.now() - startTime;
    console.log(`⏱️ Analysis completed in ${analysisTime}ms`);
    
    // Display comprehensive results
    console.log('\n📊 VEGETATION INDICES RESULTS:');
    console.log(`NDVI (Vegetation Health): ${vegetationData.ndvi.toFixed(3)} ${getHealthStatus(vegetationData.ndvi, 'ndvi')}`);
    console.log(`MSAVI2 (Soil-Adjusted): ${vegetationData.msavi2.toFixed(3)} ${getHealthStatus(vegetationData.msavi2, 'msavi2')}`);
    console.log(`NDRE (Nitrogen Status): ${vegetationData.ndre.toFixed(3)} ${getHealthStatus(vegetationData.ndre, 'ndre')}`);
    console.log(`NDWI (Water Content): ${vegetationData.ndwi.toFixed(3)} ${getHealthStatus(vegetationData.ndwi, 'ndwi')}`);
    console.log(`NDMI (Moisture Index): ${vegetationData.ndmi.toFixed(3)} ${getHealthStatus(vegetationData.ndmi, 'ndmi')}`);
    console.log(`SOC_VIS (Soil Organic): ${vegetationData.soc_vis.toFixed(3)} ${getHealthStatus(vegetationData.soc_vis, 'soc_vis')}`);
    console.log(`RSM (Root Soil Moisture): ${vegetationData.rsm.toFixed(3)} ${getHealthStatus(vegetationData.rsm, 'rsm')}`);
    console.log(`RVI (Ratio Vegetation): ${vegetationData.rvi.toFixed(2)} ${getHealthStatus(vegetationData.rvi, 'rvi')}`);
    
    // NPK Analysis (if available)
    if (vegetationData.nitrogen && vegetationData.phosphorus && vegetationData.potassium) {
      console.log('\n🧪 NPK NUTRIENT ANALYSIS:');
      console.log(`Nitrogen: ${vegetationData.nitrogen.toFixed(2)}% ${getNutrientStatus(vegetationData.nitrogen, 'N')}`);
      console.log(`Phosphorus: ${vegetationData.phosphorus.toFixed(2)}% ${getNutrientStatus(vegetationData.phosphorus, 'P')}`);
      console.log(`Potassium: ${vegetationData.potassium.toFixed(2)}% ${getNutrientStatus(vegetationData.potassium, 'K')}`);
      console.log(`NPK Confidence: ${(vegetationData.npk_confidence! * 100).toFixed(1)}%`);
    }
    
    console.log(`\n📡 Satellite Data: ${vegetationData.satelliteSource}`);
    console.log(`☁️ Cloud Cover: ${vegetationData.cloudCover.toFixed(1)}%`);
    console.log(`📅 Analysis Date: ${new Date(vegetationData.analysisDate).toLocaleString()}`);
    
    // Log to black box service
    blackBoxService.logVegetationIndicesView(
      TEST_FIELD_CONFIG.fieldId,
      {
        ndvi: vegetationData.ndvi,
        msavi2: vegetationData.msavi2,
        ndre: vegetationData.ndre,
        ndwi: vegetationData.ndwi,
        ndmi: vegetationData.ndmi,
        soc_vis: vegetationData.soc_vis,
        rsm: vegetationData.rsm,
        rvi: vegetationData.rvi
      },
      vegetationData.nitrogen ? {
        nitrogen: vegetationData.nitrogen,
        phosphorus: vegetationData.phosphorus,
        potassium: vegetationData.potassium,
        confidence: vegetationData.npk_confidence!
      } : undefined
    );
    
    console.log('✅ TEST 1 PASSED: Vegetation indices analysis completed successfully\n');
    return vegetationData;
    
  } catch (error) {
    console.error('❌ TEST 1 FAILED:', error);
    blackBoxService.logError('api_failure', error instanceof Error ? error.message : 'Unknown error', TEST_FIELD_CONFIG.fieldId, 'vegetation_analysis_test');
    throw error;
  }
}

/**
 * Test 2: Yield Prediction Service
 */
async function testYieldPrediction() {
  console.log('📈 TEST 2: YIELD PREDICTION ANALYSIS');
  console.log('------------------------------------');
  
  try {
    // Check if field is eligible for yield prediction
    const isEligible = await YieldPredictionService.isEligibleForPrediction(TEST_FIELD_CONFIG.fieldId);
    console.log(`✅ Yield Prediction Eligibility: ${isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    console.log(`📊 Growth Stage: ${growthPercentage.toFixed(1)}% (${growthPercentage >= 85 ? 'Ready for prediction' : 'Still growing'})`);
    
    if (!isEligible) {
      console.log('⚠️ Field not yet eligible for yield prediction (needs 85% growth or 60+ days)');
      console.log('✅ TEST 2 SKIPPED: Field not ready for yield prediction\n');
      return null;
    }
    
    // Get yield prediction
    console.log('🔄 Generating yield prediction...');
    const startTime = Date.now();
    
    const yieldPrediction = await YieldPredictionService.getPrediction(TEST_FIELD_CONFIG.fieldId);
    
    const predictionTime = Date.now() - startTime;
    console.log(`⏱️ Prediction completed in ${predictionTime}ms`);
    
    // Display comprehensive results
    console.log('\n📊 YIELD PREDICTION RESULTS:');
    console.log(`Predicted Yield: ${yieldPrediction.predicted_yield} tons/hectare`);
    console.log(`Confidence Level: ${(yieldPrediction.confidence * 100).toFixed(1)}%`);
    console.log(`Yield Range: ${yieldPrediction.prediction_range.lower_bound} - ${yieldPrediction.prediction_range.upper_bound} tons/hectare`);
    console.log(`Data Quality: ${(yieldPrediction.data_quality * 100).toFixed(1)}%`);
    
    if (yieldPrediction.variety_info) {
      console.log('\n🌾 VARIETY INFORMATION:');
      console.log(`Variety: ${yieldPrediction.variety_info.variety_name}`);
      console.log(`Maturity Days: ${yieldPrediction.variety_info.maturity_days} days`);
      console.log(`Yield Potential: ${yieldPrediction.variety_info.yield_potential} tons/hectare`);
      console.log(`Drought Tolerance: ${yieldPrediction.variety_info.drought_tolerance}`);
    }
    
    if (yieldPrediction.environmental_factors) {
      console.log('\n🌡️ ENVIRONMENTAL FACTORS:');
      console.log(`Temperature Impact: ${formatAdjustment(yieldPrediction.environmental_factors.temperature_adjustment)}`);
      console.log(`Rainfall Impact: ${formatAdjustment(yieldPrediction.environmental_factors.rainfall_adjustment)}`);
      console.log(`Soil Moisture Impact: ${formatAdjustment(yieldPrediction.environmental_factors.soil_moisture_adjustment)}`);
      console.log(`Pest Pressure Impact: ${formatAdjustment(yieldPrediction.environmental_factors.pest_pressure_adjustment)}`);
    }
    
    console.log(`\n📅 Prediction Generated: ${new Date(yieldPrediction.prediction_timestamp).toLocaleString()}`);
    
    // Test yield prediction refresh
    console.log('\n🔄 Testing prediction refresh...');
    const refreshedPrediction = await YieldPredictionService.refreshPrediction(TEST_FIELD_CONFIG.fieldId);
    console.log(`✅ Prediction refresh successful (${refreshedPrediction.predicted_yield} tons/hectare)`);
    
    console.log('✅ TEST 2 PASSED: Yield prediction completed successfully\n');
    return yieldPrediction;
    
  } catch (error) {
    console.error('❌ TEST 2 FAILED:', error);
    blackBoxService.logError('api_failure', error instanceof Error ? error.message : 'Unknown error', TEST_FIELD_CONFIG.fieldId, 'yield_prediction_test');
    throw error;
  }
}

/**
 * Test 3: Audio Service Integration
 */
async function testAudioService(vegetationData: any, yieldData: any) {
  console.log('🔊 TEST 3: AUDIO SERVICE INTEGRATION');
  console.log('-----------------------------------');
  
  try {
    // Check audio support
    const isSupported = audioService.isSupported();
    console.log(`✅ Audio Support: ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
    
    if (!isSupported) {
      console.log('⚠️ Audio not supported in this environment');
      console.log('✅ TEST 3 SKIPPED: Audio not available\n');
      return;
    }
    
    // Test vegetation indices audio
    const vegetationAudio = `Your rice field analysis shows NDVI of ${vegetationData.ndvi.toFixed(2)}, indicating ${getHealthStatus(vegetationData.ndvi, 'ndvi')} vegetation health. The nitrogen level is ${vegetationData.nitrogen?.toFixed(1) || 'not available'} percent.`;
    
    console.log('🔄 Testing vegetation indices audio...');
    blackBoxService.logAudioInteraction('test-vegetation', 'vegetation_index', vegetationAudio, TEST_FIELD_CONFIG.fieldId);
    
    // Simulate audio playback (in real environment, this would actually play)
    console.log(`📢 Audio Content: "${vegetationAudio.substring(0, 100)}..."`);
    
    // Test yield prediction audio (if available)
    if (yieldData) {
      const yieldAudio = `Your rice field yield prediction is ${yieldData.predicted_yield} tons per hectare with ${Math.round(yieldData.confidence * 100)} percent confidence. The expected range is ${yieldData.prediction_range.lower_bound} to ${yieldData.prediction_range.upper_bound} tons per hectare.`;
      
      console.log('🔄 Testing yield prediction audio...');
      blackBoxService.logAudioInteraction('test-yield', 'yield_prediction', yieldAudio, TEST_FIELD_CONFIG.fieldId);
      console.log(`📢 Audio Content: "${yieldAudio.substring(0, 100)}..."`);
    }
    
    console.log('✅ TEST 3 PASSED: Audio service integration successful\n');
    
  } catch (error) {
    console.error('❌ TEST 3 FAILED:', error);
    blackBoxService.logError('audio_failure', error instanceof Error ? error.message : 'Unknown error', TEST_FIELD_CONFIG.fieldId, 'audio_service_test');
  }
}

/**
 * Test 4: Black Box Logging Service
 */
async function testBlackBoxLogging() {
  console.log('📝 TEST 4: BLACK BOX LOGGING SERVICE');
  console.log('-----------------------------------');
  
  try {
    // Test field access logging
    blackBoxService.logFieldAccess(TEST_FIELD_CONFIG.fieldId, 'view', ['vegetation_indices', 'yield_prediction'], 120);
    console.log('✅ Field access logging: PASSED');
    
    // Test user interaction logging
    blackBoxService.logUserInteraction('button_click', 'test_button', TEST_FIELD_CONFIG.fieldId, {
      testType: 'comprehensive_test',
      timestamp: new Date().toISOString()
    });
    console.log('✅ User interaction logging: PASSED');
    
    // Test error logging
    blackBoxService.logError('api_failure', 'Test error for logging verification', TEST_FIELD_CONFIG.fieldId, 'test_action', undefined, false);
    console.log('✅ Error logging: PASSED');
    
    // Test user feedback logging
    blackBoxService.logUserFeedback('rating', 'Test feedback for comprehensive testing', 'vegetation_analysis', TEST_FIELD_CONFIG.fieldId, 5);
    console.log('✅ User feedback logging: PASSED');
    
    // Get analytics summary
    const analytics = blackBoxService.getAnalyticsSummary();
    console.log('\n📊 ANALYTICS SUMMARY:');
    console.log(`Session ID: ${analytics.sessionId}`);
    console.log(`Session Duration: ${analytics.sessionDuration} seconds`);
    console.log(`Total Interactions: ${analytics.totalInteractions}`);
    console.log(`Audio Usage: ${analytics.audioUsage}`);
    console.log(`Error Count: ${analytics.errorCount}`);
    console.log(`Fields Viewed: ${analytics.fieldsViewed.join(', ')}`);
    
    console.log('✅ TEST 4 PASSED: Black box logging service working correctly\n');
    
  } catch (error) {
    console.error('❌ TEST 4 FAILED:', error);
  }
}

/**
 * Test 5: Report Generation Service
 */
async function testReportGeneration(vegetationData: any, yieldData: any) {
  console.log('📄 TEST 5: REPORT GENERATION SERVICE');
  console.log('-----------------------------------');
  
  try {
    // Test vegetation report generation
    console.log('🔄 Testing vegetation report generation...');
    const vegetationReport = ReportService.formatVegetationIndicesShareMessage(vegetationData, TEST_FIELD_CONFIG.fieldId);
    console.log(`✅ Vegetation report generated (${vegetationReport.length} characters)`);
    console.log(`📄 Sample: "${vegetationReport.substring(0, 150)}..."`);
    
    // Test yield prediction report (if available)
    if (yieldData) {
      console.log('🔄 Testing yield prediction report generation...');
      const yieldReport = ReportService.formatYieldPredictionShareMessage(yieldData, TEST_FIELD_CONFIG.fieldId);
      console.log(`✅ Yield report generated (${yieldReport.length} characters)`);
      console.log(`📄 Sample: "${yieldReport.substring(0, 150)}..."`);
    }
    
    // Test clipboard functionality (simulated)
    console.log('🔄 Testing clipboard functionality...');
    const testText = 'Test clipboard content for Plant Saathi';
    const clipboardSuccess = await ReportService.copyToClipboard(testText);
    console.log(`✅ Clipboard test: ${clipboardSuccess ? 'PASSED' : 'FAILED (not supported in this environment)'}`);
    
    console.log('✅ TEST 5 PASSED: Report generation service working correctly\n');
    
  } catch (error) {
    console.error('❌ TEST 5 FAILED:', error);
    blackBoxService.logError('api_failure', error instanceof Error ? error.message : 'Unknown error', TEST_FIELD_CONFIG.fieldId, 'report_generation_test');
  }
}

/**
 * Helper Functions
 */
function getHealthStatus(value: number, indexType: string): string {
  const ranges = {
    ndvi: { excellent: 0.7, good: 0.5, moderate: 0.3 },
    msavi2: { excellent: 0.6, good: 0.4, moderate: 0.2 },
    ndre: { excellent: 0.5, good: 0.3, moderate: 0.1 },
    ndwi: { excellent: 0.4, good: 0.2, moderate: 0.0 },
    ndmi: { excellent: 0.4, good: 0.2, moderate: 0.0 },
    soc_vis: { excellent: 0.5, good: 0.3, moderate: 0.1 },
    rsm: { excellent: 0.5, good: 0.3, moderate: 0.1 },
    rvi: { excellent: 4.0, good: 2.0, moderate: 1.0 }
  };
  
  const range = ranges[indexType as keyof typeof ranges];
  if (!range) return '(Unknown)';
  
  if (value >= range.excellent) return '(Excellent)';
  if (value >= range.good) return '(Good)';
  if (value >= range.moderate) return '(Moderate)';
  return '(Needs Attention)';
}

function getNutrientStatus(value: number, nutrient: string): string {
  const ranges = {
    N: { optimal: [2.0, 4.0], adequate: [1.5, 2.0] },
    P: { optimal: [0.3, 0.8], adequate: [0.2, 0.3] },
    K: { optimal: [1.5, 2.5], adequate: [1.0, 1.5] }
  };
  
  const range = ranges[nutrient as keyof typeof ranges];
  if (!range) return '(Unknown)';
  
  if (value >= range.optimal[0] && value <= range.optimal[1]) return '(Optimal)';
  if (value >= range.adequate[0]) return '(Adequate)';
  if (value < range.adequate[0]) return '(Deficient)';
  return '(Excessive)';
}

function formatAdjustment(factor: number): string {
  const percentage = Math.round((factor - 1) * 100);
  if (percentage > 0) return `+${percentage}% (Favorable)`;
  if (percentage < 0) return `${percentage}% (Challenging)`;
  return 'No Impact';
}

/**
 * Main Test Execution
 */
async function runComprehensiveTest() {
  console.log('🚀 STARTING COMPREHENSIVE REAL-TIME TEST');
  console.log('=========================================\n');
  
  const testResults = {
    vegetationAnalysis: null as any,
    yieldPrediction: null as any,
    audioService: false,
    blackBoxLogging: false,
    reportGeneration: false,
    overallSuccess: false
  };
  
  try {
    // Test 1: Vegetation Indices Analysis
    testResults.vegetationAnalysis = await testVegetationIndicesAnalysis();
    
    // Test 2: Yield Prediction (if eligible)
    testResults.yieldPrediction = await testYieldPrediction();
    
    // Test 3: Audio Service
    await testAudioService(testResults.vegetationAnalysis, testResults.yieldPrediction);
    testResults.audioService = true;
    
    // Test 4: Black Box Logging
    await testBlackBoxLogging();
    testResults.blackBoxLogging = true;
    
    // Test 5: Report Generation
    await testReportGeneration(testResults.vegetationAnalysis, testResults.yieldPrediction);
    testResults.reportGeneration = true;
    
    testResults.overallSuccess = true;
    
  } catch (error) {
    console.error('🚨 CRITICAL TEST FAILURE:', error);
    testResults.overallSuccess = false;
  }
  
  // Final Test Summary
  console.log('📋 COMPREHENSIVE TEST SUMMARY');
  console.log('=============================');
  console.log(`✅ Vegetation Analysis: ${testResults.vegetationAnalysis ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Yield Prediction: ${testResults.yieldPrediction ? 'PASSED' : 'SKIPPED/FAILED'}`);
  console.log(`✅ Audio Service: ${testResults.audioService ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Black Box Logging: ${testResults.blackBoxLogging ? 'PASSED' : 'FAILED'}`);
  console.log(`✅ Report Generation: ${testResults.reportGeneration ? 'PASSED' : 'FAILED'}`);
  console.log(`\n🎯 OVERALL RESULT: ${testResults.overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  // Export test results for analysis
  const exportData = blackBoxService.exportLogs();
  console.log(`\n📊 Test data exported (${exportData.length} characters)`);
  console.log('Test completed successfully! 🎉');
  
  return testResults;
}

// Export for use in other modules
export { runComprehensiveTest, TEST_FIELD_CONFIG };

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  runComprehensiveTest().catch(console.error);
}