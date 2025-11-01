import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Volume2, 
  VolumeX, 
  Leaf, 
  Beaker, 
  Shield, 
  Sprout,
  AlertTriangle,
  Clock,
  Droplets,
  Sun
} from "lucide-react";


interface TreatmentRecommendationsProps {
  treatments: {
    organic: string[];
    chemical: string[];
    ipm: string[];
    cultural: string[];
  };
  playingAudio: string | null;
  onAudioPlay: (text: string, id: string) => void;
}

export const TreatmentRecommendations: React.FC<TreatmentRecommendationsProps> = ({
  treatments,
  playingAudio,
  onAudioPlay
}) => {
  const [activeTab, setActiveTab] = useState("organic");

  const treatmentCategories = [
    {
      id: "organic",
      label: "🌿 Organic",
      icon: <Leaf className="h-4 w-4" />,
      description: "Natural, eco-friendly treatments",
      urgency: "Medium",
      safetyLevel: "High",
      treatments: treatments.organic
    },
    {
      id: "chemical",
      label: "🧪 Chemical",
      icon: <Beaker className="h-4 w-4" />,
      description: "Fast-acting synthetic treatments",
      urgency: "High",
      safetyLevel: "Medium",
      treatments: treatments.chemical
    },
    {
      id: "ipm",
      label: "🛡️ IPM",
      icon: <Shield className="h-4 w-4" />,
      description: "Integrated Pest Management approach",
      urgency: "Medium",
      safetyLevel: "High",
      treatments: treatments.ipm
    },
    {
      id: "cultural",
      label: "🌱 Cultural",
      icon: <Sprout className="h-4 w-4" />,
      description: "Preventive farming practices",
      urgency: "Low",
      safetyLevel: "High",
      treatments: treatments.cultural
    }
  ];

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "default";
      default: return "outline";
    }
  };

  const getSafetyBadgeVariant = (safety: string) => {
    switch (safety.toLowerCase()) {
      case "high": return "default";
      case "medium": return "secondary";
      case "low": return "destructive";
      default: return "outline";
    }
  };

  const getApplicationMethod = (treatment: string) => {
    const lowerTreatment = treatment.toLowerCase();
    if (lowerTreatment.includes('spray') || lowerTreatment.includes('foliar')) {
      return { method: "Foliar Spray", icon: <Droplets className="h-3 w-3" /> };
    }
    if (lowerTreatment.includes('soil') || lowerTreatment.includes('drench')) {
      return { method: "Soil Application", icon: <Sprout className="h-3 w-3" /> };
    }
    if (lowerTreatment.includes('morning') || lowerTreatment.includes('evening')) {
      return { method: "Time-specific", icon: <Clock className="h-3 w-3" /> };
    }
    return { method: "General", icon: <Sun className="h-3 w-3" /> };
  };

  const renderTreatmentList = (categoryTreatments: string[], categoryId: string) => {
    if (!categoryTreatments || categoryTreatments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No specific treatments available for this category.</p>
          <p className="text-sm mt-1">Consider consulting with an agricultural expert.</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {categoryTreatments.map((treatment, index) => {
          const applicationMethod = getApplicationMethod(treatment);
          const treatmentId = `${categoryId}-treatment-${index}`;
          
          return (
            <div key={index} className="p-4 border rounded-lg bg-card/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{treatment}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAudioPlay(treatment, treatmentId)}
                      className="p-1 h-6 w-6"
                    >
                      {playingAudio === treatmentId ? (
                        <VolumeX className="h-3 w-3" />
                      ) : (
                        <Volume2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {applicationMethod.icon}
                      <span className="ml-1">{applicationMethod.method}</span>
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Safety warnings for chemical treatments */}
              {categoryId === 'chemical' && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="flex items-center gap-1 text-yellow-800">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">Safety Reminder:</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    Always wear protective equipment and follow label instructions. 
                    Observe pre-harvest intervals and application rates.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💊 Treatment Recommendations
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAudioPlay(
              `Treatment recommendations are available in four categories: Organic treatments for natural solutions, Chemical treatments for fast action, IPM for integrated pest management, and Cultural practices for prevention.`,
              "treatment-overview"
            )}
            className="p-1 h-6 w-6"
          >
            {playingAudio === "treatment-overview" ? (
              <VolumeX className="h-3 w-3" />
            ) : (
              <Volume2 className="h-3 w-3" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {treatmentCategories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="text-xs"
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {treatmentCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-4">
              {/* Category Header */}
              <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {category.icon}
                    <h3 className="font-medium">{category.label}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getUrgencyBadgeVariant(category.urgency)}>
                      {category.urgency} Urgency
                    </Badge>
                    <Badge variant={getSafetyBadgeVariant(category.safetyLevel)}>
                      {category.safetyLevel} Safety
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
              
              {/* Treatment List */}
              {renderTreatmentList(category.treatments, category.id)}
              
              {/* Category-specific notes */}
              {category.id === 'organic' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
                  <p className="text-green-800">
                    <strong>💡 Tip:</strong> Organic treatments may take longer to show results but are safer for beneficial insects and soil health.
                  </p>
                </div>
              )}
              
              {category.id === 'ipm' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="text-blue-800">
                    <strong>🎯 IPM Approach:</strong> Combines multiple strategies for sustainable, long-term disease management with minimal environmental impact.
                  </p>
                </div>
              )}
              
              {category.id === 'cultural' && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm">
                  <p className="text-purple-800">
                    <strong>🌱 Prevention:</strong> Cultural practices help prevent future outbreaks and improve overall plant health and resilience.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};