import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Droplets, Thermometer, Bug, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CriticalAlertsProps {
  weatherData: any;
  irrigationData: any;
  diseaseOutbreaks: any[];
}

export const CriticalAlerts = ({ weatherData, irrigationData, diseaseOutbreaks }: CriticalAlertsProps) => {
  const { t } = useTranslation();
  const alerts: any[] = [];

  // Weather-based critical alerts
  if (weatherData) {
    const { current, forecast } = weatherData;

    // Extreme heat
    if (current.temp > 40) {
      alerts.push({
        type: "critical",
        icon: Thermometer,
        title: t("extreme_heat") || "🔥 EXTREME HEAT ALERT",
        message: `Temperature ${current.temp}°C! Irrigate NOW at 5 AM. Cover young plants.`,
        color: "border-red-500 bg-red-50"
      });
    }

    // Heavy rain
    const heavyRain = forecast.find((d: any) => d.precipitation > 70);
    if (heavyRain) {
      alerts.push({
        type: "warning",
        icon: Droplets,
        title: t("heavy_rain") || "🌧️ HEAVY RAIN ALERT",
        message: `${heavyRain.precipitation}% rain chance ${heavyRain.day}. Clear drainage NOW! Skip irrigation.`,
        color: "border-blue-500 bg-blue-50"
      });
    }

    // Cold alert
    if (current.temp < 10) {
      alerts.push({
        type: "critical",
        icon: AlertTriangle,
        title: t("frost_risk") || "❄️ FROST RISK",
        message: `Temperature ${current.temp}°C! Cover crops before sunset. Light smoke at 5 AM.`,
        color: "border-purple-500 bg-purple-50"
      });
    }

    // High humidity + disease risk
    if (current.humidity > 85) {
      alerts.push({
        type: "warning",
        icon: Bug,
        title: t("disease_risk") || "🦠 HIGH DISEASE RISK",
        message: `Humidity ${current.humidity}%! Spray Mancozeb (2g/L) preventively. Remove infected leaves.`,
        color: "border-orange-500 bg-orange-50"
      });
    }
  }

  // Irrigation alerts
  if (irrigationData?.alerts && irrigationData.alerts.length > 0) {
    const criticalIrrigationAlert = irrigationData.alerts[0];
    if (criticalIrrigationAlert.includes("ALERT") || criticalIrrigationAlert.includes("URGENT")) {
      alerts.push({
        type: "info",
        icon: Droplets,
        title: t("irrigation_alert") || "💧 IRRIGATION ALERT",
        message: criticalIrrigationAlert.replace(/[🌧️🔥❄️💧☀️🌦️]/g, "").trim(),
        color: "border-cyan-500 bg-cyan-50"
      });
    }
  }

  // Disease outbreak alerts
  if (diseaseOutbreaks.length > 0) {
    const recentOutbreaks = diseaseOutbreaks.flatMap(f => f.outbreaks).slice(0, 2);
    recentOutbreaks.forEach(outbreak => {
      alerts.push({
        type: "critical",
        icon: Bug,
        title: t("disease_detected") || "🐛 DISEASE DETECTED",
        message: `${outbreak.disease_name} in ${outbreak.fieldName}. ${outbreak.confidence}% confidence. Check treatments!`,
        color: "border-red-500 bg-red-50"
      });
    });
  }

  // Water savings alert
  if (irrigationData?.weeklyWaterSavings > 20) {
    alerts.push({
      type: "success",
      icon: TrendingUp,
      title: t("water_savings") || "💰 SAVINGS ALERT",
      message: `Save ${irrigationData.weeklyWaterSavings}% water this week! That's ₹${irrigationData.costSavings} saved on diesel!`,
      color: "border-green-500 bg-green-50"
    });
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {alerts.slice(0, 3).map((alert, index) => {
        const Icon = alert.icon;
        return (
          <Alert key={index} className={`${alert.color} border-l-4`}>
            <Icon className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold text-sm mb-1">{alert.title}</p>
              <p className="text-xs">{alert.message}</p>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};
