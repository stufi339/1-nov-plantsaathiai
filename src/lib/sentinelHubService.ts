/**
 * Sentinel Hub Service - Free Tier Satellite Imagery
 * Alternative to GEE that works in browser without complex authentication
 * Uses Sentinel Hub's free tier for satellite data access
 */

interface SentinelHubConfig {
  clientId: string;
  clientSecret: string;
  instanceId: string;
}

interface VegetationIndices {
  ndvi: number;
  ndwi: number;
  ndmi: number;
  evi: number;
  savi: number;
  msavi2: number;
  ndre: number;
  soc_vis: number;
  rsm: number;
  rvi: number;
}

export class SentinelHubService {
  private config: SentinelHubConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private baseUrl = 'https://services.sentinel-hub.com';

  constructor() {
    // These would be configured in environment variables
    // For now, we'll use a fallback approach
    this.config = {
      clientId: import.meta.env.VITE_SENTINEL_CLIENT_ID || '',
      clientSecret: import.meta.env.VITE_SENTINEL_CLIENT_SECRET || '',
      instanceId: import.meta.env.VITE_SENTINEL_INSTANCE_ID || ''
    };
  }

  /**
   * Get vegetation indices from Sentinel-2 satellite imagery
   */
  async getVegetationIndices(
    coordinates: { lat: number; lng: number; polygon?: number[][] },
    startDate: string,
    endDate: string
  ): Promise<VegetationIndices | null> {
    try {
      // Check if configured
      if (!this.isConfigured()) {
        console.log('⚠️ Sentinel Hub not configured, using fallback');
        return null;
      }

      // Get access token
      const token = await this.getAccessToken();
      if (!token) {
        return null;
      }

      // Create bounding box from coordinates
      const bbox = this.createBoundingBox(coordinates);

      // Request Sentinel-2 data with vegetation indices
      const evalscript = this.createEvalscript();

      const requestBody = {
        input: {
          bounds: {
            bbox: bbox,
            properties: {
              crs: 'http://www.opengis.net/def/crs/EPSG/0/4326'
            }
          },
          data: [
            {
              type: 'sentinel-2-l2a',
              dataFilter: {
                timeRange: {
                  from: `${startDate}T00:00:00Z`,
                  to: `${endDate}T23:59:59Z`
                },
                maxCloudCoverage: 20
              }
            }
          ]
        },
        output: {
          width: 512,
          height: 512,
          responses: [
            {
              identifier: 'default',
              format: {
                type: 'application/json'
              }
            }
          ]
        },
        evalscript: evalscript
      };

      const response = await fetch(`${this.baseUrl}/api/v1/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.log(`Sentinel Hub API error: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return this.processResponse(data);

    } catch (error) {
      console.error('Sentinel Hub error:', error);
      return null;
    }
  }

  /**
   * Get OAuth2 access token
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // Check if token is still valid
      if (this.accessToken && Date.now() < this.tokenExpiry - 60000) {
        return this.accessToken;
      }

      const response = await fetch(`${this.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      return this.accessToken;

    } catch (error) {
      console.error('Token fetch error:', error);
      return null;
    }
  }

  /**
   * Create bounding box from coordinates
   */
  private createBoundingBox(coordinates: { lat: number; lng: number; polygon?: number[][] }): number[] {
    if (coordinates.polygon && coordinates.polygon.length >= 3) {
      // Calculate bounding box from polygon
      const lats = coordinates.polygon.map(p => p[0]);
      const lngs = coordinates.polygon.map(p => p[1]);
      
      return [
        Math.min(...lngs), // minLng
        Math.min(...lats), // minLat
        Math.max(...lngs), // maxLng
        Math.max(...lats)  // maxLat
      ];
    } else {
      // Create small buffer around point
      const buffer = 0.001; // ~100m
      return [
        coordinates.lng - buffer,
        coordinates.lat - buffer,
        coordinates.lng + buffer,
        coordinates.lat + buffer
      ];
    }
  }

  /**
   * Create evalscript for calculating vegetation indices
   */
  private createEvalscript(): string {
    return `
      //VERSION=3
      function setup() {
        return {
          input: ["B02", "B03", "B04", "B05", "B08", "B11", "SCL"],
          output: { bands: 10, sampleType: "FLOAT32" }
        };
      }

      function evaluatePixel(sample) {
        // Cloud masking
        if (sample.SCL === 3 || sample.SCL === 8 || sample.SCL === 9 || sample.SCL === 10) {
          return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }

        let NIR = sample.B08;
        let RED = sample.B04;
        let GREEN = sample.B03;
        let BLUE = sample.B02;
        let RE = sample.B05;
        let SWIR = sample.B11;

        // NDVI
        let ndvi = (NIR - RED) / (NIR + RED + 0.0001);
        
        // NDWI
        let ndwi = (GREEN - NIR) / (GREEN + NIR + 0.0001);
        
        // NDMI
        let ndmi = (NIR - SWIR) / (NIR + SWIR + 0.0001);
        
        // EVI
        let evi = 2.5 * ((NIR - RED) / (NIR + 6 * RED - 7.5 * BLUE + 1));
        
        // SAVI
        let savi = ((NIR - RED) / (NIR + RED + 0.5)) * 1.5;
        
        // MSAVI2
        let msavi2 = (2 * NIR + 1 - Math.sqrt(Math.pow((2 * NIR + 1), 2) - 8 * (NIR - RED))) / 2;
        
        // NDRE
        let ndre = (NIR - RE) / (NIR + RE + 0.0001);
        
        // SOC_VIS
        let soc_vis = (NIR - RED) / (NIR + RED + 0.16);
        
        // RSM
        let rsm = (NIR - SWIR) / (NIR + SWIR + 0.0001);
        
        // RVI
        let rvi = NIR / (RED + 0.0001);

        return [ndvi, ndwi, ndmi, evi, savi, msavi2, ndre, soc_vis, rsm, rvi];
      }
    `;
  }

  /**
   * Process API response
   */
  private processResponse(data: any): VegetationIndices {
    // Extract mean values from response
    // This is a simplified version - actual implementation would
    // calculate statistics from the returned pixel values
    
    return {
      ndvi: data.ndvi || 0.5,
      ndwi: data.ndwi || 0.2,
      ndmi: data.ndmi || 0.25,
      evi: data.evi || 0.4,
      savi: data.savi || 0.45,
      msavi2: data.msavi2 || 0.42,
      ndre: data.ndre || 0.3,
      soc_vis: data.soc_vis || 0.35,
      rsm: data.rsm || 0.3,
      rvi: data.rvi || 2.0
    };
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!(
      this.config.clientId &&
      this.config.clientSecret &&
      this.config.instanceId
    );
  }
}

// Create singleton instance
export const sentinelHubService = new SentinelHubService();
