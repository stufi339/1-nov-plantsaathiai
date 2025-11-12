/**
 * Plant Saathi - Satellite Data Proxy Server
 * Handles Google Earth Engine authentication and data fetching
 */

import ee from '@google/earthengine';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Service account credentials
const privateKey = {
  type: 'service_account',
  project_id: process.env.GEE_PROJECT_ID,
  private_key: process.env.GEE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GEE_CLIENT_EMAIL,
};

// Initialize Earth Engine
let eeInitialized = false;

function initializeEE() {
  return new Promise((resolve, reject) => {
    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        ee.initialize(
          null,
          null,
          () => {
            console.log('✅ Earth Engine initialized successfully');
            eeInitialized = true;
            resolve();
          },
          (error) => {
            console.error('❌ Earth Engine initialization failed:', error);
            reject(error);
          }
        );
      },
      (error) => {
        console.error('❌ Earth Engine authentication failed:', error);
        reject(error);
      }
    );
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    eeInitialized,
    timestamp: new Date().toISOString()
  });
});

// Get vegetation indices from Sentinel-2
app.post('/api/satellite/vegetation', async (req, res) => {
  try {
    if (!eeInitialized) {
      return res.status(503).json({
        error: 'Earth Engine not initialized',
        message: 'Please wait for service to start'
      });
    }

    const { lat, lng, polygon, startDate, endDate, cloudCoverThreshold = 20 } = req.body;

    // Validate inputs
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Missing lat/lng coordinates' });
    }

    console.log(`🛰️ Fetching satellite data for: ${lat}, ${lng}`);

    // Create geometry
    let geometry;
    if (polygon && polygon.length >= 3) {
      // Use provided polygon
      const coords = polygon.map(p => [p[1], p[0]]); // Convert [lat, lng] to [lng, lat]
      geometry = ee.Geometry.Polygon([coords]);
    } else {
      // Create buffer around point
      geometry = ee.Geometry.Point([lng, lat]).buffer(100);
    }

    // Get Sentinel-2 Surface Reflectance collection
    const s2 = ee.ImageCollection('COPERNICUS/S2_SR')
      .filterBounds(geometry)
      .filterDate(startDate || '2024-10-01', endDate || '2024-11-01')
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', cloudCoverThreshold))
      .map((image) => {
        // Cloud masking using SCL band (Scene Classification Layer)
        const scl = image.select('SCL');
        // Mask clouds (3), cloud shadows (8), and cirrus (9)
        const mask = scl.neq(3).and(scl.neq(8)).and(scl.neq(9));
        return image.updateMask(mask).divide(10000);
      });

    // Check if collection has any images
    const collectionSize = s2.size();
    
    // Get the count first to check if we have data
    const count = await new Promise((resolve, reject) => {
      collectionSize.evaluate((result, error) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    // If no images found, return early with appropriate response
    if (count === 0) {
      console.log('⚠️  No Sentinel-2 images found for this location/date range');
      return res.json({
        success: true,
        data: {
          ndvi: null,
          msavi2: null,
          ndre: null,
          ndwi: null,
          ndmi: null,
          soc_vis: null,
          rsm: null,
          rvi: null,
          cloudCover: 0,
          imageCount: 0,
          dataSource: 'No satellite data available',
          acquisitionDate: new Date().toISOString(),
          confidence: 0,
          message: 'No Sentinel-2 images available for this location/date range. This could be due to heavy cloud cover or location outside coverage area.'
        }
      });
    }

    // Calculate vegetation indices
    const addIndices = (image) => {
      const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
      const ndwi = image.normalizedDifference(['B3', 'B8']).rename('NDWI');
      const ndmi = image.normalizedDifference(['B8', 'B11']).rename('NDMI');
      const ndre = image.normalizedDifference(['B8', 'B5']).rename('NDRE');
      
      const msavi2 = image.expression(
        '(2 * NIR + 1 - sqrt(pow((2 * NIR + 1), 2) - 8 * (NIR - RED))) / 2',
        {
          NIR: image.select('B8'),
          RED: image.select('B4')
        }
      ).rename('MSAVI2');
      
      const soc_vis = image.expression(
        '(NIR - RED) / (NIR + RED + 0.16)',
        {
          NIR: image.select('B8'),
          RED: image.select('B4')
        }
      ).rename('SOC_VIS');
      
      const rsm = image.expression(
        '(NIR - SWIR1) / (NIR + SWIR1)',
        {
          NIR: image.select('B8'),
          SWIR1: image.select('B11')
        }
      ).rename('RSM');
      
      const rvi = image.expression(
        'NIR / RED',
        {
          NIR: image.select('B8'),
          RED: image.select('B4')
        }
      ).rename('RVI');
      
      return image.addBands([ndvi, ndwi, ndmi, ndre, msavi2, soc_vis, rsm, rvi]);
    };

    // Get median composite
    const composite = s2.map(addIndices).median();

    // Reduce to get mean values
    const stats = composite.select([
      'NDVI', 'NDWI', 'NDMI', 'NDRE', 'MSAVI2', 'SOC_VIS', 'RSM', 'RVI'
    ]).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: geometry,
      scale: 10,
      maxPixels: 1e9
    });

    // Get cloud cover
    const cloudCover = s2.aggregate_mean('CLOUDY_PIXEL_PERCENTAGE');
    const imageCount = s2.size();

    // Get the results
    const result = await new Promise((resolve, reject) => {
      stats.evaluate((statsResult, error) => {
        if (error) {
          reject(error);
        } else {
          cloudCover.evaluate((cloudResult) => {
            imageCount.evaluate((countResult) => {
              resolve({
                indices: statsResult,
                cloudCover: cloudResult || 0,
                imageCount: countResult || 0
              });
            });
          });
        }
      });
    });

    console.log('✅ Successfully fetched satellite data');

    res.json({
      success: true,
      data: {
        ndvi: result.indices.NDVI || null,
        msavi2: result.indices.MSAVI2 || null,
        ndre: result.indices.NDRE || null,
        ndwi: result.indices.NDWI || null,
        ndmi: result.indices.NDMI || null,
        soc_vis: result.indices.SOC_VIS || null,
        rsm: result.indices.RSM || null,
        rvi: result.indices.RVI || null,
        cloudCover: result.cloudCover,
        imageCount: result.imageCount,
        dataSource: 'Sentinel-2 Real Satellite',
        acquisitionDate: new Date().toISOString(),
        confidence: result.imageCount > 0 ? 0.95 : 0
      }
    });

  } catch (error) {
    console.error('❌ Error fetching satellite data:', error);
    res.status(500).json({
      error: 'Failed to fetch satellite data',
      message: error.message
    });
  }
});

// Start server
initializeEE()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Satellite proxy server running on port ${PORT}`);
      console.log(`📡 Ready to serve real satellite data from Google Earth Engine`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
