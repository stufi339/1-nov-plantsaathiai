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
import { supabaseFieldService } from "@/lib/supabaseFieldService";

export const NotificationsView = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [irrigationData, setIrrigationData] = useState<any>(null);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState<any[]>([]);
  const [fieldsData, setFieldsData] = useState<any[]>([]);
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
      const fields = await loadFieldsFromStorage();
      setFieldsData(fields);

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

  const loadFieldsFromStorage = async () => {
    try {
      // Load fields from Supabase
      const fields = await supabaseFieldService.getFields();
      
      // Enrich each field with latest field data
      const enrichedFields = await Promise.all(
        fields.map(async (field: any) => {
          try {
            const latestData = await supabaseFieldService.getLatestFieldData(field.id);
            if (latestData) {
              return {
                ...field,
                cropType: field.crop_type,
                ndvi: latestData.ndvi,
                evi: latestData.evi,
                ndwi: latestData.ndwi,
                moisture: latestData.soil_moisture,
                temperature: latestData.temperature,
                timestamp: latestData.timestamp
              };
            }
          } catch (error) {
            console.error(`Failed to load data for field ${field.id}:`, error);
          }
          return {
            ...field,
            cropType: field.crop_type
          };
        })
      );
      
      return enrichedFields;
    } catch (error) {
      console.error("Failed to load fields:", error);
      return [];
    }
  };

  const generateAllAlerts = () => {
    const alerts: any[] = [];
    const currentHour = new Date().getHours();

    // Add Critical Alerts from Dashboard (NDVI, Water Stress, Irrigation, Spray)
    for (const field of fieldsData) {
      // NDVI Drop Alert
      if (field.ndvi && field.ndvi < 0.6) {
        const ndviPercentage = Math.round(field.ndvi * 100);
        const historicalNDVI = 0.75;
        const drop = Math.round(((historicalNDVI - field.ndvi) / historicalNDVI) * 100);
        const potentialLoss = Math.round((historicalNDVI - field.ndvi) * 10000);
        
        alerts.push({
          type: "critical",
          category: "field_health",
          icon: AlertTriangle,
          title: `🔴 ${field.name}: Plant Health Critical`,
          message: `Health dropped to ${ndviPercentage}% (${drop}% decline). Potential yield loss: ₹${potentialLoss}. Apply NPK fertilizer (20-20-0) today.`,
          color: "border-red-500 bg-red-50",
          timestamp: new Date().toISOString()
        });
      }
      
      // Water Stress Alert
      if (field.ndwi && field.ndwi < 0.3 && field.moisture && field.moisture < 30) {
        alerts.push({
          type: "critical",
          category: "field_health",
          icon: Droplets,
          title: `💧 ${field.name}: Severe Water Stress`,
          message: `Crop stress can reduce yield by 20-30%. Irrigate immediately. Water deeply for 2-3 hours.`,
          color: "border-red-500 bg-red-50",
          timestamp: new Date().toISOString()
        });
      }
    }

    // Irrigation Timing Alert (Morning 5-10 AM)
    if (currentHour >= 5 && currentHour < 10 && irrigationData) {
      const needsIrrigation = fieldsData.some(f => 
        (f.moisture && f.moisture < 40) || (f.ndwi && f.ndwi < 0.4)
      );
      
      if (needsIrrigation) {
        alerts.push({
          type: "warning",
          category: "irrigation",
          icon: Droplets,
          title: "🟡 Perfect Irrigation Window NOW",
          message: "Save ₹300 by watering now vs afternoon (50% less evaporation). Irrigate at 5-10 AM for best water absorption.",
          color: "border-orange-500 bg-orange-50",
          timestamp: new Date().toISOString()
        });
      }
    }

    // Spray Alert (Morning 5-10 AM, low wind)
    if (currentHour >= 5 && currentHour < 10 && weatherData) {
      const windSpeed = weatherData.current?.wind_speed || 0;
      if (windSpeed < 10) {
        alerts.push({
          type: "info",
          category: "spray",
          icon: AlertTriangle,
          title: "🔵 Perfect Spray Window NOW",
          message: `Low wind (${windSpeed} km/h). Pesticides won't drift. Save ₹200 on wasted spray. Apply before 10 AM.`,
          color: "border-blue-500 bg-blue-50",
          timestamp: new Date().toISOString()
        });
      }
    }

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
