import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  CloudSnow,
  CloudDrizzle,
  CloudFog,
  Thermometer,
  Eye,
  Gauge,
  Sprout,
} from "lucide-react";
import { weatherService, WeatherData } from "@/lib/weatherService";
import { useTranslation } from "react-i18next";
import { blackBoxService } from "@/lib/blackBoxService";
import { JalSaathiView } from "./JalSaathiView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Field {
  id: string;
  name: string;
  cropType: string;
  sowingDate?: string;
  location?: { lat: number; lng: number };
  area?: number;
}

export const WeatherView = () => {
  const { t } = useTranslation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchCity, setSearchCity] = useState("");
  const [activeTab, setActiveTab] = useState("forecast");
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [selectedField, setSelectedField] = useState<Field | null>(null);

  useEffect(() => {
    // Log weather view access
    blackBoxService.logUserInteraction('page_view', 'weather_view', undefined, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Load fields from localStorage
    loadFields();
  }, []);

  useEffect(() => {
    // When a field is selected, fetch weather for that field's location
    if (selectedField) {
      if (selectedField.location) {
        // Convert lng to lon for weather service
        const weatherLocation = {
          lat: selectedField.location.lat,
          lon: selectedField.location.lng
        };
        setCurrentLocation(weatherLocation);
        weatherService.getWeatherByCoords(weatherLocation.lat, weatherLocation.lon)
          .then(data => {
            setWeatherData(data);
            setError(null);
          })
          .catch(err => {
            console.error('Failed to get weather:', err);
            setError('Failed to get weather for field location');
          });
      } else {
        // Fallback to city-based weather
        fetchWeatherByLocation();
      }
    }
  }, [selectedField]);

  const loadFields = () => {
    try {
      const fieldsList = JSON.parse(localStorage.getItem('fields_list') || '[]');
      
      // Load full field data for each field
      const fieldsWithData = fieldsList.map((field: any) => {
        try {
          const fieldData = localStorage.getItem(`field_${field.id}_data`);
          if (fieldData) {
            const parsedData = JSON.parse(fieldData);
            return {
              id: field.id,
              name: field.name || `Field ${field.id.slice(0, 8)}`,
              cropType: parsedData.cropType || field.cropType || 'Unknown',
              sowingDate: parsedData.sowingDate || field.sowingDate,
              location: parsedData.location || field.location,
              area: parsedData.area || field.area
            };
          }
          return field;
        } catch (e) {
          return field;
        }
      });

      setFields(fieldsWithData);

      // Auto-select first field if available
      if (fieldsWithData.length > 0 && !selectedFieldId) {
        const firstField = fieldsWithData[0];
        setSelectedFieldId(firstField.id);
        setSelectedField(firstField);
      }
    } catch (error) {
      console.error('Failed to load fields:', error);
    }
  };

  const fetchWeatherByLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const location = await weatherService.getCurrentLocation();
      setCurrentLocation(location);
      const data = await weatherService.getWeatherByCoords(location.lat, location.lon);
      setWeatherData(data);
      localStorage.setItem("last_weather_city", data.location);

      // Log weather data fetch with comprehensive details
      blackBoxService.logUserInteraction('button_click', 'weather_fetch_by_location', undefined, {
        method: 'geolocation',
        location: data.location,
        country: data.country,
        coordinates: { lat: location.lat, lon: location.lon },
        weatherCondition: data.current.description,
        temperature: data.current.temp,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed,
        timestamp: new Date().toISOString()
      }, {
        lat: location.lat,
        lng: location.lon,
        state: data.location // Approximate - would need geocoding for exact state
      });
    } catch (err) {
      console.error("Failed to get weather by location:", err);
      setError("Unable to get your location. Please search for a city.");
      
      // Log error
      blackBoxService.logError(
        'api_failure',
        err instanceof Error ? err.message : 'Failed to get weather by location',
        undefined,
        'weather_fetch_by_location',
        err instanceof Error ? err.stack : undefined,
        false
      );
      
      // Fallback to a default city
      fetchWeatherByCity("New Delhi");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city: string) => {
    if (!city.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await weatherService.getWeatherByCity(city);
      setWeatherData(data);
      localStorage.setItem("last_weather_city", city);
      setSearchCity("");

      // Log comprehensive weather data fetch
      blackBoxService.logUserInteraction('button_click', 'weather_fetch_by_city', undefined, {
        method: 'city_search',
        searchQuery: city,
        location: data.location,
        country: data.country,
        weatherCondition: data.current.description,
        temperature: data.current.temp,
        feelsLike: data.current.feels_like,
        humidity: data.current.humidity,
        windSpeed: data.current.wind_speed,
        pressure: data.current.pressure,
        visibility: data.current.visibility,
        clouds: data.current.clouds,
        forecast: data.forecast.map(f => ({
          day: f.day,
          temp_max: f.temp_max,
          temp_min: f.temp_min,
          precipitation: f.precipitation,
          description: f.description
        })),
        farmingAdvice: data.farmingAdvice,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to get weather:", err);
      setError("City not found. Please try another location.");
      
      // Log error with search context
      blackBoxService.logError(
        'api_failure',
        err instanceof Error ? err.message : 'City not found',
        undefined,
        'weather_fetch_by_city',
        err instanceof Error ? err.stack : undefined,
        false
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity.trim()) {
      fetchWeatherByCity(searchCity);
    }
  };

  const getWeatherIcon = (icon: string, size: "sm" | "lg" = "sm") => {
    const iconSize = size === "lg" ? "h-16 w-16" : "h-8 w-8";
    const iconCode = icon.substring(0, 2);

    switch (iconCode) {
      case "01":
        return <Sun className={iconSize} />;
      case "02":
      case "03":
      case "04":
        return <Cloud className={iconSize} />;
      case "09":
        return <CloudDrizzle className={iconSize} />;
      case "10":
        return <CloudRain className={iconSize} />;
      case "11":
        return <CloudRain className={iconSize} />;
      case "13":
        return <CloudSnow className={iconSize} />;
      case "50":
        return <CloudFog className={iconSize} />;
      default:
        return <Cloud className={iconSize} />;
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">🌤️ Weather & Irrigation</h1>
        <p className="text-green-50 text-sm">
          Weather forecasts and smart irrigation scheduling for your farm
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Field Selector */}
        {fields.length > 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Sprout className="h-4 w-4" />
                  Select Your Field
                </label>
                <Select
                  value={selectedFieldId}
                  onValueChange={(value) => {
                    setSelectedFieldId(value);
                    const field = fields.find(f => f.id === value);
                    setSelectedField(field || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a field..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fields.map((field) => (
                      <SelectItem key={field.id} value={field.id}>
                        <div className="flex items-center gap-2">
                          <Sprout className="h-4 w-4" />
                          <span className="font-medium">{field.name}</span>
                          <span className="text-muted-foreground">• {field.cropType}</span>
                          {field.area && (
                            <span className="text-muted-foreground">• {field.area} acres</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedField && (
                  <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Sprout className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{selectedField.cropType}</span>
                    </div>
                    {selectedField.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="text-muted-foreground">
                          {selectedField.location.lat.toFixed(4)}, {selectedField.location.lng.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900 dark:text-amber-100">No Fields Found</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    Please add a field in Soil Saathi first to get weather and irrigation recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="forecast" disabled={!selectedField}>
              <Cloud className="h-4 w-4 mr-2" />
              Weather Forecast
            </TabsTrigger>
            <TabsTrigger value="irrigation" disabled={!selectedField}>
              <Droplets className="h-4 w-4 mr-2" />
              Jal Saathi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-4 mt-4">
        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search city (e.g., New Delhi, Mumbai)"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
              <Button type="button" variant="outline" onClick={fetchWeatherByLocation} disabled={loading}>
                <MapPin className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </form>
            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {weatherData && (
          <>
            {/* Current Weather Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4" />
                      <h2 className="text-xl font-semibold">
                        {weatherData.location}, {weatherData.country}
                      </h2>
                    </div>
                    <p className="text-blue-100 text-sm">Updated just now</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Feels like</p>
                    <p className="text-2xl font-bold">{weatherData.current.feels_like}°C</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    {getWeatherIcon(weatherData.current.icon, "lg")}
                    <div>
                      <p className="text-5xl font-bold">{weatherData.current.temp}°C</p>
                      <p className="text-blue-100 capitalize">{weatherData.current.description}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-blue-400/30">
                  <div className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5 text-blue-100" />
                    <div>
                      <p className="text-xs text-blue-100">High / Low</p>
                      <p className="font-semibold">
                        {weatherData.current.temp_max}° / {weatherData.current.temp_min}°
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="h-5 w-5 text-blue-100" />
                    <div>
                      <p className="text-xs text-blue-100">Humidity</p>
                      <p className="font-semibold">{weatherData.current.humidity}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wind className="h-5 w-5 text-blue-100" />
                    <div>
                      <p className="text-xs text-blue-100">Wind</p>
                      <p className="font-semibold">{Math.round(weatherData.current.wind_speed * 3.6)} km/h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5-Day Forecast and Farming Advice */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* 5-Day Forecast */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    5-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weatherData.forecast.map((day, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-20">
                          <p className="font-medium">{day.day}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(day.icon)}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Precipitation</p>
                          <p className="font-medium">{day.precipitation}%</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {day.temp_max}° <span className="text-muted-foreground">{day.temp_min}°</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Farming Advice */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                    🌾 Farming Advice
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {weatherData.farmingAdvice.map((advice, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <p className="text-sm flex-1">{advice}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Additional Weather Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Visibility</p>
                      <p className="font-semibold">{(weatherData.current.visibility / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Gauge className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pressure</p>
                      <p className="font-semibold">{weatherData.current.pressure} hPa</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Cloud className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cloudiness</p>
                      <p className="font-semibold">{weatherData.current.clouds}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                    <Wind className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Wind Direction</p>
                      <p className="font-semibold">{weatherData.current.wind_deg}°</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200 text-center">
                ⚠️ Weather data provided for agricultural planning purposes. Forecasts are updated multiple times daily.
              </p>
            </div>
          </>
        )}
          </TabsContent>

          <TabsContent value="irrigation" className="mt-4">
            {selectedField ? (
              <JalSaathiView
                fieldId={selectedField.id}
                cropType={selectedField.cropType}
                sowingDate={selectedField.sowingDate ? new Date(selectedField.sowingDate) : undefined}
                location={
                  selectedField.location 
                    ? { lat: selectedField.location.lat, lon: selectedField.location.lng }
                    : currentLocation || weatherData?.location || "New Delhi"
                }
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Please select a field to view irrigation schedule</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
