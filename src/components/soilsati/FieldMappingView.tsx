import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WalkBoundaryMap } from "./mapping/WalkBoundaryMap";
import { GoogleMapsFieldMapping } from "./mapping/GoogleMapsFieldMapping";
import { FieldDetailsForm } from "./mapping/FieldDetailsForm";

export const FieldMappingView = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("walk");
  const [coordinates, setCoordinates] = useState<[number, number][] | null>(null);
  const [area, setArea] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleMappingComplete = (coords: [number, number][], calculatedArea: number) => {
    setCoordinates(coords);
    setArea(calculatedArea);
    setShowForm(true);
  };

  const handleSaveField = (fieldData: any) => {
    // Generate unique field ID (without "field_" prefix since we add it when storing)
    const fieldId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const completeFieldData = {
      id: fieldId,
      ...fieldData,
      coordinates,
      area,
      createdAt: new Date().toISOString(),
      health: {
        ndvi: 0,
        status: "unknown"
      }
    };
    
    console.log("Saving field:", completeFieldData);
    
    // Save to localStorage
    try {
      // Save field data with field_ prefix
      localStorage.setItem(`field_${fieldId}_data`, JSON.stringify(completeFieldData));
      
      // Update fields list
      const existingFields = JSON.parse(localStorage.getItem('fields_list') || '[]');
      existingFields.push({
        id: fieldId,
        name: fieldData.name,
        cropType: fieldData.cropType,
        area: area,
        sowingDate: fieldData.sowingDate,
        createdAt: completeFieldData.createdAt,
        health: {
          ndvi: 0,
          status: "unknown"
        }
      });
      localStorage.setItem('fields_list', JSON.stringify(existingFields));
      
      console.log('Field saved to localStorage successfully:', fieldId);
      console.log('Fields list:', existingFields);
      
      // 🔥 LOG TO BLACKBOX
      import('@/lib/blackBoxService').then(({ blackBoxService }) => {
        blackBoxService.logUserInteraction(
          'field_creation',
          'field_mapping_complete',
          fieldId,
          {
            fieldName: fieldData.name,
            cropType: fieldData.cropType,
            area: area,
            mappingMethod: activeTab,
            coordinatesCount: coordinates?.length || 0,
            timestamp: new Date().toISOString()
          }
        );
      });
      
    } catch (error) {
      console.error('Failed to save field:', error);
      
      // 🔥 LOG ERROR TO BLACKBOX
      import('@/lib/blackBoxService').then(({ blackBoxService }) => {
        blackBoxService.logError(
          'storage_error',
          error instanceof Error ? error.message : 'Unknown error',
          fieldId,
          'field_save_operation'
        );
      });
    }
    
    navigate("/soilsati");
  };

  if (showForm && coordinates && area) {
    return (
      <FieldDetailsForm
        coordinates={coordinates}
        area={area}
        onSave={handleSaveField}
        onBack={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-gradient-primary text-white">
        <Button
          onClick={() => navigate("/soilsati")}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold mb-1">🛰️ Map Your Field</h1>
        <p className="text-sm opacity-90">Powered by Google Earth Engine satellite imagery</p>
      </header>

      {/* Mapping Methods */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="walk">🚶 Walk Boundary</TabsTrigger>
            <TabsTrigger value="satellite">🛰️ Satellite Mapping</TabsTrigger>
          </TabsList>

          <TabsContent value="walk" className="mt-0">
            <Card className="p-4 bg-card shadow-soft mb-4">
              <h3 className="font-semibold text-foreground mb-2">Walk Boundary Method</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Walk around your field perimeter. Your GPS location will be tracked automatically.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Tap "Start Walking" and walk to your field boundary</li>
                <li>Walk around the entire perimeter</li>
                <li>Tap "Complete Boundary" when you return to start</li>
                <li>Area will be calculated automatically</li>
              </ul>
            </Card>
            <WalkBoundaryMap onComplete={handleMappingComplete} />
          </TabsContent>

          <TabsContent value="satellite" className="mt-0">
            <Card className="p-4 bg-card shadow-soft mb-4">
              <h3 className="font-semibold text-foreground mb-2">🛰️ Satellite Mapping with Google Earth Engine</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Use high-resolution satellite imagery to precisely map your field boundaries.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                <li>Choose between drawing boundary points or center+radius method</li>
                <li>Use real satellite imagery to see your actual field</li>
                <li>Switch between satellite and map views</li>
                <li>Precise area calculation using Google Earth Engine</li>
              </ul>
            </Card>
            <GoogleMapsFieldMapping onComplete={handleMappingComplete} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
