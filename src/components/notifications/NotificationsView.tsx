import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Droplets, Thermometer, Bug, TrendingUp, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { weatherService } from "@/lib/weatherService";
import { jalSaathiService } from "@/lib/jalSaathiService";
import { diseaseDetectionService } from "@/lib/diseaseDetectionService";

export const NotificationsView = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [irrigationData, setIrrigationData] = useState<any>(null);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Load weather data
      try {
        const location = await weatherService.getCurrentLocation();
        const weather = await weatherService.getWeatherByCoords(location.lat, location.lon);
        setWeatherData(weather);
      } catch (error) {
        const weather = await weatherService.getWeatherByCity("Delhi");
        setWeatherData(weather);
      }

      // Load fields data
      const fields = loadFieldsFromStorage();

      // Load irrigation schedule for first field
      if (fields.length > 0) {
        try {
          const firstField = fields[0];
          const cropStage = jalSaathiService.getCropStage(
            new Date(firstField.sowingDate || Date.now() - 60 * 24 * 60 * 60 * 1000),
            firstField.cropType || "rice"
          );
          const soilType = jalSaathiService.determineSoilType(firstField.soilData);
          
          const irrigation = await jalSaathiService.generateIrrigationSchedule(
            firstField.id,
            firstField.cropType || "rice",
            cropStage,
            soilType,
            firstField.location || "Delhi"
          );
          setIrrigationData(irrigation);
        } catch (error) {
          console.error("Failed to load irrigation data:", error);
        }
      }

      // Load disease outbreaks
      const outbreaks = diseaseDetectionService.getAllFieldsWithDiseases();
      setDiseaseOutbreaks(outbreaks);

    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFieldsFromStorage = () => {
    try {
      // Load fields list from localStorage
      const fieldsList = JSON.parse(localStorage.getItem('fields_list') || '[]');
      
      // Enrich each field with data from field_*_data
      const enrichedFields = fieldsList.map((field: any) => {
        try {
          const fieldDataKey = `field_${field.id}_data`;
          const fieldData = localStorage.getItem(fieldDataKey);
          if (fieldData) {
            const parsedData = JSON.parse(fieldData);
            return {
              ...field,
              ...parsedData,
              name: field.name,
              cropType: field.cropType,
              area: field.area,
              sowingDate: field.sowingDate
            };
          }
        } catch (error) {
          console.error(`Failed to load data for field ${field.id}:`, error);
        }
        return field;
      });
      
      return enrichedFields;
    } catch (error) {
      return [];
    }
  };

  const generateAllAlerts = () => {
    const alerts: any[] = [];

    // Weather-based alerts
    if (weatherData) {
      const { current, forecast } = weatherData;

      if (current.temp > 40) {
        alerts.push({
          type: "critical",
          category: "weather",
          icon: Thermometer,
          title: "🔥 EXTREME HEAT ALERT",
          message: `Temperature ${current.temp}°C! Irrigate NOW at 5 AM. Cover young plants.`,
          color: "border-red-500 bg-red-50",
          timestamp: new Date().toISOString()
        });
      }

      const heavyRain = forecast?.find((d: any) => d.precipitation > 70);
      if (heavyRain) {
        alerts.push({
          type: "warning",
          category: "weather",
          icon: Droplets,
          title: "🌧️ HEAVY RAIN ALERT",
          message: `${heavyRain.precipitation}% rain chance ${heavyRain.day}. Clear drainage NOW! Skip irrigation.`,
          color: "border-blue-500 bg-blue-50",
          timestamp: new Date().toISOString()
        });
      }

      if (current.temp < 10) {
        alerts.push({
          type: "critical",
          category: "weather",
          icon: AlertTriangle,
          title: "❄️ FROST RISK",
          message: `Temperature ${current.temp}°C! Cover crops before sunset. Light smoke at 5 AM.`,
          color: "border-purple-500 bg-purple-50",
          timestamp: new Date().toISOString()
        });
      }

      if (current.humidity > 85) {
        alerts.push({
          type: "warning",
          category: "disease",
          icon: Bug,
          title: "🦠 HIGH DISEASE RISK",
          message: `Humidity ${current.humidity}%! Spray Mancozeb (2g/L) preventively. Remove infected leaves.`,
          color: "border-orange-500 bg-orange-50",
          timestamp: new Date().toISOString()
        });
      }
    }

    // Irrigation alerts
    if (irrigationData?.alerts && irrigationData.alerts.length > 0) {
      irrigationData.alerts.forEach((alert: string) => {
        if (alert.includes("ALERT") || alert.includes("URGENT")) {
          alerts.push({
            type: "info",
            category: "irrigation",
            icon: Droplets,
            title: "💧 IRRIGATION ALERT",
            message: alert.replace(/[🌧️🔥❄️💧☀️🌦️]/g, "").trim(),
            color: "border-cyan-500 bg-cyan-50",
            timestamp: new Date().toISOString()
          });
        }
      });
    }

    // Disease outbreak alerts
    if (diseaseOutbreaks.length > 0) {
      const recentOutbreaks = diseaseOutbreaks.flatMap(f => 
        f.outbreaks.map((outbreak: any) => ({
          ...outbreak,
          fieldId: f.fieldId
        }))
      ).filter((outbreak: any) => {
        const detectedDate = new Date(outbreak.detected_at);
        const daysAgo = Math.floor((Date.now() - detectedDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo <= 7;
      });

      recentOutbreaks.forEach(outbreak => {
        alerts.push({
          type: "critical",
          category: "disease",
          icon: Bug,
          title: "🐛 DISEASE DETECTED",
          message: `${outbreak.disease_name} in ${outbreak.fieldName}. ${outbreak.confidence}% confidence. Check treatments!`,
          color: "border-red-500 bg-red-50",
          timestamp: outbreak.detected_at
        });
      });
    }

    // Water savings alert
    if (irrigationData?.weeklyWaterSavings > 20) {
      alerts.push({
        type: "success",
        category: "savings",
        icon: TrendingUp,
        title: "💰 SAVINGS ALERT",
        message: `Save ${irrigationData.weeklyWaterSavings}% water this week! That's ₹${irrigationData.costSavings} saved on diesel!`,
        color: "border-green-500 bg-green-50",
        timestamp: new Date().toISOString()
      });
    }

    // Sort by timestamp (newest first)
    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const allAlerts = generateAllAlerts();
  const criticalAlerts = allAlerts.filter(a => a.type === "critical");
  const weatherAlerts = allAlerts.filter(a => a.category === "weather");
  const diseaseAlerts = allAlerts.filter(a => a.category === "disease");
  const irrigationAlerts = allAlerts.filter(a => a.category === "irrigation");

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const renderAlerts = (alerts: any[]) => {
    if (alerts.length === 0) {
      return (
        <Card className="p-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">All Clear! 🎉</h3>
          <p className="text-sm text-muted-foreground">
            No alerts in this category. Your farm is doing great!
          </p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <Alert key={index} className={`${alert.color} border-l-4`}>
              <Icon className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge variant="outline" className="text-xs">
                    {getTimeAgo(alert.timestamp)}
                  </Badge>
                </div>
                <p className="text-xs">{alert.message}</p>
              </AlertDescription>
            </Alert>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{allAlerts.length}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{diseaseAlerts.length}</p>
          <p className="text-xs text-muted-foreground">Disease</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{weatherAlerts.length}</p>
          <p className="text-xs text-muted-foreground">Weather</p>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="critical">Critical</TabsTrigger>
          <TabsTrigger value="weather">Weather</TabsTrigger>
          <TabsTrigger value="disease">Disease</TabsTrigger>
          <TabsTrigger value="irrigation">Water</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          {renderAlerts(allAlerts)}
        </TabsContent>

        <TabsContent value="critical" className="mt-4">
          {renderAlerts(criticalAlerts)}
        </TabsContent>

        <TabsContent value="weather" className="mt-4">
          {renderAlerts(weatherAlerts)}
        </TabsContent>

        <TabsContent value="disease" className="mt-4">
          {renderAlerts(diseaseAlerts)}
        </TabsContent>

        <TabsContent value="irrigation" className="mt-4">
          {renderAlerts(irrigationAlerts)}
        </TabsContent>
      </Tabs>

      {/* Mark All as Read Button */}
      {allAlerts.length > 0 && (
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => {}}>
            Mark All as Read
          </Button>
        </div>
      )}
    </div>
  );
};
