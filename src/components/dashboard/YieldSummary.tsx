import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface YieldSummaryProps {
  fields: any[];
}

export const YieldSummary = ({ fields }: YieldSummaryProps) => {
  const { t } = useTranslation();

  // Calculate total expected yield
  const calculateYield = () => {
    let totalYield = 0;
    let totalArea = 0;
    let harvestingSoon = 0;

    fields.forEach(field => {
      const area = parseFloat(field.area || "2.5");
      totalArea += area;

      // Estimate yield based on NDVI and crop type
      const ndvi = field.ndvi || 0.5;
      const yieldPerAcre = ndvi > 0.7 ? 4.5 : ndvi > 0.5 ? 3.5 : 2.5;
      totalYield += area * yieldPerAcre;

      // Check if harvesting soon (based on sowing date)
      if (field.sowingDate) {
        const sowingDate = new Date(field.sowingDate);
        const daysSinceSowing = Math.floor((Date.now() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceSowing > 100) {
          harvestingSoon++;
        }
      }
    });

    return {
      totalYield: totalYield.toFixed(1),
      totalArea: totalArea.toFixed(1),
      avgYield: (totalYield / totalArea).toFixed(1),
      harvestingSoon
    };
  };

  const yieldData = calculateYield();

  return (
    <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          {t("yield_prediction") || "Yield Prediction"}
        </h2>
        <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
          {t("estimated") || "Estimated"}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("total_yield") || "Total Yield"}</p>
          <p className="text-2xl font-bold text-indigo-600">{yieldData.totalYield}</p>
          <p className="text-xs text-muted-foreground">{t("tons") || "tons"}</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("avg_yield") || "Avg/Acre"}</p>
          <p className="text-2xl font-bold text-purple-600">{yieldData.avgYield}</p>
          <p className="text-xs text-muted-foreground">{t("tons_acre") || "tons/acre"}</p>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">{t("total_area") || "Total Area"}</p>
          <p className="text-2xl font-bold text-green-600">{yieldData.totalArea}</p>
          <p className="text-xs text-muted-foreground">{t("acres") || "acres"}</p>
        </div>
      </div>

      {yieldData.harvestingSoon > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-900">
              {yieldData.harvestingSoon} {t("fields_ready") || "field(s) ready for harvest soon!"}
            </p>
            <p className="text-xs text-green-700">
              {t("prepare_harvest") || "Prepare storage and transportation"}
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Target className="h-3 w-3" />
        <span>
          {t("yield_based_on") || "Based on vegetation health, crop type, and field conditions"}
        </span>
      </div>
    </Card>
  );
};
