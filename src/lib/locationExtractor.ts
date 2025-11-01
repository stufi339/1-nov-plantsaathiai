/**
 * Location Extractor Service
 * Extracts location data (village, district, state) from field data
 */

export interface LocationData {
  lat: number;
  lng: number;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
}

/**
 * Extract location data from field object
 */
export function extractLocationFromField(field: any): LocationData | undefined {
  if (!field) return undefined;

  const location: LocationData = {
    lat: field.coordinates?.lat || field.lat || 0,
    lng: field.coordinates?.lng || field.lng || 0
  };

  // Extract from field properties
  if (field.village) location.village = field.village;
  if (field.district) location.district = field.district;
  if (field.state) location.state = field.state;
  if (field.country) location.country = field.country;

  // Extract from nested location object
  if (field.location) {
    if (field.location.village) location.village = field.location.village;
    if (field.location.district) location.district = field.location.district;
    if (field.location.state) location.state = field.location.state;
    if (field.location.country) location.country = field.location.country;
  }

  // Extract from address object
  if (field.address) {
    if (field.address.village) location.village = field.address.village;
    if (field.address.district) location.district = field.address.district;
    if (field.address.state) location.state = field.address.state;
    if (field.address.country) location.country = field.address.country;
  }

  // If no coordinates, return undefined
  if (!location.lat && !location.lng) return undefined;

  return location;
}

/**
 * Get location from field ID by looking up in localStorage
 */
export function getLocationFromFieldId(fieldId: string): LocationData | undefined {
  try {
    // Try to get field from localStorage
    const fieldsStr = localStorage.getItem('fields');
    if (!fieldsStr) return undefined;

    const fields = JSON.parse(fieldsStr);
    const field = fields.find((f: any) => f.id === fieldId);
    
    return extractLocationFromField(field);
  } catch (error) {
    console.error('Failed to extract location from field ID:', error);
    return undefined;
  }
}

/**
 * Reverse geocode coordinates to get location details
 * This is a placeholder - in production, you'd use a real geocoding service
 */
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | undefined> {
  // In production, integrate with:
  // - Google Maps Geocoding API
  // - OpenStreetMap Nominatim
  // - MapBox Geocoding API
  
  // For now, return basic location based on coordinates
  // This is a very rough approximation for Indian states
  const location: LocationData = { lat, lng, country: 'India' };

  // Rough state detection based on coordinates (India)
  if (lat >= 18 && lat <= 20 && lng >= 72 && lng <= 75) {
    location.state = 'Maharashtra';
  } else if (lat >= 30 && lat <= 32 && lng >= 74 && lng <= 76) {
    location.state = 'Punjab';
  } else if (lat >= 28 && lat <= 30 && lng >= 76 && lng <= 78) {
    location.state = 'Haryana';
  } else if (lat >= 25 && lat <= 28 && lng >= 80 && lng <= 84) {
    location.state = 'Uttar Pradesh';
  } else if (lat >= 22 && lat <= 27 && lng >= 87 && lng <= 89) {
    location.state = 'West Bengal';
  }

  return location;
}

/**
 * Format location as string
 */
export function formatLocation(location?: LocationData): string {
  if (!location) return 'Unknown Location';

  const parts: string[] = [];
  if (location.village) parts.push(location.village);
  if (location.district) parts.push(location.district);
  if (location.state) parts.push(location.state);
  if (location.country && parts.length === 0) parts.push(location.country);

  return parts.length > 0 ? parts.join(', ') : `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}
