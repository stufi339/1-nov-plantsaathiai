import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { MapPin, Sprout, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FieldsOverviewProps {
  fields: any[];
}

export const FieldsOverview = ({ fields }: FieldsOverviewProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (fields.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Sprout className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">
          {t("no_fields") || "No Fields Added"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t("add_first_field") || "Add your first field to start monitoring"}
        </p>
        <Button onClick={() => navigate("/soilsati/map-field")}>
          {t("add_field") || "Add Field"}
        </Button>
      </Card>
    );
  }

  const getFieldHealth = (field: any) => {
    // Get NDVI from health object or direct property
    const ndvi = field.health?.ndvi || field.ndvi || 0.5;
    
    // Map health status to display
    if (field.health?.status) {
      const statusMap: any = {
        "healthy": { status: "Excellent", color: "bg-green-500", textColor: "text-green-700" },
        "monitor": { status: "Good", color: "bg-blue-500", textColor: "text-blue-700" },
        "stress": { status: "Poor", color: "bg-red-500", textColor: "text-red-700" },
        "unknown": { status: "Pending", color: "bg-gray-500", textColor: "text-gray-700" }
      };
      return statusMap[field.health.status] || statusMap["unknown"];
    }
    
    // Fallback to NDVI-based calculation
    if (ndvi > 0.7) return { status: "Excellent", color: "bg-green-500", textColor: "text-green-700" };
    if (ndvi > 0.5) return { status: "Good", color: "bg-blue-500", textColor: "text-blue-700" };
    if (ndvi > 0.3) return { status: "Fair", color: "bg-yellow-500", textColor: "text-yellow-700" };
    return { status: "Poor", color: "bg-red-500", textColor: "text-red-700" };
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {t("my_fields") || "My Fields"} ({fields.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/soilsati")}
        >
          {t("view_all") || "View All"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.slice(0, 4).map((field) => {
          const health = getFieldHealth(field);
          const hasDisease = field.disease_outbreaks && field.disease_outbreaks.length > 0;
          
          return (
            <Card
              key={field.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/soilsati/field/${field.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {field.name || `Field ${field.id}`}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{field.location || "Unknown"}</span>
                  </div>
                </div>
                <Badge variant="secondary" className={`${health.color} text-white`}>
                  {health.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-muted-foreground">{t("crop") || "Crop"}</p>
                  <p className="text-sm font-semibold capitalize">
                    {field.cropType || "Rice"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded p-2">
                  <p className="text-xs text-muted-foreground">{t("area") || "Area"}</p>
                  <p className="text-sm font-semibold">
                    {(field.area || 2.5).toFixed(2)} ha
                  </p>
                </div>
              </div>

              {/* NDVI Indicator */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{t("vegetation_health") || "Vegetation"}</span>
                  <span className={`font-semibold ${health.textColor}`}>
                    {((field.health?.ndvi || field.ndvi || 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${health.color} transition-all`}
                    style={{ width: `${(field.health?.ndvi || field.ndvi || 0.5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Alerts */}
              {hasDisease && (
                <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 rounded p-2">
                  <AlertTriangle className="h-3 w-3" />
                  <span className="font-medium">
                    {field.disease_outbreaks.length} {t("disease_detected") || "disease(s) detected"}
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
