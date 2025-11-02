import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprout, Plus, TrendingUp, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Field {
  id: string;
  name: string;
  cropType: string;
  area: number;
  sowingDate: string;
  health: {
    ndvi: number;
    status: "healthy" | "monitor" | "stress" | "unknown";
  };
}

export const MyFieldsList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);

  // Load fields from localStorage
  useEffect(() => {
    // 🔥 LOG PAGE VIEW
    import('@/lib/blackBoxService').then(({ blackBoxService }) => {
      blackBoxService.logUserInteraction('page_view', 'fields_list', undefined, {
        timestamp: new Date().toISOString()
      });
    });
    
    const loadFields = () => {
      try {
        // Load fields list
        const fieldsList = JSON.parse(localStorage.getItem('fields_list') || '[]');
        
        // Update each field with latest health data from field_data
        const updatedFields = fieldsList.map((field: Field) => {
          try {
            const fieldData = localStorage.getItem(`field_${field.id}_data`);
            if (fieldData) {
              const parsedData = JSON.parse(fieldData);
              return {
                ...field,
                health: parsedData.health || field.health
              };
            }
          } catch (error) {
            console.error(`Failed to load data for field ${field.id}:`, error);
          }
          return field;
        });
        
        console.log('Loaded fields from localStorage:', updatedFields);
        setFields(updatedFields);
        
        // 🔥 LOG FIELDS LOADED
        import('@/lib/blackBoxService').then(({ blackBoxService }) => {
          blackBoxService.logUserInteraction('page_view', 'fields_list_loaded', undefined, {
            fieldCount: updatedFields.length,
            timestamp: new Date().toISOString()
          });
        });
      } catch (error) {
        console.error('Failed to load fields:', error);
        setFields([]);
      }
    };

    loadFields();
    
    // Reload fields when navigating back to this page
    const handleFocus = () => loadFields();
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFields();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-success text-success-foreground";
      case "monitor": return "bg-warning text-warning-foreground";
      case "stress": return "bg-destructive text-destructive-foreground";
      case "unknown": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getHealthLabel = (status: string) => {
    switch (status) {
      case "healthy": return `🟢 ${t('healthy')}`;
      case "monitor": return `🟡 ${t('monitor')}`;
      case "stress": return `🔴 ${t('stress')}`;
      case "unknown": return `⚪ ${t('pending')}`;
      default: return `⚪ ${t('pending')}`;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{t('my_fields')}</h2>
        <Button
          onClick={() => navigate("/soilsati/map-field")}
          className="bg-gradient-primary hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('add_field')}
        </Button>
      </div>

      {fields.length === 0 ? (
        <Card className="p-8 text-center bg-card/50">
          <Sprout className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">{t('no_fields_yet')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('start_mapping_first_field')}
          </p>
          <Button
            onClick={() => navigate("/soilsati/map-field")}
            className="bg-gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('map_first_field')}
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {fields.map((field) => (
            <Card 
              key={field.id}
              className="p-4 bg-card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                // 🔥 LOG FIELD CLICK
                import('@/lib/blackBoxService').then(({ blackBoxService }) => {
                  blackBoxService.logUserInteraction('button_click', 'field_card_click', field.id, {
                    fieldName: field.name,
                    cropType: field.cropType,
                    healthStatus: field.health?.status,
                    timestamp: new Date().toISOString()
                  });
                });
                navigate(`/soilsati/field/${field.id}`);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{field.name}</h3>
                  <p className="text-sm text-muted-foreground">🌾 {field.cropType}</p>
                </div>
                <Badge className={getHealthColor(field.health?.status || "unknown")}>
                  {getHealthLabel(field.health?.status || "unknown")}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Area</p>
                  <p className="text-sm font-semibold">{field.area.toFixed(2)} ha</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <p className="text-xs text-muted-foreground">NDVI</p>
                  </div>
                  <p className="text-sm font-semibold">{(field.health?.ndvi || 0).toFixed(2)}</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-info" />
                    <p className="text-xs text-muted-foreground">Days</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
                e.stopPropagation();
                navigate(`/soilsati/field/${field.id}`);
              }}>
                View Details →
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
