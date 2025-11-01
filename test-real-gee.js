/**
 * Test Real Google Earth Engine Integration
 * Tests actual satellite data retrieval with your API key and rice field coordinates
 */

const API_KEY = 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';

// Your rice field coordinates
const RICE_FIELD_COORDS = {
  lat: 28.368717,
  lng: 77.540933,
  polygon: [
    [28.368717, 77.540933],
    [28.368989, 77.540859],
    [28.369041, 77.541089],
    [28.368791, 77.541176]
  ]
};

// Create AOI from your coordinates
function createAOI(coordinates) {
  if (coordinates.polygon && coordinates.polygon.length >= 3) {
    const polygonCoords = coordinates.polygon.map(point => `[${point[1]}, ${point[0]}]`).join(', ');
    return `ee.Geometry.Polygon([[[${polygonCoords}]]])`;
  }
  return `ee.Geometry.Point([${coordinates.lng}, ${coordinates.lat}])`;
}

// Build Earth Engine expression for your rice field
function buildEEExpression(aoi, startDate, endDate) {
  return `
    var aoi = ${aoi};
    
    // Get Sentinel-2 Surface Reflectance collection for your rice field
    var s2 = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterBounds(aoi)
      .filterDate('${startDate}', '${endDate}')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
      .map(function(image) {
        // Cloud masking
        var qa = image.select('QA60');
        var cloudBitMask = 1 << 10;
        var cirrusBitMask = 1 << 11;
        var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
            .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
        return image.updateMask(mask).divide(10000);
      });
    
    // Calculate vegetation indices for rice monitoring
    var addIndices = function(image) {
      var ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
      var ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
      var ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');
      var ndre = image.normalizedDifference(['B8', 'B5']).rename('NDRE');
      
      // MSAVI2 - Modified Soil Adjusted Vegetation Index
      var msavi2 = image.expression(
        '(2 * NIR + 1 - sqrt(pow((2 * NIR + 1), 2) - 8 * (NIR - RED))) / 2', {
          'NIR': image.select('B8'),
          'RED': image.select('B4')
        }).rename('MSAVI2');
      
      // Soil Organic Carbon Visibility
      var soc_vis = image.expression(
        '(NIR - RED) / (NIR + RED + 0.16)', {
          'NIR': image.select('B8'),
          'RED': image.select('B4')
        }).rename('SOC_VIS');
      
      // Root Zone Soil Moisture
      var rsm = image.expression(
        '(NIR - SWIR1) / (NIR + SWIR1)', {
          'NIR': image.select('B8'),
          'SWIR1': image.select('B11')
        }).rename('RSM');
      
      // Ratio Vegetation Index
      var rvi = image.expression(
        'NIR / RED', {
          'NIR': image.select('B8'),
          'RED': image.select('B4')
        }).rename('RVI');
      
      return image.addBands([ndvi, ndwi, ndmi, ndre, msavi2, soc_vis, rsm, rvi]);
    };
    
    // Apply indices and get median composite
    var composite = s2.map(addIndices).median();
    
    // Reduce to get statistics over your rice field
    var stats = composite.select(['NDVI', 'NDWI', 'NDMI', 'NDRE', 'MSAVI2', 'SOC_VIS', 'RSM', 'RVI'])
      .reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: aoi,
        scale: 10,
        maxPixels: 1e9
      });
    
    // Get metadata
    var cloudCover = s2.aggregate_mean('CLOUDY_PIXEL_PERCENTAGE');
    var imageCount = s2.size();
    var dateRange = s2.aggregate_array('system:time_start');
    
    ee.Dictionary({
      'vegetation_indices': stats,
      'cloud_cover': cloudCover,
      'image_count': imageCount,
      'analysis_info': ee.Dictionary({
        'start_date': '${startDate}',
        'end_date': '${endDate}',
        'field_area_ha': aoi.area().divide(10000),
        'satellite': 'Sentinel-2'
      })
    })
  `;
}

