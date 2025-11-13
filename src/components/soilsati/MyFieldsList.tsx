import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sprout, Plus, TrendingUp, Droplets } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabaseFieldService } from "@/lib/supabaseFieldService";
import { FieldStatusBadge } from "./FieldStatusBadge";

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

  // Load fields from Supabase
  useEffect(() => {
    // 🔥 LOG PAGE VIEW
    import('@/lib/blackBoxService').then(({ blackBoxService }) => {
      blackBoxService.logUserInteraction('page_view', 'fields_list', undefined, {
        timestamp: new Date().toISOString()
      });
    });
    
    const loadFields = async () => {
      try {
        // Load fields from Supabase
        const fieldsList = await supabaseFieldService.getFields();
        
        // Update each field with latest health data from field_data
        const updatedFields = await Promise.all(
          fieldsList.map(async (field: any) => {
            try {
              const latestData = await supabaseFieldService.getLatestFieldData(field.id);
              if (latestData) {
                // Calculate health status from health_score
                let healthStatus: "healthy" | "monitor" | "stress" | "unknown" = "unknown";
                const healthScore = latestData.health_score || 0;
                if (healthScore > 0.7) healthStatus = "healthy";
                else if (healthScore > 0.5) healthStatus = "monitor";
                else if (healthScore > 0.3) healthStatus = "stress";
                
                return {
                  ...field,
                  cropType: field.crop_type || 'Unknown',
                  sowingDate: field.created_at || new Date().toISOString(),
                  health: {
                    ndvi: latestData.ndvi || 0,
                    status: healthStatus
                  }
                };
              }
            } catch (error) {
              // Silently handle errors, show cached/default data
              console.warn(`Using cached data for field ${field.id}`);
            }
            return {
              ...field,
              cropType: field.crop_type || 'Unknown',
              sowingDate: field.created_at || new Date().toISOString(),
              health: {
                ndvi: 0,
                status: "unknown" as const
              }
            };
          })
        );
        
        console.log('Loaded fields from Supabase:', updatedFields);
        setFields(updatedFields);
        
        // 🔥 LOG FIELDS LOADED (silently, don't break on error)
        try {
          import('@/lib/blackBoxService').then(({ blackBoxService }) => {
            try {
              blackBoxService.logUserInteraction('page_view', 'fields_list_loaded', undefined, {
                fieldCount: updatedFields.length,
                timestamp: new Date().toISOString()
              });
            } catch (e) {
              // Silently ignore blackbox errors
            }
          }).catch(() => {}); // Silently ignore import errors
        } catch (error) {
          // Silently ignore any logging errors
        }
      } catch (error) {
        console.warn('Failed to load fields, showing cached data:', error);
        // Don't clear fields, keep showing whatever was there
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
                // 🔥 LOG FIELD CLICK (silently, don't break navigation)
                try {
                  import('@/lib/blackBoxService').then(({ blackBoxService }) => {
                    try {
                      blackBoxService.logUserInteraction('button_click', 'field_card_click', field.id, {
                        fieldName: field.name,
                        cropType: field.cropType,
                        healthStatus: field.health?.status,
                        timestamp: new Date().toISOString()
                      });
                    } catch (e) {
                      // Silently ignore errors
                    }
                  }).catch(() => {}); // Silently ignore import errors
                } catch (error) {
                  // Silently ignore any logging errors
                }
                navigate(`/soilsati/field/${field.id}`);
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{field.name}</h3>
                  <p className="text-sm text-muted-foreground">🌾 {field.cropType}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <FieldStatusBadge status={(field as any).status || 'active'} size="sm" />
                  <Badge className={getHealthColor(field.health?.status || "unknown")}>
                    {getHealthLabel(field.health?.status || "unknown")}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/30 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Area</p>
                  <p className="text-sm font-semibold">
                    {isNaN(field.area) || field.area === null ? '0.00' : Number(field.area).toFixed(2)} ha
                  </p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-success" />
                    <p className="text-xs text-muted-foreground">NDVI</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {isNaN(field.health?.ndvi) ? '0.00' : (field.health?.ndvi || 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Droplets className="w-3 h-3 text-info" />
                    <p className="text-xs text-muted-foreground">Days</p>
                  </div>
                  <p className="text-sm font-semibold">
                    {(() => {
                      try {
                        if (!field.sowingDate) return '0';
                        const sowingTime = new Date(field.sowingDate).getTime();
                        if (isNaN(sowingTime)) return '0';
                        const days = Math.floor((Date.now() - sowingTime) / (1000 * 60 * 60 * 24));
                        return isNaN(days) || days < 0 ? '0' : days;
                      } catch (error) {
                        return '0';
                      }
                    })()}
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
