import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Sprout,
  Camera,
  ShoppingBag,
  FileText,
  CloudSun,
  Droplets,
  TrendingUp,
  MapPin
} from "lucide-react";

export const QuickActions = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const modules = [
    {
      icon: Sprout,
      title: t("soil_saathi") || "Soil Saathi",
      description: t("soil_analysis") || "Soil & Field Analysis",
      color: "bg-green-500",
      path: "/soilsati",
      gradient: "from-green-400 to-green-600"
    },
    {
      icon: Camera,
      title: t("plant_saathi") || "Plant Saathi",
      description: t("disease_detection") || "Disease Detection",
      color: "bg-red-500",
      path: "/disease",
      gradient: "from-red-400 to-red-600"
    },
    {
      icon: Droplets,
      title: t("jal_saathi") || "Jal Saathi",
      description: t("irrigation_scheduler") || "Smart Irrigation",
      color: "bg-blue-500",
      path: "/weather",
      gradient: "from-blue-400 to-blue-600"
    },
    {
      icon: CloudSun,
      title: t("weather") || "Weather",
      description: t("forecast_advice") || "Forecast & Advice",
      color: "bg-cyan-500",
      path: "/weather",
      gradient: "from-cyan-400 to-cyan-600"
    },
    {
      icon: ShoppingBag,
      title: t("marketplace") || "Marketplace",
      description: t("buy_products") || "Buy Farm Products",
      color: "bg-purple-500",
      path: "/marketplace",
      gradient: "from-purple-400 to-purple-600"
    },
    {
      icon: FileText,
      title: t("schemes") || "Schemes",
      description: t("govt_schemes") || "Government Schemes",
      color: "bg-orange-500",
      path: "/schemes",
      gradient: "from-orange-400 to-orange-600"
    },
    {
      icon: TrendingUp,
      title: t("yield_prediction") || "Yield Prediction",
      description: t("predict_harvest") || "Predict Harvest",
      color: "bg-indigo-500",
      path: "/soilsati",
      gradient: "from-indigo-400 to-indigo-600"
    },
    {
      icon: MapPin,
      title: t("add_field") || "Add Field",
      description: t("map_new_field") || "Map New Field",
      color: "bg-teal-500",
      path: "/soilsati/map-field",
      gradient: "from-teal-400 to-teal-600"
    }
  ];

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("all_modules") || "All Modules"}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modules.map((module, index) => {
          const Icon = module.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(module.path)}
              className="group relative overflow-hidden rounded-xl p-4 text-left transition-all hover:scale-105 hover:shadow-lg"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
              
              {/* Content */}
              <div className="relative z-10">
                <Icon className="h-8 w-8 text-white mb-2" />
                <h3 className="font-semibold text-white text-sm mb-1">
                  {module.title}
                </h3>
                <p className="text-xs text-white/90">
                  {module.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
          );
        })}
      </div>
    </Card>
  );
};
