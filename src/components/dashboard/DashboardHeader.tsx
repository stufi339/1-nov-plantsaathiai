import { useTranslation } from "react-i18next";
import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";

interface DashboardHeaderProps {
  weatherData?: any;
  irrigationData?: any;
  diseaseOutbreaks?: any[];
}

export const DashboardHeader = ({ weatherData, irrigationData, diseaseOutbreaks }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentHour = new Date().getHours();
  
  const getGreeting = () => {
    if (currentHour < 12) return t("good_morning") || "Good Morning";
    if (currentHour < 17) return t("good_afternoon") || "Good Afternoon";
    return t("good_evening") || "Good Evening";
  };

  const getFarmerName = () => {
    // Get from localStorage or default
    const profile = JSON.parse(localStorage.getItem("user_profile") || "{}");
    return profile.name || t("farmer") || "Farmer";
  };

  // Calculate notification count
  const notificationCount = useMemo(() => {
    let count = 0;

    if (weatherData) {
      const { current, forecast } = weatherData;
      
      // Critical weather alerts
      if (current.temp > 40) count++;
      if (current.temp < 10) count++;
      if (current.humidity > 85) count++;
      
      // Rain alerts
      const heavyRain = forecast?.find((d: any) => d.precipitation > 70);
      if (heavyRain) count++;
    }

    // Irrigation alerts
    if (irrigationData?.alerts && irrigationData.alerts.length > 0) {
      const criticalAlerts = irrigationData.alerts.filter((alert: string) => 
        alert.includes("ALERT") || alert.includes("URGENT")
      );
      count += criticalAlerts.length;
    }

    // Disease outbreaks
    if (diseaseOutbreaks && diseaseOutbreaks.length > 0) {
      const recentOutbreaks = diseaseOutbreaks.flatMap(f => f.outbreaks).filter((outbreak: any) => {
        const detectedDate = new Date(outbreak.detected_at);
        const daysAgo = Math.floor((Date.now() - detectedDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7; // Last 7 days
      });
      count += recentOutbreaks.length;
    }

    return count;
  }, [weatherData, irrigationData, diseaseOutbreaks]);

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {getFarmerName()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount > 9 ? "9+" : notificationCount}
            </Badge>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/profile")}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
