/**
 * Field Screenshot Service
 * Captures satellite imagery of field location for user trust and black box storage
 */

interface FieldScreenshot {
  fieldId: string;
  coordinates: {
    lat: number;
    lng: number;
    polygon?: [number, number][];
  };
  screenshotUrl: string;
  timestamp: string;
  mapType: 'satellite' | 'hybrid' | 'terrain';
}

export class FieldScreenshotService {
  private static readonly GOOGLE_MAPS_API_KEY = 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';

  /**
   * Generate satellite image URL for field location
   */
  static generateSatelliteImageUrl(
    coordinates: { lat: number; lng: number; polygon?: [number, number][] },
    size: { width: number; height: number } = { width: 600, height: 400 }
  ): string {
    const { lat, lng, polygon } = coordinates;
    
    // Use Google Static Maps API for satellite imagery
    let url = `https://maps.googleapis.com/maps/api/staticmap?`;
    url += `center=${lat},${lng}`;
    url += `&zoom=17`; // Close zoom for field detail
    url += `&size=${size.width}x${size.height}`;
    url += `&maptype=satellite`;
    url += `&key=${this.GOOGLE_MAPS_API_KEY}`;
    
    // Add polygon overlay if available
    if (polygon && polygon.length >= 3) {
      const pathString = polygon.map(p => `${p[0]},${p[1]}`).join('|');
      url += `&path=color:0x00FF00|weight:3|fillcolor:0x00FF0033|${pathString}|${polygon[0][0]},${polygon[0][1]}`;
    } else {
      // Add marker for single point
      url += `&markers=color:green|${lat},${lng}`;
    }
    
    return url;
  }

  /**
   * Capture field screenshot and prepare for storage
   */
  static async captureFieldScreenshot(
    fieldId: string,
    coordinates: { lat: number; lng: number; polygon?: [number, number][] }
  ): Promise<FieldScreenshot> {
    const screenshotUrl = this.generateSatelliteImageUrl(coordinates);
    
    const screenshot: FieldScreenshot = {
      fieldId,
      coordinates,
      screenshotUrl,
      timestamp: new Date().toISOString(),
      mapType: 'satellite'
    };
    
    // In production, this would upload to cloud storage
    // For now, we'll use the Google Static Maps URL
    
    return screenshot;
  }

  /**
   * Generate thumbnail for quick preview
   */
  static generateThumbnailUrl(
    coordinates: { lat: number; lng: number },
    size: number = 200
  ): string {
    return this.generateSatelliteImageUrl(
      coordinates,
      { width: size, height: size }
    );
  }

  /**
   * Convert image URL to base64 for storage
   */
  static async imageUrlToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return '';
    }
  }

  /**
   * Get hybrid map view (satellite + labels)
   */
  static generateHybridMapUrl(
    coordinates: { lat: number; lng: number; polygon?: [number, number][] },
    size: { width: number; height: number } = { width: 600, height: 400 }
  ): string {
    const url = this.generateSatelliteImageUrl(coordinates, size);
    return url.replace('maptype=satellite', 'maptype=hybrid');
  }
}

export const fieldScreenshotService = FieldScreenshotService;
