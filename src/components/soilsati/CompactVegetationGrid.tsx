/**
 * Compact Vegetation Grid - Mobile Optimized
 * Shows key indices in a compact format with field map screenshot
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, ChevronDown, ChevronUp, Satellite } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CompactVegetationGridProps {
  indices: any;
  fieldScreenshotUrl: string;
  playAudio: (text: string, id: string) => void;
  playingAudio: string | null;
}

export const CompactVegetationGrid = ({
  indices,
  fieldScreenshotUrl,
  playAudio,
  playingAudio
}: CompactVegetationGridProps) => {
  const [showAll, setShowAll] = useState(false);

  const getStatus = (value: number, optimal: [number, number]) => {
    if (value >= optimal[0] && value <= optimal[1]) 
      return { label: "Optimal", color: "bg-success text-success-foreground" };
    if (value < optimal[0] * 0.8) 
      return { label: "Low", color: "bg-destructive text-destructive-foreground" };
    if (value > optimal[1] * 1.2) 
      return { label: "High", color: "bg-warning text-warning-foreground" };
    return { label: "Monitor", color: "bg-warning text-warning-foreground" };
  };

  const keyIndices = [
    {
      id: "ndvi",
      name: "NDVI",
      fullName: "Vegetation Health",
      value: indices.ndvi,
      optimal: [0.3, 0.8] as [number, number],
      icon: "🌱",
      description: "Overall crop health"
    },
    {
      id: "ndwi",
      name: "NDWI",
      fullName: "Water Content",
      value: indices.ndwi,
      optimal: [0.2, 0.5] as [number, number],
      icon: "💧",
      description: "Plant water status"
    },
    {
      id: "ndre",
      name: "NDRE",
      fullName: "Nitrogen Status",
      value: indices.ndre,
      optimal: [0.2, 0.6] as [number, number],
      icon: "🧪",
      description: "Nitrogen levels"
    }
  ];

  const allIndices = [
    ...keyIndices,
    {
      id: "msavi2",
      name: "MSAVI2",
      fullName: "Soil-Adjusted Vegetation",
      value: indices.msavi2,
      optimal: [0.4, 0.7] as [number, number],
      icon: "🏞️",
      description: "Vegetation with soil correction"
    },
    {
      id: "ndmi",
      name: "NDMI",
      fullName: "Moisture Index",
      value: indices.ndmi,
      optimal: [0.2, 0.6] as [number, number],
      icon: "💦",
      description: "Overall moisture"
    },
    {
      id: "soc_vis",
      name: "SOC",
      fullName: "Soil Organic Carbon",
      value: indices.soc_vis,
      optimal: [0.3, 0.7] as [number, number],
      icon: "🪨",
      description: "Soil health"
    }
  ];

  const displayIndices = showAll ? allIndices : keyIndices;

  return (
    <div className="space-y-3">
      {/* Field Satellite Image */}
      <Card className="overflow-hidden">
        <div className="relative">
          <img 
            src={fieldScreenshotUrl} 
            alt="Field Satellite View" 
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Satellite className="w-3 h-3" />
            Live Satellite
          </div>
          <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
            📍 Your Field
          </div>
        </div>
      </Card>

      {/* Compact Indices */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Vegetation Analysis</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const text = `Vegetation analysis: NDVI is ${indices.ndvi.toFixed(2)}, water content is ${indices.ndwi.toFixed(2)}, nitrogen status is ${indices.ndre.toFixed(2)}`;
                playAudio(text, 'compact-indices');
              }}
              className="h-8 w-8 p-0"
            >
              <Volume2 className={`w-4 h-4 ${playingAudio === 'compact-indices' ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayIndices.map((index) => {
            const status = getStatus(index.value, index.optimal);
            const percentage = ((index.value - index.optimal[0]) / (index.optimal[1] - index.optimal[0])) * 100;
            
            return (
              <div key={index.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{index.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{index.fullName}</div>
                      <div className="text-xs text-muted-foreground">{index.description}</div>
                    </div>
                  </div>
                  <Badge className={status.color} variant="outline">
                    {index.value.toFixed(2)}
                  </Badge>
                </div>
                <Progress value={Math.max(0, Math.min(100, percentage))} className="h-2" />
              </div>
            );
          })}

          {/* Show More/Less Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                Show All Indices ({allIndices.length - keyIndices.length} more)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* NPK Summary if available */}
      {indices.nitrogen && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardContent className="pt-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Nitrogen</div>
                <div className="text-lg font-bold text-green-700">{indices.nitrogen.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Phosphorus</div>
                <div className="text-lg font-bold text-blue-700">{indices.phosphorus.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Potassium</div>
                <div className="text-lg font-bold text-purple-700">{indices.potassium.toFixed(1)}%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
