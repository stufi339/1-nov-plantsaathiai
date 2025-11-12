import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { supabaseFieldService } from "@/lib/supabaseFieldService";
import { migrateLocalStorageToSupabase, needsMigration } from "@/lib/migrateLocalStorageToSupabase";
import { mandiPriceService } from "@/lib/mandiPriceService";

export const DashboardView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [irrigationData, setIrrigationData] = useState<any>(null);
  const [fieldsData, setFieldsData] = useState<any[]>([]);
  const [diseaseOutbreaks, setDiseaseOutbreaks] = useState<any[]>([]);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const [priceAlert, setPriceAlert] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (fieldsData.length > 0) {
      checkForCriticalAlerts();
    }
  }, [fieldsData, weatherData]);

  useEffect(() => {
    // Quick Win #3: Market Price Alert
    checkMarketPrices();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Check if migration is needed
      const shouldMigrate = await needsMigration();
      if (shouldMigrate) {
        setShowMigrationPrompt(true);
      }

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

      // Load fields data from Supabase
      const fields = await loadFieldsFromSupabase();
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

  const loadFieldsFromSupabase = async () => {
    try {
      // Load fields from Supabase
      const fields = await supabaseFieldService.getFields();
      
      // Enrich each field with latest field data
      const enrichedFields = await Promise.all(
        fields.map(async (field: any) => {
          try {
            const latestData = await supabaseFieldService.getLatestFieldData(field.id);
            if (latestData) {
              // Map Supabase field names to expected format
              return {
                ...field,
                // Map crop_type to cropType
                cropType: field.crop_type,
                // Add satellite and soil data
                ndvi: latestData.ndvi,
                evi: latestData.evi,
                ndwi: latestData.ndwi,
                moisture: latestData.soil_moisture,
                temperature: latestData.temperature,
                health: {
                  ndvi: latestData.ndvi,
                  status: latestData.health_score > 0.7 ? "healthy" : 
                          latestData.health_score > 0.5 ? "monitor" : 
                          latestData.health_score > 0.3 ? "stress" : "unknown"
                },
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
      console.error("Failed to load fields from Supabase:", error);
      return [];
    }
  };

  const handleMigration = async () => {
    setMigrating(true);
    try {
      const result = await migrateLocalStorageToSupabase();
      if (result.success) {
        alert(`✅ Successfully migrated ${result.migrated} fields to Supabase!`);
        setShowMigrationPrompt(false);
        // Reload dashboard data
        await loadDashboardData();
      } else {
        alert(`❌ Migration failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Migration error:', error);
      alert('❌ Migration failed. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  const checkForCriticalAlerts = () => {
    const alerts: any[] = [];
    const currentHour = new Date().getHours();
    
    for (const field of fieldsData) {
      // Quick Win #1: NDVI Drop Alert
      if (field.ndvi && field.ndvi < 0.6) {
        const ndviPercentage = Math.round(field.ndvi * 100);
        const historicalNDVI = 0.75;
        const drop = Math.round(((historicalNDVI - field.ndvi) / historicalNDVI) * 100);
        const potentialLoss = Math.round((historicalNDVI - field.ndvi) * 10000);
        
        alerts.push({
          id: `ndvi_${field.id}`,
          severity: 'critical',
          field: field.name,
          issue: `Plant health dropped to ${ndviPercentage}% (${drop}% decline)`,
          impact: `Potential yield loss: ₹${potentialLoss}`,
          action: 'Check for nitrogen deficiency. Apply NPK fertilizer (20-20-0) today.',
          timeWindow: 'Next 24 hours',
          confidence: 85
        });
      }
      
      // Water Stress Alert
      if (field.ndwi && field.ndwi < 0.3 && field.moisture && field.moisture < 30) {
        alerts.push({
          id: `water_${field.id}`,
          severity: 'critical',
          field: field.name,
          issue: 'Severe water stress detected',
          impact: 'Crop stress can reduce yield by 20-30%',
          action: 'Irrigate immediately. Water deeply for 2-3 hours.',
          timeWindow: 'Urgent - Next 6 hours',
          confidence: 90
        });
      }
    }
    
    // Quick Win #2: Irrigation Timing Alert (Morning 5-10 AM)
    if (currentHour >= 5 && currentHour < 10 && irrigationData) {
      const needsIrrigation = fieldsData.some(f => 
        (f.moisture && f.moisture < 40) || (f.ndwi && f.ndwi < 0.4)
      );
      
      if (needsIrrigation) {
        alerts.push({
          id: 'irrigation_timing',
          severity: 'warning',
          field: 'All Fields',
          issue: 'Perfect irrigation window NOW',
          impact: 'Save ₹300 by watering now vs afternoon (50% less evaporation)',
          action: 'Irrigate now at 5-10 AM. Best time for water absorption.',
          timeWindow: 'Next 5 hours',
          confidence: 90
        });
      }
    }
    
    // Quick Win #4: Spray Alert (Morning 5-10 AM, low wind)
    if (currentHour >= 5 && currentHour < 10 && weatherData) {
      const windSpeed = weatherData.current?.wind_speed || 0;
      if (windSpeed < 10) {
        alerts.push({
          id: 'spray_window',
          severity: 'info',
          field: 'All Fields',
          issue: 'Perfect spray window NOW',
          impact: `Low wind (${windSpeed} km/h). Pesticides won't drift. Save ₹200 on wasted spray.`,
          action: 'Apply pesticides/fertilizers now before 10 AM.',
          timeWindow: 'Next 5 hours',
          confidence: 85
        });
      }
    }
    
    // Quick Win #5: Disease Risk Alert (High humidity + warm temp)
    if (weatherData?.current) {
      const humidity = weatherData.current.humidity || 0;
      const temp = weatherData.current.temp || 0;
      
      // Fungal disease risk: High humidity (>80%) + Warm temp (25-32°C)
      if (humidity > 80 && temp >= 25 && temp <= 32) {
        const riskLevel = humidity > 90 ? 'Very High' : 'High';
        const potentialLoss = humidity > 90 ? 8000 : 5000;
        
        alerts.push({
          id: 'disease_risk',
          severity: 'critical',
          field: 'All Fields',
          issue: `${riskLevel} fungal disease risk detected`,
          impact: `Humidity ${humidity}% + Temp ${Math.round(temp)}°C = Perfect conditions for blast, blight. Potential loss: ₹${potentialLoss}`,
          action: 'Apply preventive fungicide (Mancozeb or Copper oxychloride) within 24 hours. Monitor leaves for spots.',
          timeWindow: 'Next 24 hours',
          confidence: 88
        });
      }
      
      // Bacterial disease risk: Very high humidity (>85%) + High temp (>30°C)
      if (humidity > 85 && temp > 30) {
        alerts.push({
          id: 'bacterial_risk',
          severity: 'warning',
          field: 'All Fields',
          issue: 'Bacterial disease risk elevated',
          impact: `High humidity + heat stress = Bacterial leaf blight risk. Potential loss: ₹3,500`,
          action: 'Avoid overhead irrigation. Apply copper-based bactericide if symptoms appear.',
          timeWindow: 'Next 48 hours',
          confidence: 75
        });
      }
    }
    
    // Quick Win #6: Pest Risk Alert (Weather patterns)
    if (weatherData?.current && weatherData?.forecast) {
      const temp = weatherData.current.temp || 0;
      const humidity = weatherData.current.humidity || 0;
      const recentRain = weatherData.forecast?.slice(0, 3).some((day: any) => 
        day.weather?.[0]?.main === 'Rain'
      );
      
      // Stem borer risk: Warm + humid after rain
      if (recentRain && temp >= 25 && temp <= 30 && humidity > 70) {
        for (const field of fieldsData) {
          if (field.cropType === 'rice' || field.cropType === 'sugarcane') {
            alerts.push({
              id: `pest_${field.id}`,
              severity: 'warning',
              field: field.name,
              issue: 'Stem borer activity expected',
              impact: `Post-rain + warm weather = Peak pest activity. Potential damage: ₹4,000`,
              action: `Monitor ${field.cropType} stems for holes. Apply Chlorantraniliprole if damage seen.`,
              timeWindow: 'Next 3-5 days',
              confidence: 80
            });
          }
        }
      }
      
      // Aphid/Whitefly risk: Hot + dry conditions
      if (temp > 32 && humidity < 60) {
        alerts.push({
          id: 'aphid_risk',
          severity: 'info',
          field: 'All Fields',
          issue: 'Aphid/Whitefly risk increasing',
          impact: `Hot dry weather favors sucking pests. Can spread viral diseases. Potential loss: ₹2,500`,
          action: 'Check leaf undersides daily. Use yellow sticky traps. Apply neem oil or Imidacloprid if infestation seen.',
          timeWindow: 'Next 7 days',
          confidence: 70
        });
      }
    }
    
    setCriticalAlerts(alerts);
  };

  const checkMarketPrices = async () => {
    try {
      // Get common crops
      const crops = ['rice', 'wheat', 'cotton', 'sugarcane'];
      
      for (const crop of crops) {
        const prices = await mandiPriceService.getCommodityPrices(crop);
        
        if (prices.length > 0) {
          const avgPrice = prices.reduce((sum, p) => sum + p.modal_price, 0) / prices.length;
          const highestPrice = Math.max(...prices.map(p => p.modal_price));
          const increase = Math.round(((highestPrice - avgPrice) / avgPrice) * 100);
          
          if (increase > 5) {
            const bestMarket = prices.find(p => p.modal_price === highestPrice);
            setPriceAlert({
              commodity: crop.charAt(0).toUpperCase() + crop.slice(1),
              price: highestPrice,
              increase,
              market: bestMarket?.market || 'Local market',
              action: 'Prices up! Best selling window: Next 3 days'
            });
            break; // Show only first good opportunity
          }
        }
      }
    } catch (error) {
      console.error('Failed to check prices:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50/30 to-background">
        <div className="text-center space-y-4 p-4 max-w-md">
          {/* Skeleton Loading */}
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">{t("loading")}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-background">
      {/* Migration Prompt */}
      {showMigrationPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-3">📦 Migrate Your Fields</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We found fields in your old storage. Would you like to migrate them to the new cloud database? 
              This will preserve all your field data and satellite measurements.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="flex-1 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
              >
                {migrating ? "Migrating..." : "✅ Migrate Now"}
              </button>
              <button
                onClick={() => setShowMigrationPrompt(false)}
                disabled={migrating}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3 p-4 pb-20">
        {/* Hero Section */}
        <DashboardHeader 
          weatherData={weatherData}
          irrigationData={irrigationData}
          diseaseOutbreaks={diseaseOutbreaks}
        />

        {/* 🚨 CRITICAL ALERTS - Compact Version */}
        {criticalAlerts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <h3 className="font-bold text-red-900 text-sm">
                  {criticalAlerts.length} {t('critical_alerts') || 'Critical Alert'}
                  {criticalAlerts.length > 1 ? 's' : ''}
                </h3>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs text-red-700 hover:text-red-900 font-medium"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-2">
              {criticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="bg-white/80 rounded p-2 border border-red-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{alert.field}</p>
                      <p className="text-xs text-gray-700 line-clamp-1">
                        {alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : '🔵'} {alert.issue}
                      </p>
                      <p className="text-xs text-green-800 mt-1 line-clamp-1">
                        ✅ {alert.action}
                      </p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 
                      alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.confidence}%
                    </span>
                  </div>
                </div>
              ))}
              {criticalAlerts.length > 2 && (
                <p className="text-xs text-center text-red-700">
                  +{criticalAlerts.length - 2} more alerts
                </p>
              )}
            </div>
          </div>
        )}

        {/* 📈 MARKET PRICE ALERT - Compact Version */}
        {priceAlert && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-xl">📈</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-green-900 text-sm">
                    {priceAlert.commodity} ↑ {priceAlert.increase}%
                  </h3>
                  <p className="text-xs text-green-800 truncate">
                    ₹{priceAlert.price}/quintal • {priceAlert.market}
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/mandi-prices')}
                className="text-xs text-green-700 hover:text-green-900 font-medium whitespace-nowrap ml-2"
              >
                View Prices →
              </button>
            </div>
          </div>
        )}

        {/* Weather Card - Subtle Design */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl shadow-sm">
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

        {/* Marketplace Recommendations - Moved Higher */}
        <div className="bg-white border border-purple-100 rounded-xl p-5 shadow-sm">
          <MarketplaceRecommendations 
            weatherData={weatherData}
            fields={fieldsData}
          />
        </div>

        {/* Fields Overview */}
        <FieldsOverview fields={fieldsData} />

        {/* Yield Summary */}
        {fieldsData.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm">
            <YieldSummary fields={fieldsData} />
          </div>
        )}

        {/* Disease Monitoring */}
        {diseaseOutbreaks.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-5 shadow-sm">
            <DiseaseMonitoring outbreaks={diseaseOutbreaks} />
          </div>
        )}

        {/* Educational Content Section - Tabbed Interface */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 border-b border-gray-200">
              <TabsTrigger value="videos" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                📹 Videos
              </TabsTrigger>
              <TabsTrigger value="stories" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                ⭐ Stories
              </TabsTrigger>
              <TabsTrigger value="gallery" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                📸 Gallery
              </TabsTrigger>
            </TabsList>
            <TabsContent value="videos" className="p-4 m-0">
              <EducationalVideos />
            </TabsContent>
            <TabsContent value="stories" className="p-4 m-0">
              <FarmerStories />
            </TabsContent>
            <TabsContent value="gallery" className="p-4 m-0">
              <CommunityGallery />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