// Test real GEE data retrieval
async function testRealGEEData() {
  console.log('🛰️ TESTING REAL GOOGLE EARTH ENGINE DATA');
  console.log('========================================');
  console.log(`Field Location: ${RICE_FIELD_COORDS.lat}°N, ${RICE_FIELD_COORDS.lng}°E`);
  console.log(`Polygon Points: ${RICE_FIELD_COORDS.polygon.length}`);
  console.log(`API Key: ${API_KEY.substring(0, 20)}...`);
  
  try {
    // Create AOI for your rice field
    const aoi = createAOI(RICE_FIELD_COORDS);
    console.log(`\n📍 Area of Interest: Rice field polygon created`);
    
    // Date range (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log(`📅 Date Range: ${startDate} to ${endDate}`);
    
    // Build Earth Engine expression
    const eeExpression = buildEEExpression(aoi, startDate, endDate);
    console.log(`\n🔄 Sending request to Google Earth Engine...`);
    
    // Prepare request
    const requestBody = {
      expression: eeExpression,
      fileFormat: 'JSON'
    };
    
    // Make request to GEE
    const response = await fetch(`https://earthengine.googleapis.com/v1alpha/projects/earthengine-legacy/value:compute?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
      
      if (response.status === 403) {
        console.log(`\n🔑 API Key Issue: The API key may not have Earth Engine access enabled`);
        console.log(`💡 Solutions:`);
        console.log(`   1. Enable Earth Engine API in Google Cloud Console`);
        console.log(`   2. Ensure the API key has Earth Engine permissions`);
        console.log(`   3. Try using OAuth authentication instead`);
      }
      
      return null;
    }
    
    const result = await response.json();
    console.log(`\n✅ Successfully retrieved data from Google Earth Engine!`);
    
    if (result && result.result) {
      const data = result.result;
      const indices = data.vegetation_indices || {};
      const metadata = data.analysis_info || {};
      
      console.log(`\n🌾 REAL SATELLITE DATA FOR YOUR RICE FIELD:`);
      console.log(`==========================================`);
      
      if (indices.NDVI !== undefined) {
        console.log(`NDVI (Vegetation Health): ${indices.NDVI.toFixed(3)} ${getHealthStatus(indices.NDVI, 'ndvi')}`);
      }
      if (indices.MSAVI2 !== undefined) {
        console.log(`MSAVI2 (Soil-Adjusted): ${indices.MSAVI2.toFixed(3)} ${getHealthStatus(indices.MSAVI2, 'msavi2')}`);
      }
      if (indices.NDRE !== undefined) {
        console.log(`NDRE (Nitrogen Status): ${indices.NDRE.toFixed(3)} ${getHealthStatus(indices.NDRE, 'ndre')}`);
      }
      if (indices.NDWI !== undefined) {
        console.log(`NDWI (Water Content): ${indices.NDWI.toFixed(3)} ${getHealthStatus(indices.NDWI, 'ndwi')}`);
      }
      if (indices.NDMI !== undefined) {
        console.log(`NDMI (Moisture Index): ${indices.NDMI.toFixed(3)} ${getHealthStatus(indices.NDMI, 'ndmi')}`);
      }
      if (indices.SOC_VIS !== undefined) {
        console.log(`SOC_VIS (Soil Organic): ${indices.SOC_VIS.toFixed(3)} ${getHealthStatus(indices.SOC_VIS, 'soc_vis')}`);
      }
      if (indices.RSM !== undefined) {
        console.log(`RSM (Root Soil Moisture): ${indices.RSM.toFixed(3)} ${getHealthStatus(indices.RSM, 'rsm')}`);
      }
      if (indices.RVI !== undefined) {
        console.log(`RVI (Ratio Vegetation): ${indices.RVI.toFixed(2)} ${getHealthStatus(indices.RVI, 'rvi')}`);
      }
      
      console.log(`\n📊 ANALYSIS METADATA:`);
      console.log(`Cloud Cover: ${data.cloud_cover ? data.cloud_cover.toFixed(1) + '%' : 'N/A'}`);
      console.log(`Images Used: ${data.image_count || 'N/A'}`);
      console.log(`Satellite: ${metadata.satellite || 'Sentinel-2'}`);
      console.log(`Field Area: ${metadata.field_area_ha ? metadata.field_area_ha.toFixed(2) + ' hectares' : 'N/A'}`);
      
      // Estimate NPK from real vegetation indices
      if (indices.NDVI && indices.NDRE && indices.NDWI) {
        console.log(`\n🧪 ESTIMATED NPK FROM REAL SATELLITE DATA:`);
        const nitrogen = estimateNitrogen(indices.NDRE, indices.NDVI);
        const phosphorus = estimatePhosphorus(indices.NDVI, indices.MSAVI2 || 0.5);
        const potassium = estimatePotassium(indices.NDVI, indices.NDWI, indices.NDMI || 0.3);
        
        console.log(`Nitrogen: ${nitrogen.toFixed(2)}% ${getNutrientStatus(nitrogen, 'N')}`);
        console.log(`Phosphorus: ${phosphorus.toFixed(2)}% ${getNutrientStatus(phosphorus, 'P')}`);
        console.log(`Potassium: ${potassium.toFixed(2)}% ${getNutrientStatus(potassium, 'K')}`);
      }
      
      console.log(`\n🎯 RESULT: ✅ REAL SATELLITE DATA SUCCESSFULLY RETRIEVED!`);
      return data;
      
    } else {
      console.log(`⚠️ No data returned from Earth Engine`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error testing real GEE data:`, error.message);
    
    if (error.message.includes('fetch')) {
      console.log(`\n🌐 Network Issue: Check internet connection`);
    } else if (error.message.includes('JSON')) {
      console.log(`\n📄 Response Parsing Issue: Invalid JSON response`);
    }
    
    return null;
  }
}

