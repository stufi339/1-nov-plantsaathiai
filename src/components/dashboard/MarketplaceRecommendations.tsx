import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceRecommendationsProps {
  weatherData: any;
  fields: any[];
}

export const MarketplaceRecommendations = ({ weatherData, fields }: MarketplaceRecommendationsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Generate smart recommendations based on weather and field conditions
  const recommendations: any[] = [];

  if (weatherData) {
    const { current, forecast } = weatherData;

    // High humidity - fungicide recommendation
    if (current.humidity > 80) {
      recommendations.push({
        category: "Fungicides",
        product: "Mancozeb 75% WP",
        reason: "High humidity (${current.humidity}%) increases fungal disease risk",
        urgency: "high",
        icon: "🦠"
      });
    }

    // Hot weather - irrigation equipment
    if (current.temp > 35) {
      recommendations.push({
        category: "Irrigation",
        product: "Drip Irrigation Kit",
        reason: "Hot weather (${current.temp}°C) requires efficient watering",
        urgency: "medium",
        icon: "💧"
      });
    }

    // Rain coming - harvest equipment
    const heavyRain = forecast.find((d: any) => d.precipitation > 70);
    if (heavyRain) {
      recommendations.push({
        category: "Harvest Tools",
        product: "Tarpaulin & Storage Bags",
        reason: "Heavy rain expected. Protect harvested crops",
        urgency: "high",
        icon: "🌧️"
      });
    }

    // Pest risk - pesticides
    if (current.temp > 30 && current.humidity < 50) {
      recommendations.push({
        category: "Pesticides",
        product: "Neem Oil Spray",
        reason: "Hot & dry weather favors pests like aphids",
        urgency: "medium",
        icon: "🐛"
      });
    }
  }

  // Field-based recommendations
  if (fields.length > 0) {
    const hasLowNDVI = fields.some(f => (f.ndvi || 0.5) < 0.4);
    if (hasLowNDVI) {
      recommendations.push({
        category: "Fertilizers",
        product: "NPK 19:19:19",
        reason: "Low vegetation health detected in some fields",
        urgency: "high",
        icon: "🌱"
      });
    }

    const hasDiseases = fields.some(f => f.disease_outbreaks && f.disease_outbreaks.length > 0);
    if (hasDiseases) {
      recommendations.push({
        category: "Disease Control",
        product: "Copper Oxychloride",
        reason: "Disease detected in your fields",
        urgency: "high",
        icon: "💊"
      });
    }
  }

  // General recommendations
  recommendations.push({
    category: "Seeds",
    product: "High-Yield Varieties",
    reason: "Upcoming sowing season",
    urgency: "low",
    icon: "🌾"
  });

  const getUrgencyColor = (urgency: string) => {
    if (urgency === "high") return "border-l-red-500 bg-red-50";
    if (urgency === "medium") return "border-l-orange-500 bg-orange-50";
    return "border-l-blue-500 bg-blue-50";
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-purple-600" />
          {t("smart_recommendations") || "Smart Recommendations"}
        </h2>
        <Sparkles className="h-5 w-5 text-purple-600" />
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {t("based_on_conditions") || "Based on your field conditions and weather"}
      </p>

      <div className="space-y-2 mb-4">
        {recommendations.slice(0, 4).map((rec, index) => (
          <div
            key={index}
            className={`rounded-lg p-3 border-l-4 ${getUrgencyColor(rec.urgency)} cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => navigate("/marketplace")}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{rec.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {rec.product}
                  </h3>
                  <span className="text-xs text-muted-foreground uppercase">
                    {rec.urgency}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{rec.category}</p>
                <p className="text-xs text-gray-700">{rec.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        className="w-full bg-purple-600 hover:bg-purple-700"
        onClick={() => navigate("/marketplace")}
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        {t("browse_marketplace") || "Browse Marketplace"}
      </Button>

      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="h-3 w-3" />
        <span>{t("best_prices") || "Best prices • Fast delivery • Quality guaranteed"}</span>
      </div>
    </Card>
  );
};
