import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "./DashboardHeader";
import { WeatherCard } from "./WeatherCard";
import { FieldsOverview } from "./FieldsOverview";
import { ActionableInsights } from "./ActionableInsights";
import { QuickActions } from "./QuickActions";
import { YieldSummary } from "./YieldSummary";
import { DiseaseMonitoring } from "./DiseaseMonitoring";
import { MarketplaceRecommendations } from "./MarketplaceRecommendations";
import { EducationalVideos } from "./EducationalVideos";
import { CommunityGallery } from "./CommunityGallery";
import { FarmerStories } from "./FarmerStories";
import { weatherService } from "@/lib/weatherService";
import { jalSaathiService } from "@/lib/jalSaathiService";
import { diseaseDetectionService } from "@/lib/diseaseDetectionService";

export const DashboardView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [irrigationData, setIrrigationData] = useState<any>(null);
  const [fieldsData, setFieldsData] = useState<any[]>([]);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load weather data
      try {
        const location = await weatherService.getCurrentLocation();
        const weather = await weatherService.getWeatherByCoords(location.lat, location.lon);
        setWeatherData(weather);
      } catch (error) {
        console.error("Failed to load weather:", error);
        // Fallback to default location
        const weather = await weatherService.getWeatherByCity("Delhi");
        setWeatherData(weather);
      }

      // Load fields data from localStorage
      const fields = loadFieldsFromStorage();
      setFieldsData(fields);

      // Load disease outbreaks
      const outbreaks = diseaseDetectionService.getAllFieldsWithDiseases();
      setDiseaseOutbreaks(outbreaks);

      // Load irrigation schedule for first field (if exists)
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

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
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
              // Preserve original field properties
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
      console.error("Failed to load fields:", error);
      return [];
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
      <div className="space-y-6 p-4 max-w-7xl mx-auto pb-20">
        {/* Hero Section */}
        <DashboardHeader 
          weatherData={weatherData}
          irrigationData={irrigationData}
          diseaseOutbreaks={diseaseOutbreaks}
        />

        {/* Weather & Today's Irrigation - Premium Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
          <WeatherCard weatherData={weatherData} irrigationData={irrigationData} />
        </div>

        {/* Critical Section - What to do TODAY */}
        <ActionableInsights 
          weatherData={weatherData}
          irrigationData={irrigationData}
          fields={fieldsData}
        />

        {/* Quick Actions - Easy Access */}
        <QuickActions />

        {/* Fields Overview */}
        <FieldsOverview fields={fieldsData} />

        {/* Educational Content Section */}
        <div className="space-y-6 bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          {/* Educational Videos */}
          <EducationalVideos />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Success Stories */}
          <FarmerStories />

          {/* Divider */}
          <div className="border-t border-gray-200 my-6" />

          {/* Community Gallery */}
          <CommunityGallery />
        </div>

        {/* Yield Summary */}
        {fieldsData.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg">
            <YieldSummary fields={fieldsData} />
          </div>
        )}

        {/* Disease Monitoring */}
        {diseaseOutbreaks.length > 0 && (
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 shadow-lg">
            <DiseaseMonitoring outbreaks={diseaseOutbreaks} />
          </div>
        )}

        {/* Marketplace Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 shadow-lg">
          <MarketplaceRecommendations 
            weatherData={weatherData}
            fields={fieldsData}
          />
        </div>
      </div>
    </div>
  );
};