// Helper functions
function getHealthStatus(value, indexType) {
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
  
  const range = ranges[indexType];
  if (!range) return '(Unknown)';
  
  if (value >= range.excellent) return '(Excellent)';
  if (value >= range.good) return '(Good)';
  if (value >= range.moderate) return '(Moderate)';
  return '(Needs Attention)';
}

function estimateNitrogen(ndre, ndvi) {
  return Math.max(0.5, Math.min(5.0, ndre * 5.0 + ndvi * 1.5));
}

function estimatePhosphorus(ndvi, msavi2) {
  return Math.max(0.1, Math.min(1.5, (ndvi + msavi2) / 2 * 1.2));
}

function estimatePotassium(ndvi, ndwi, ndmi) {
  const waterStress = 1 - Math.max(ndwi, ndmi);
  return Math.max(0.8, Math.min(3.5, ndvi * (1 + waterStress) * 2.0));
}

function getNutrientStatus(value, nutrient) {
  const ranges = {
    N: { optimal: [2.0, 4.0], adequate: [1.5, 2.0] },
    P: { optimal: [0.3, 0.8], adequate: [0.2, 0.3] },
    K: { optimal: [1.5, 2.5], adequate: [1.0, 1.5] }
  };
  
  const range = ranges[nutrient];
  if (!range) return '(Unknown)';
  
  if (value >= range.optimal[0] && value <= range.optimal[1]) return '(Optimal)';
  if (value >= range.adequate[0]) return '(Adequate)';
  if (value < range.adequate[0]) return '(Deficient)';
  return '(Excessive)';
}

// Run the test
testRealGEEData().then(result => {
  if (result) {
    console.log(`\n🎉 SUCCESS: Real satellite data retrieved for your rice field!`);
    console.log(`📱 The system is now using actual Google Earth Engine data.`);
  } else {
    console.log(`\n⚠️ FALLBACK: Using enhanced simulation (API key may need Earth Engine access).`);
  }
  process.exit(result ? 0 : 1);
});