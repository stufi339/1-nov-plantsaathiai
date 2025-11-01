import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Bug, AlertTriangle, TrendingDown, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DiseaseMonitoringProps {
  outbreaks: any[];
}

export const DiseaseMonitoring = ({ outbreaks }: DiseaseMonitoringProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Flatten all outbreaks and sort by date
  const allOutbreaks = outbreaks
    .flatMap(field => 
      field.outbreaks.map((outbreak: any) => ({
        ...outbreak,
        fieldId: field.fieldId
      }))
    )
    .sort((a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime());

  const recentOutbreaks = allOutbreaks.slice(0, 3);
  const totalDiseases = allOutbreaks.length;
  const criticalDiseases = allOutbreaks.filter(o => o.confidence > 80).length;

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 80) return "text-red-600 bg-red-50";
    if (confidence > 60) return "text-orange-600 bg-orange-50";
    return "text-yellow-600 bg-yellow-50";
  };

  const getYieldImpactColor = (impact: string) => {
    if (impact.toLowerCase().includes("severe") || impact.toLowerCase().includes("high")) {
      return "text-red-600";
    }
    if (impact.toLowerCase().includes("moderate")) {
      return "text-orange-600";
    }
    return "text-yellow-600";
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bug className="h-5 w-5 text-red-600" />
          {t("disease_monitoring") || "Disease Monitoring"}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/disease")}
        >
          {t("view_all") || "View All"}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <p className="text-xs text-muted-foreground">{t("total_detections") || "Total"}</p>
          </div>
          <p className="text-2xl font-bold text-red-600">{totalDiseases}</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4 text-orange-600" />
            <p className="text-xs text-muted-foreground">{t("critical") || "Critical"}</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{criticalDiseases}</p>
        </div>
      </div>

      {/* Recent Outbreaks */}
      <div className="space-y-2">
        {recentOutbreaks.map((outbreak, index) => {
          const detectedDate = new Date(outbreak.detected_at);
          const daysAgo = Math.floor((Date.now() - detectedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-red-200 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/soilsati/field/${outbreak.fieldId}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1">
                    {outbreak.disease_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {outbreak.fieldName} • {daysAgo === 0 ? t("today") || "Today" : `${daysAgo} ${t("days_ago") || "days ago"}`}
                  </p>
                </div>
                <Badge className={getConfidenceColor(outbreak.confidence)}>
                  {outbreak.confidence}%
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">{t("yield_impact") || "Yield Impact"}</p>
                  <p className={`font-semibold ${getYieldImpactColor(outbreak.yield_impact)}`}>
                    {outbreak.yield_impact}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t("recovery") || "Recovery"}</p>
                  <p className="font-semibold text-green-600">
                    {outbreak.recovery_chance}
                  </p>
                </div>
              </div>

              {/* Quick Treatment Preview */}
              {outbreak.treatments?.chemical && outbreak.treatments.chemical.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("quick_treatment") || "Quick Treatment"}:
                  </p>
                  <p className="text-xs text-gray-700 line-clamp-1">
                    {outbreak.treatments.chemical[0]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <Button
        className="w-full mt-3 bg-red-600 hover:bg-red-700"
        onClick={() => navigate("/disease")}
      >
        <Eye className="h-4 w-4 mr-2" />
        {t("scan_for_diseases") || "Scan for Diseases"}
      </Button>
    </Card>
  );
};
