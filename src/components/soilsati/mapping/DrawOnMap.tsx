import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Save, Trash2, Satellite } from "lucide-react";
import { toast } from "sonner";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

interface DrawOnMapProps {
  onComplete: (coordinates: [number, number][], area: number) => void;
}

export const DrawOnMap = ({ onComplete }: DrawOnMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polygon, setPolygon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeMap();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing`;
    script.async = true;
    script.defer = true;
    
    // Set up callback
    window.initGoogleMap = () => {
      initializeMap();
    };
    
    script.onload = () => {
      initializeMap();
    };
    
    script.onerror = () => {
      setIsLoading(false);
      toast.error("Failed to load Google Maps. Please check your internet connection.");
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapContainer.current || !window.google) return;

    // Get user location or default to India
    navigator.geolocation.getCurrentPosition(
      (position) => {
        createMap({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => {
        // Default to center of India
        createMap({ lat: 20.5937, lng: 78.9629 });
      }
    );
  };

  const createMap = (center: { lat: number; lng: number }) => {
    if (!mapContainer.current) return;

    map.current = new window.google.maps.Map(mapContainer.current, {
      center: center,
      zoom: 16,
      mapTypeId: 'satellite',
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER,
      },
      zoomControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Add click listener for drawing
    map.current.addListener('click', (event: any) => {
      const coord: [number, number] = [event.latLng.lng(), event.latLng.lat()];
      addPoint(coord);
    });

    setIsMapReady(true);
    setIsLoading(false);
    toast.success("🛰️ Satellite map loaded! Click to add boundary points.");
  };

  const addPoint = (coord: [number, number]) => {
    if (!map.current || !window.google) return;

    const newCoords = [...coordinates, coord];
    setCoordinates(newCoords);

    // Add marker
    const marker = new window.google.maps.Marker({
      position: { lat: coord[1], lng: coord[0] },
      map: map.current,
      title: `Point ${newCoords.length}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    setMarkers((prev) => [...prev, marker]);

    // Draw polygon if we have at least 3 points
    if (newCoords.length >= 3) {
      drawPolygon(newCoords);
    } else if (newCoords.length === 2) {
      // Draw line for 2 points
      drawLine(newCoords);
    }

    toast.success(`📍 Point ${newCoords.length} added`);
  };

  const drawLine = (coords: [number, number][]) => {
    if (!map.current || !window.google || coords.length < 2) return;

    // Remove existing polygon
    if (polygon) {
      polygon.setMap(null);
    }

    // Create polyline for 2 points
    const polyline = new window.google.maps.Polyline({
      path: coords.map(coord => ({ lat: coord[1], lng: coord[0] })),
      geodesic: true,
      strokeColor: '#10b981',
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });

    polyline.setMap(map.current);
    setPolygon(polyline);
  };

  const drawPolygon = (coords: [number, number][]) => {
    if (!map.current || !window.google || coords.length < 3) return;

    // Remove existing polygon
    if (polygon) {
      polygon.setMap(null);
    }

    // Create polygon
    const newPolygon = new window.google.maps.Polygon({
      paths: coords.map(coord => ({ lat: coord[1], lng: coord[0] })),
      strokeColor: '#10b981',
      strokeOpacity: 0.8,
      strokeWeight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.2,
    });

    newPolygon.setMap(map.current);
    setPolygon(newPolygon);
  };

  const clearMap = () => {
    // Remove markers
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);

    // Remove polygon
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }

    setCoordinates([]);
    toast.success("🗑️ Map cleared");
  };

  const completeMapping = () => {
    if (coordinates.length < 3) {
      toast.error("Please add at least 3 points to create a field boundary");
      return;
    }

    // Close the polygon
    const closedCoordinates = [...coordinates, coordinates[0]];

    // Calculate area using Google Maps geometry library
    const path = coordinates.map(coord => new window.google.maps.LatLng(coord[1], coord[0]));
    const areaInSqMeters = window.google.maps.geometry.spherical.computeArea(path);
    const areaInHectares = areaInSqMeters / 10000;

    toast.success(`🎉 Field mapped! Area: ${areaInHectares.toFixed(2)} hectares`);
    onComplete(closedCoordinates, areaInHectares);
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-card shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <Satellite className="w-5 h-5 text-blue-600 animate-pulse" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Loading Satellite Map</h3>
            <p className="text-sm text-muted-foreground">
              Initializing Google Earth Engine satellite imagery...
            </p>
          </div>
        </div>
        <div className="w-full bg-muted rounded-lg h-4 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-lg animate-pulse w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <Card className="overflow-hidden shadow-elevated">
        <div ref={mapContainer} className="h-96 w-full" />
      </Card>

      {/* Status */}
      {isMapReady && (
        <Card className="p-4 bg-card shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm font-medium text-foreground">Boundary Points</p>
              <p className="text-xs text-muted-foreground">
                {coordinates.length === 0
                  ? "Tap on map to start"
                  : `${coordinates.length} points added`}
              </p>
            </div>
            {coordinates.length >= 3 && (
              <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                Ready to save
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Controls */}
      {isMapReady && (
        <div className="space-y-2">
          <Button
            onClick={completeMapping}
            className="w-full h-12 bg-gradient-primary"
            disabled={coordinates.length < 3}
          >
            <Save className="w-5 h-5 mr-2" />
            Complete Mapping ({coordinates.length} points)
          </Button>
          {coordinates.length > 0 && (
            <Button onClick={clearMap} variant="outline" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Points
            </Button>
          )}
        </div>
      )}

      {/* Instructions */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Satellite className="w-4 h-4 text-blue-600" />
          <p className="text-xs text-blue-800 font-medium">🛰️ Satellite Field Mapping:</p>
        </div>
        <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
          <li>Use satellite view to see your actual field clearly</li>
          <li>Click on map to add corner points of your field boundary</li>
          <li>Add at least 3 points to form a complete field polygon</li>
          <li>Points will connect automatically to show field area</li>
          <li>Switch between satellite and map view using controls</li>
        </ul>
      </Card>
    </div>
  );
};
