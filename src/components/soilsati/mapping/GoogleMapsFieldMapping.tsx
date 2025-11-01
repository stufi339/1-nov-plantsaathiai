import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Save, Satellite, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

interface GoogleMapsFieldMappingProps {
  onComplete: (coordinates: [number, number][], area: number) => void;
}

export const GoogleMapsFieldMapping = ({ onComplete }: GoogleMapsFieldMappingProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mappingMode, setMappingMode] = useState<'draw' | 'center'>('draw');
  
  // Drawing mode state
  const [coordinates, setCoordinates] = useState<[number, number][]>([]);
  const [markers, setMarkers] = useState<any[]>([]);
  const [polygon, setPolygon] = useState<any>(null);
  const drawingManager = useRef<any>(null);
  
  // Center-radius mode state
  const [centerPoint, setCenterPoint] = useState<[number, number] | null>(null);
  const [radius, setRadius] = useState(50); // meters
  const [centerMarker, setCenterMarker] = useState<any>(null);
  const [circle, setCircle] = useState<any>(null);

  const GOOGLE_MAPS_API_KEY = 'AIzaSyBZlJtstGEj9wCMP5_O5PaGytIi-iForN0';

  useEffect(() => {
    loadGoogleMaps();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast.error("Map loading timed out. Please refresh and try again.");
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []);

  const waitForContainerAndInitialize = (retryCount = 0) => {
    const maxRetries = 10;
    const retryDelay = 200; // 200ms between retries
    
    if (mapContainer.current) {
      console.log('Map container ready, initializing...');
      initializeMap();
    } else if (retryCount < maxRetries) {
      console.log(`Waiting for map container... (attempt ${retryCount + 1}/${maxRetries})`);
      setTimeout(() => waitForContainerAndInitialize(retryCount + 1), retryDelay);
    } else {
      console.error('Map container not ready after maximum retries');
      setIsLoading(false);
      toast.error("Failed to initialize map container. Please refresh the page.");
    }
  };

  const loadGoogleMaps = () => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('Google Maps already loaded, waiting for container...');
      waitForContainerAndInitialize();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Maps script loaded, waiting for container...');
      waitForContainerAndInitialize();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setIsLoading(false);
      toast.error("Failed to load Google Maps. Please check your internet connection.");
    };

    document.head.appendChild(script);
  };

  const initializeMap = () => {
    console.log('Initializing map...', {
      hasContainer: !!mapContainer.current,
      hasGoogle: !!window.google,
      hasMaps: !!(window.google && window.google.maps)
    });

    if (!mapContainer.current) {
      console.error('Map container not available');
      setIsLoading(false);
      toast.error("Map container not ready. Please refresh the page.");
      return;
    }

    if (!window.google || !window.google.maps) {
      console.error('Google Maps not available');
      setIsLoading(false);
      toast.error("Google Maps failed to load. Please refresh the page.");
      return;
    }

    // Get user location or default to India
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Got user location:', position.coords);
        createMap({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.log('Geolocation error, using default location:', error.message);
        // Default to center of India
        createMap({ lat: 20.5937, lng: 78.9629 });
      },
      { timeout: 5000 } // 5 second timeout for geolocation
    );
  };

  const createMap = (center: { lat: number; lng: number }) => {
    if (!mapContainer.current) {
      console.error('Map container not available');
      setIsLoading(false);
      return;
    }

    try {
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

      // Initialize Drawing Manager for polygon drawing
      drawingManager.current = new window.google.maps.drawing.DrawingManager({
        drawingMode: null, // Start with no drawing mode
        drawingControl: true,
        drawingControlOptions: {
          position: window.google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [
            window.google.maps.drawing.OverlayType.POLYGON,
          ],
        },
        polygonOptions: {
          fillColor: '#10b981',
          fillOpacity: 0.3,
          strokeWeight: 2,
          strokeColor: '#10b981',
          clickable: true,
          editable: true,
          draggable: false,
        },
      });

      drawingManager.current.setMap(map.current);

      // Listen for polygon complete
      window.google.maps.event.addListener(
        drawingManager.current,
        'polygoncomplete',
        (newPolygon: any) => {
          handlePolygonComplete(newPolygon);
        }
      );

      // Add click listener for center-radius mode
      map.current.addListener('click', (event: any) => {
        if (mappingMode === 'center') {
          const coord: [number, number] = [event.latLng.lng(), event.latLng.lat()];
          setCenterPoint(coord);
          updateCenterMarker(coord);
          updateCircle(coord, radius);
        }
      });

      // Wait for map to be fully loaded
      window.google.maps.event.addListenerOnce(map.current, 'tilesloaded', () => {
        setIsMapReady(true);
        setIsLoading(false);
        toast.success("🛰️ Satellite map loaded! Use the polygon tool to draw your field boundary.");
      });
      
      // Fallback in case tilesloaded doesn't fire
      setTimeout(() => {
        if (isLoading) {
          setIsMapReady(true);
          setIsLoading(false);
          toast.success("🛰️ Map ready!");
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error creating map:', error);
      setIsLoading(false);
      toast.error("Failed to create map. Please try again.");
    }
  };

  // Handle polygon drawing complete
  const handlePolygonComplete = (newPolygon: any) => {
    // Remove previous polygon if exists
    if (polygon) {
      polygon.setMap(null);
    }

    // Clear previous markers
    markers.forEach(marker => marker.setMap(null));
    setMarkers([]);

    // Get polygon coordinates
    const path = newPolygon.getPath();
    const coords: [number, number][] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push([point.lng(), point.lat()]);
    }

    setCoordinates(coords);
    setPolygon(newPolygon);

    // Disable drawing mode after completing polygon
    if (drawingManager.current) {
      drawingManager.current.setDrawingMode(null);
    }

    toast.success(`Field boundary drawn! ${coords.length} points captured.`);
  };

  // Drawing mode functions
  const addDrawPoint = (coord: [number, number]) => {
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

  // Center-radius mode functions
  const updateCenterMarker = (coord: [number, number]) => {
    if (!map.current || !window.google) return;

    // Remove existing marker
    if (centerMarker) {
      centerMarker.setMap(null);
    }

    // Add new marker
    const marker = new window.google.maps.Marker({
      position: { lat: coord[1], lng: coord[0] },
      map: map.current,
      title: 'Field Center',
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    setCenterMarker(marker);
  };

  const updateCircle = (center: [number, number], radiusMeters: number) => {
    if (!map.current || !window.google) return;

    // Remove existing circle
    if (circle) {
      circle.setMap(null);
    }

    // Create new circle
    const newCircle = new window.google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3b82f6',
      fillOpacity: 0.2,
      map: map.current,
      center: { lat: center[1], lng: center[0] },
      radius: radiusMeters,
    });

    setCircle(newCircle);
  };

  const clearMap = () => {
    // Clear drawing mode
    markers.forEach((marker) => marker.setMap(null));
    setMarkers([]);
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
    setCoordinates([]);

    // Reset drawing manager
    if (drawingManager.current) {
      drawingManager.current.setDrawingMode(null);
    }

    // Clear center-radius mode
    if (centerMarker) {
      centerMarker.setMap(null);
      setCenterMarker(null);
    }
    if (circle) {
      circle.setMap(null);
      setCircle(null);
    }
    setCenterPoint(null);

    toast.success("🗑️ Map cleared - Ready to draw new boundary");
  };

  const completeDrawMapping = () => {
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

  const completeCenterMapping = () => {
    if (!centerPoint) {
      toast.error("Please click on the map to set the field center");
      return;
    }

    // Create circular field coordinates
    const center = { lat: centerPoint[1], lng: centerPoint[0] };
    const circleCoords: [number, number][] = [];
    const numPoints = 32; // Number of points to approximate circle

    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 360) / numPoints;
      const point = window.google.maps.geometry.spherical.computeOffset(
        new window.google.maps.LatLng(center.lat, center.lng),
        radius,
        angle
      );
      circleCoords.push([point.lng(), point.lat()]);
    }

    // Close the polygon
    const closedCoordinates = [...circleCoords, circleCoords[0]];
    const areaInSqMeters = Math.PI * radius * radius;
    const areaInHectares = areaInSqMeters / 10000;

    toast.success(`🎉 Circular field mapped! Area: ${areaInHectares.toFixed(2)} hectares`);
    onComplete(closedCoordinates, areaInHectares);
  };

  return (
    <div className="space-y-4">
      {/* Loading Overlay */}
      {isLoading && (
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
      )}

      {/* Mapping Mode Selector */}
      <Tabs value={mappingMode} onValueChange={(value) => {
        setMappingMode(value as 'draw' | 'center');
        clearMap();
      }}>
        <TabsList className={`grid w-full grid-cols-2 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <TabsTrigger value="draw" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Draw Boundary
          </TabsTrigger>
          <TabsTrigger value="center" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Center + Radius
          </TabsTrigger>
        </TabsList>

        {/* Map Container - ALWAYS RENDERED so ref can attach */}
        <Card className="overflow-hidden shadow-elevated mt-4">
          <div 
            ref={mapContainer} 
            className="h-96 w-full" 
            style={{ visibility: isLoading ? 'hidden' : 'visible' }}
          />
          {isLoading && (
            <div className="h-96 w-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <Satellite className="w-12 h-12 mx-auto mb-2 text-blue-600 animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
        </Card>

        <TabsContent value="draw" className="space-y-4">
          {/* Drawing Status */}
          {isMapReady && (
            <Card className="p-4 bg-card shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Boundary Points</p>
                  <p className="text-xs text-muted-foreground">
                    {coordinates.length === 0
                      ? "Click on map to start drawing"
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

          {/* Drawing Controls */}
          {isMapReady && (
            <div className="space-y-2">
              <Button
                onClick={completeDrawMapping}
                className="w-full h-12 bg-gradient-primary"
                disabled={coordinates.length < 3}
              >
                <Save className="w-5 h-5 mr-2" />
                Complete Field Mapping ({coordinates.length} points)
              </Button>
              {coordinates.length > 0 && (
                <Button onClick={clearMap} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Points
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="center" className="space-y-4">
          {/* Center-Radius Status */}
          {isMapReady && (
            <Card className="p-4 bg-card shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Field Center</p>
                  <p className="text-xs text-muted-foreground">
                    {!centerPoint
                      ? "Click on map to set center"
                      : `Center set • ${radius}m radius`}
                  </p>
                </div>
                {centerPoint && (
                  <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                    Ready to save
                  </span>
                )}
              </div>

              {/* Radius Slider */}
              <div className="space-y-2 mt-4">
                <Label className="text-sm font-medium">Field Radius: {radius} meters</Label>
                <Slider
                  value={[radius]}
                  onValueChange={(value) => {
                    setRadius(value[0]);
                    if (centerPoint) {
                      updateCircle(centerPoint, value[0]);
                    }
                  }}
                  max={200}
                  min={10}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10m</span>
                  <span>Area: {((Math.PI * radius * radius) / 10000).toFixed(3)} hectares</span>
                  <span>200m</span>
                </div>
              </div>
            </Card>
          )}

          {/* Center-Radius Controls */}
          {isMapReady && (
            <div className="space-y-2">
              <Button
                onClick={completeCenterMapping}
                className="w-full h-12 bg-gradient-primary"
                disabled={!centerPoint}
              >
                <Save className="w-5 h-5 mr-2" />
                Complete Circular Field ({radius}m radius)
              </Button>
              {centerPoint && (
                <Button onClick={clearMap} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Center Point
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Instructions */}
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-2 mb-2">
          <Satellite className="w-4 h-4 text-blue-600" />
          <p className="text-xs text-blue-800 font-medium">🛰️ Satellite Field Mapping:</p>
        </div>
        {mappingMode === 'draw' ? (
          <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
            <li>Use satellite view to see your actual field clearly</li>
            <li>Click on map to add corner points of your field boundary</li>
            <li>Add at least 3 points to form a complete field polygon</li>
            <li>Points will connect automatically to show field area</li>
          </ul>
        ) : (
          <ul className="text-xs text-blue-700 space-y-0.5 list-disc list-inside">
            <li>Click on the center of your circular field</li>
            <li>Adjust the radius slider to match your field size</li>
            <li>Perfect for round fields or quick area estimation</li>
            <li>Area is calculated automatically as you adjust radius</li>
          </ul>
        )}
      </Card>
    </div>
  );
};