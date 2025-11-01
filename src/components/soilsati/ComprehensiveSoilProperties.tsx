/**
 * Comprehensive Soil Properties Display Component
 * Shows all soil properties, micronutrients, and environmental data
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Volume2, Droplets, Thermometer, Leaf, TestTube, Wind, Sun, Cloud } from "lucide-react";

interface ComprehensiveSoilPropertiesProps {
  analysis: any; // Full comprehensive analysis object
  playAudio: (text: string, id: string) => void;
  playingAudio: string | null;
}

export const ComprehensiveSoilProperties = ({ 
  analysis, 
  playAudio, 
  playingAudio 
}: ComprehensiveSoilPropertiesProps) => {
  
  if (!analysis) return null;

  const { soil_properties, micronutrients, environmental } = analysis;

  // Generate audio for soil properties
  const generateSoilPropertiesAudio = () => {
    const text = `Soil Properties Analysis: 
      Moisture content is ${soil_properties.moisture_content}% which is ${soil_properties.moisture_status}. 
      Soil temperature is ${soil_properties.temperature} degrees Celsius, ${soil_properties.temperature_status}. 
      Organic matter content is ${soil_properties.organic_matter}%, ${soil_properties.organic_matter_status}. 
      pH level is ${soil_properties.ph_level}, ${soil_properties.ph_status}. 
      Soil texture is ${soil_properties.texture} with ${soil_properties.drainage} drainage.`;
    
    playAudio(text, 'soil-properties');
  };

  // Generate audio for micronutrients
  const generateMicronutrientsAudio = () => {
    const text = `Micronutrient Analysis: 
      Iron is ${micronutrients.iron.value} ppm, ${micronutrients.iron.status}. 
      Zinc is ${micronutrients.zinc.value} ppm, ${micronutrients.zinc.status}. 
      Manganese is ${micronutrients.manganese.value} ppm, ${micronutrients.manganese.status}. 
      Copper is ${micronutrients.copper.value} ppm, ${micronutrients.copper.status}. 
      Boron is ${micronutrients.boron.value} ppm, ${micronutrients.boron.status}.`;
    
    playAudio(text, 'micronutrients');
  };

  // Generate audio for environmental conditions
  const generateEnvironmentalAudio = () => {
    const text = `Environmental Conditions: 
      Temperature is ${environmental.temperature} degrees Celsius. 
      Humidity is ${environmental.humidity}%. 
      Solar radiation is ${environmental.solar_radiation} megajoules per square meter per day. 
      Wind speed is ${environmental.wind_speed} meters per second. 
      Cloud cover is ${environmental.cloud_cover}%.`;
    
    playAudio(text, 'environmental');
  };

  return (
    <div className="space-y-4">
      {/* Soil Properties Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Soil Properties
              </CardTitle>
              <CardDescription>Complete physical and chemical soil analysis</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSoilPropertiesAudio}
              className="p-2"
            >
              <Volume2 className={`w-4 h-4 ${playingAudio === 'soil-properties' ? 'animate-pulse text-primary' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {/* Moisture Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Moisture Content</span>
                </div>
                <Badge variant="outline">{soil_properties.moisture_status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={soil_properties.moisture_content} className="flex-1" />
                <span className="text-sm font-semibold">{soil_properties.moisture_content}%</span>
              </div>
            </div>

            {/* Soil Temperature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Soil Temperature</span>
                </div>
                <Badge variant="outline">{soil_properties.temperature_status}</Badge>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {soil_properties.temperature}°C
              </div>
            </div>

            {/* Organic Matter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Organic Matter</span>
                </div>
                <Badge variant="outline">{soil_properties.organic_matter_status}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={soil_properties.organic_matter * 20} className="flex-1" />
                <span className="text-sm font-semibold">{soil_properties.organic_matter}%</span>
              </div>
            </div>

            {/* pH Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TestTube className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">pH Level</span>
                </div>
                <Badge variant="outline">{soil_properties.ph_status}</Badge>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {soil_properties.ph_level}
              </div>
            </div>

            {/* Soil Texture */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Soil Texture</span>
              <div className="text-lg font-semibold">{soil_properties.texture}</div>
            </div>

            {/* Drainage */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Drainage</span>
              <div className="text-lg font-semibold">{soil_properties.drainage}</div>
            </div>

            {/* Compaction */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Compaction</span>
              <div className="text-lg font-semibold">{soil_properties.compaction}</div>
            </div>

            {/* Salinity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Salinity</span>
                <Badge variant="outline">{soil_properties.salinity_status}</Badge>
              </div>
              <div className="text-lg font-semibold">{soil_properties.salinity} dS/m</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Micronutrients Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-600" />
                Micronutrients
              </CardTitle>
              <CardDescription>Essential trace elements for crop health</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateMicronutrientsAudio}
              className="p-2"
            >
              <Volume2 className={`w-4 h-4 ${playingAudio === 'micronutrients' ? 'animate-pulse text-primary' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {/* Iron */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Iron (Fe)</div>
              <div className="text-lg font-bold">{micronutrients.iron.value} ppm</div>
              <Badge variant="outline" className="mt-1 text-xs">{micronutrients.iron.status}</Badge>
            </div>

            {/* Zinc */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Zinc (Zn)</div>
              <div className="text-lg font-bold">{micronutrients.zinc.value} ppm</div>
              <Badge variant="outline" className="mt-1 text-xs">{micronutrients.zinc.status}</Badge>
            </div>

            {/* Manganese */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Manganese (Mn)</div>
              <div className="text-lg font-bold">{micronutrients.manganese.value} ppm</div>
              <Badge variant="outline" className="mt-1 text-xs">{micronutrients.manganese.status}</Badge>
            </div>

            {/* Copper */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Copper (Cu)</div>
              <div className="text-lg font-bold">{micronutrients.copper.value} ppm</div>
              <Badge variant="outline" className="mt-1 text-xs">{micronutrients.copper.status}</Badge>
            </div>

            {/* Boron */}
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Boron (B)</div>
              <div className="text-lg font-bold">{micronutrients.boron.value} ppm</div>
              <Badge variant="outline" className="mt-1 text-xs">{micronutrients.boron.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Conditions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-yellow-500" />
                Environmental Conditions
              </CardTitle>
              <CardDescription>Real-time weather and climate data</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={generateEnvironmentalAudio}
              className="p-2"
            >
              <Volume2 className={`w-4 h-4 ${playingAudio === 'environmental' ? 'animate-pulse text-primary' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Temperature */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Thermometer className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-xs text-muted-foreground">Temperature</div>
                <div className="text-xl font-bold">{environmental.temperature.toFixed(1)}°C</div>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Droplets className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Humidity</div>
                <div className="text-xl font-bold">{environmental.humidity.toFixed(0)}%</div>
              </div>
            </div>

            {/* Solar Radiation */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Sun className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-xs text-muted-foreground">Solar Radiation</div>
                <div className="text-xl font-bold">{environmental.solar_radiation.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">MJ/m²/day</div>
              </div>
            </div>

            {/* Wind Speed */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Wind className="w-8 h-8 text-gray-500" />
              <div>
                <div className="text-xs text-muted-foreground">Wind Speed</div>
                <div className="text-xl font-bold">{environmental.wind_speed.toFixed(1)} m/s</div>
              </div>
            </div>

            {/* Cloud Cover */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Cloud className="w-8 h-8 text-gray-400" />
              <div>
                <div className="text-xs text-muted-foreground">Cloud Cover</div>
                <div className="text-xl font-bold">{environmental.cloud_cover.toFixed(0)}%</div>
              </div>
            </div>

            {/* Precipitation */}
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Droplets className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-xs text-muted-foreground">Precipitation</div>
                <div className="text-xl font-bold">{environmental.precipitation.toFixed(1)} mm</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
