import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Volume2 } from "lucide-react";

interface Quadrant {
  id: string;
  name: string;
  ndvi: number;
  status: "healthy" | "monitor" | "stress";
}

interface FieldHealthMapProps {
  coordinates: number[][];
  quadrants: Quadrant[];
  playAudio: (text: string, id: string) => void;
  playingAudio: string | null;
}

export const FieldHealthMap = ({ quadrants, playAudio, playingAudio }: FieldHealthMapProps) => {
  const getQuadrantColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-success/80";
      case "monitor": return "bg-warning/80";
      case "stress": return "bg-destructive/80";
      default: return "bg-muted";
    }
  };

  const getQuadrantLabel = (status: string) => {
    switch (status) {
      case "healthy": return "🟢 Healthy";
      case "monitor": return "🟡 Monitor";
      case "stress": return "🔴 Stress";
      default: return "Unknown";
    }
  };

  const getHealthSummary = () => {
    const healthy = quadrants.filter(q => q.status === "healthy").length;
    const monitor = quadrants.filter(q => q.status === "monitor").length;
    const stress = quadrants.filter(q => q.status === "stress").length;
    
    let summary = `Field health summary: `;
    if (healthy > 0) summary += `${healthy} quadrant${healthy > 1 ? 's are' : ' is'} healthy. `;
    if (monitor > 0) summary += `${monitor} quadrant${monitor > 1 ? 's need' : ' needs'} monitoring. `;
    if (stress > 0) summary += `${stress} quadrant${stress > 1 ? 's are' : ' is'} under stress and needs immediate attention.`;
    return summary;
  };

  return (
    <Card className="p-4 bg-card shadow-soft">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Field Health Zones</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => playAudio(getHealthSummary(), 'field-health-map')}
        >
          <Volume2 className={`w-4 h-4 ${playingAudio === 'field-health-map' ? 'animate-pulse text-primary' : ''}`} />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Your field is divided into 4 zones for precise health monitoring
      </p>

      {/* Grid visualization of quadrants */}
      <div className="grid grid-cols-2 gap-2 mb-4" style={{ maxHeight: '200px' }}>
        {quadrants.map((quadrant) => (
          <div
            key={quadrant.id}
            className={`${getQuadrantColor(quadrant.status)} rounded-lg p-3 flex flex-col items-center justify-center text-white relative min-h-[90px]`}
          >
            <p className="text-xs font-medium mb-1">{quadrant.name}</p>
            <p className="text-xl font-bold">{quadrant.ndvi.toFixed(2)}</p>
            <Badge className="mt-1 bg-white/20 text-white text-[10px] px-1 py-0">
              {getQuadrantLabel(quadrant.status).split(' ')[1]}
            </Badge>
          </div>
        ))}
      </div>

      {/* Quadrant details */}
      <div className="space-y-1.5">
        {quadrants.map((quadrant) => (
          <div key={quadrant.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getQuadrantColor(quadrant.status)}`} />
              <span className="font-medium">{quadrant.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">NDVI: {quadrant.ndvi.toFixed(2)}</span>
              <Badge className={`${getQuadrantColor(quadrant.status).replace('/80', '')} text-[10px] px-1.5 py-0`} variant="outline">
                {getQuadrantLabel(quadrant.status).split(' ')[1]}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 p-2 bg-info/10 rounded">
        <p className="text-[10px] font-medium text-foreground mb-0.5">💡 What this means:</p>
        <p className="text-[10px] text-muted-foreground leading-tight">
          {quadrants.some(q => q.status === "stress") 
            ? "⚠️ Some zones need immediate attention. Focus on the red/yellow areas for irrigation or pest control."
            : quadrants.some(q => q.status === "monitor")
            ? "Your field is mostly healthy, but keep monitoring the yellow zones."
            : "🎉 Excellent! Your entire field is healthy. Keep up the good work!"}
        </p>
      </div>
    </Card>
  );
};
