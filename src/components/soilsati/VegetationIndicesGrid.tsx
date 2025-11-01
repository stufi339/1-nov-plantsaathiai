import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Volume2, TrendingUp, TrendingDown, Loader2, AlertCircle, RefreshCw, Wifi, WifiOff, ThumbsUp, ThumbsDown, Star, Satellite, Calendar, CloudIcon } from "lucide-react";
import { blackBoxService } from "@/lib/blackBoxService";
import { geeService } from "@/lib/geeService";
import { SoilAnalysisService } from "@/lib/soilAnalysisService";
import { fieldDataCacheService } from "@/lib/fieldDataCacheService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface VegetationIndices {
  // Core vegetation indices
  ndvi: number;
  msavi2: number;
  ndre: number;
  ndwi: number;
  ndmi: number;
  soc_vis: number;
  rsm: number;
  rvi: number;
  
  // Optional NPK indicators
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  npk_confidence?: number;
  
  // Analysis metadata
  analysisDate?: string;
  satelliteSource?: string;
  cloudCover?: number;
  status: string;
}

interface FieldCoordinates {
  lat: number;
  lng: number;
  polygon?: number[][];
}

interface VegetationIndicesGridProps {
  fieldCoordinates: FieldCoordinates;
  playAudio: (text: string, id: string) => void;
  playingAudio: string | null;
  fieldId?: string;
  onAnalysisComplete?: (analysis: any) => void;
}

export const VegetationIndicesGrid = ({ fieldCoordinates, playAudio, playingAudio, fieldId = 'unknown', onAnalysisComplete }: VegetationIndicesGridProps) => {
  const { t } = useTranslation();
  const [indices, setIndices] = useState<VegetationIndices | null>(null);
  
  // 🔥 LOG VEGETATION INDICES VIEW
  useEffect(() => {
    if (indices) {
      blackBoxService.logVegetationIndicesView(fieldId, {
        ndvi: indices.ndvi,
        msavi2: indices.msavi2,
        ndre: indices.ndre,
        ndwi: indices.ndwi,
        ndmi: indices.ndmi,
        rsm: indices.rsm,
        rvi: indices.rvi,
        soc_vis: indices.soc_vis
      });
    }
  }, [fieldId, indices]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<{[key: string]: 'helpful' | 'not_helpful' | null}>({});
  const [showFeedbackThanks, setShowFeedbackThanks] = useState(false);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<any>(null);
  const { toast } = useToast();

  // Fetch comprehensive soil analysis with all data points
  const fetchVegetationIndices = async (forceRefresh: boolean = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && fieldDataCacheService.isCacheValid(fieldId)) {
      const cachedData = fieldDataCacheService.getCachedData(fieldId);
      if (cachedData && cachedData.data.comprehensiveAnalysis) {
        console.log('✅ Using cached vegetation data');
        const analysis = cachedData.data.comprehensiveAnalysis;
        setComprehensiveAnalysis(analysis);
        
        const vegIndices = analysis.vegetation_indices;
        setIndices({
          ndvi: vegIndices.ndvi,
          msavi2: vegIndices.msavi2,
          ndre: vegIndices.ndre,
          ndwi: vegIndices.ndwi,
          ndmi: vegIndices.ndmi,
          soc_vis: vegIndices.soc_vis,
          rsm: vegIndices.rsm,
          rvi: vegIndices.rvi,
          nitrogen: analysis.npk_analysis.nitrogen.value,
          phosphorus: analysis.npk_analysis.phosphorus.value,
          potassium: analysis.npk_analysis.potassium.value,
          npk_confidence: analysis.npk_analysis.confidence,
          analysisDate: analysis.metadata.analysis_date,
          satelliteSource: analysis.metadata.satellite_source,
          cloudCover: analysis.metadata.cloud_cover_percent,
          status: vegIndices.ndvi >= 0.6 ? 'healthy' : vegIndices.ndvi >= 0.4 ? 'moderate' : 'poor'
        });
        
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }
        
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      // Log analysis start
      blackBoxService.logUserInteraction('button_click', 'comprehensive_soil_analysis_started', fieldId, {
        coordinates: fieldCoordinates,
        hasPolygon: !!fieldCoordinates.polygon,
        timestamp: new Date().toISOString()
      });

      toast({
        title: "🛰️ Analyzing Your Field",
        description: "Fetching comprehensive soil and vegetation data...",
        duration: 3000,
      });

      // Use comprehensive soil analysis if polygon is available
      if (fieldCoordinates.polygon && fieldCoordinates.polygon.length >= 3) {
        // console.log('🌍 Using comprehensive polygon-based soil analysis');
        
        const analysis = await SoilAnalysisService.analyzePolygon({
          points: fieldCoordinates.polygon as [number, number][]
        });

        setComprehensiveAnalysis(analysis);
        
        // Pass analysis to parent component
        if (onAnalysisComplete) {
          onAnalysisComplete(analysis);
        }

        // Map comprehensive analysis to vegetation indices format
        const vegIndices = analysis.vegetation_indices;
        setIndices({
          ndvi: vegIndices.ndvi,
          msavi2: vegIndices.msavi2,
          ndre: vegIndices.ndre,
          ndwi: vegIndices.ndwi,
          ndmi: vegIndices.ndmi,
          soc_vis: vegIndices.soc_vis,
          rsm: vegIndices.rsm,
          rvi: vegIndices.rvi,
          nitrogen: analysis.npk_analysis.nitrogen.value,
          phosphorus: analysis.npk_analysis.phosphorus.value,
          potassium: analysis.npk_analysis.potassium.value,
          npk_confidence: analysis.npk_analysis.confidence,
          analysisDate: analysis.metadata.analysis_date,
          satelliteSource: analysis.metadata.satellite_source,
          cloudCover: analysis.metadata.cloud_cover_percent,
          status: vegIndices.ndvi >= 0.6 ? 'healthy' : vegIndices.ndvi >= 0.4 ? 'moderate' : 'poor'
        });

        // Log comprehensive analysis to black box
        blackBoxService.logVegetationIndicesView(
          fieldId,
          {
            ndvi: vegIndices.ndvi,
            msavi2: vegIndices.msavi2,
            ndre: vegIndices.ndre,
            ndwi: vegIndices.ndwi,
            ndmi: vegIndices.ndmi,
            soc_vis: vegIndices.soc_vis,
            rsm: vegIndices.rsm,
            rvi: vegIndices.rvi
          },
          {
            nitrogen: analysis.npk_analysis.nitrogen.value,
            phosphorus: analysis.npk_analysis.phosphorus.value,
            potassium: analysis.npk_analysis.potassium.value,
            confidence: analysis.npk_analysis.confidence
          }
        );

        // Log additional comprehensive data
        blackBoxService.logUserInteraction('page_view', 'comprehensive_soil_analysis_complete', fieldId, {
          polygonArea: analysis.location.area_hectares,
          soilProperties: analysis.soil_properties,
          micronutrients: analysis.micronutrients,
          environmental: analysis.environmental,
          dataQuality: analysis.metadata.data_quality,
          confidenceLevel: analysis.metadata.confidence_level
        });

        toast({
          title: "✅ Analysis Complete!",
          description: `Comprehensive soil analysis ready for ${analysis.location.area_hectares} hectares`,
          duration: 4000,
        });

      } else {
        // Fallback to standard GEE analysis for point coordinates
        // console.log('🛰️ Using standard GEE analysis for point coordinates');
        
        if (!geeService.validateCoordinates(fieldCoordinates)) {
          throw new Error('Invalid field coordinates provided');
        }

        const dateRange = await geeService.getAvailableDateRange(fieldCoordinates);
        const result = await geeService.analyzeVegetationIndices({
          coordinates: fieldCoordinates,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          cloudCoverThreshold: 20
        });

        setIndices({
          ...result,
          status: result.ndvi >= 0.6 ? 'healthy' : result.ndvi >= 0.4 ? 'moderate' : 'poor'
        });

        blackBoxService.logVegetationIndicesView(
          fieldId,
          {
            ndvi: result.ndvi,
            msavi2: result.msavi2,
            ndre: result.ndre,
            ndwi: result.ndwi,
            ndmi: result.ndmi,
            soc_vis: result.soc_vis,
            rsm: result.rsm,
            rvi: result.rvi
          },
          result.npk_confidence !== undefined && result.npk_confidence > 0.7 ? {
            nitrogen: result.nitrogen,
            phosphorus: result.phosphorus,
            potassium: result.potassium,
            confidence: result.npk_confidence
          } : undefined
        );

        toast({
          title: "✅ Analysis Complete!",
          description: "Vegetation indices analyzed successfully",
          duration: 3000,
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze vegetation indices';
      setError(errorMessage);
      blackBoxService.logError('api_failure', errorMessage, fieldId, 'comprehensive_soil_analysis');
      
      toast({
        title: "❌ Analysis Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchVegetationIndices(false); // Don't force refresh on mount
    blackBoxService.logFieldAccess(fieldId, 'view', ['vegetation_indices']);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId]); // Only re-run when fieldId changes, not fieldCoordinates (object reference)

  // Handle user feedback
  const handleFeedback = (section: string, feedback: 'helpful' | 'not_helpful') => {
    setUserFeedback(prev => ({ ...prev, [section]: feedback }));
    
    blackBoxService.logUserFeedback(
      'rating',
      `User found ${section} ${feedback}`,
      'vegetation_indices',
      fieldId,
      feedback === 'helpful' ? 5 : 2
    );

    setShowFeedbackThanks(true);
    setTimeout(() => setShowFeedbackThanks(false), 3000);
  };
  const getIndexData = (indices: VegetationIndices) => [
    {
      id: "ndvi",
      name: "NDVI",
      fullName: t('vegetation_health_index'),
      value: indices.ndvi,
      optimal: [0.3, 0.8] as [number, number],
      description: "Measures overall crop health and photosynthetic activity",
      farmerFriendly: t('vegetation_health_index_desc'),
      recommendation: indices.ndvi >= 0.6 ? t('vegetation_health_recommendation_excellent') :
                     indices.ndvi >= 0.4 ? "Good health, but monitor for improvements." :
                     "⚠️ Poor vegetation health. Check for water, nutrients, or pest issues.",
      icon: "🌱",
      color: "from-green-500 to-emerald-600",
      category: "Health"
    },
    {
      id: "msavi2",
      name: "MSAVI2",
      fullName: t('enhanced_soil_adjusted_vegetation'),
      value: indices.msavi2,
      optimal: [0.4, 0.7] as [number, number],
      description: "Advanced vegetation measurement that minimizes soil background interference",
      farmerFriendly: t('enhanced_soil_adjusted_vegetation_desc'),
      recommendation: indices.msavi2 >= 0.5 ? t('enhanced_soil_adjusted_vegetation_recommendation_excellent') :
                     indices.msavi2 >= 0.3 ? "Moderate vegetation coverage." :
                     "⚠️ Significant soil exposure detected. Consider improving crop density.",
      icon: "🌾",
      color: "from-amber-500 to-orange-600",
      category: "Health"
    },
    {
      id: "ndre",
      name: "NDRE",
      fullName: t('nitrogen_content_indicator'),
      value: indices.ndre,
      optimal: [0.2, 0.6] as [number, number],
      description: "Red-edge based nitrogen and chlorophyll assessment",
      farmerFriendly: t('nitrogen_content_indicator_desc'),
      recommendation: indices.ndre >= 0.4 ? t('nitrogen_content_recommendation_excellent') :
                     indices.ndre >= 0.2 ? "Adequate nitrogen, consider light fertilization." :
                     "⚠️ Low nitrogen detected. Apply urea or nitrogen-rich fertilizer.",
      icon: "💚",
      color: "from-green-600 to-lime-600",
      category: "Nutrition"
    },
    {
      id: "ndwi",
      name: "NDWI",
      fullName: t('leaf_water_content'),
      value: indices.ndwi,
      optimal: [0.2, 0.5] as [number, number],
      description: "Water content stored in plant leaves",
      farmerFriendly: t('leaf_water_content_desc'),
      recommendation: indices.ndwi >= 0.3 ? t('leaf_water_content_recommendation_optimal') :
                     indices.ndwi >= 0.1 ? "Moderate water content, monitor irrigation." :
                     "🚨 Low leaf water - increase irrigation immediately!",
      icon: "💦",
      color: "from-blue-500 to-cyan-600",
      category: "Water"
    },
    {
      id: "ndmi",
      name: "NDMI",
      fullName: t('plant_water_stress'),
      value: indices.ndmi,
      optimal: [0.2, 0.6] as [number, number],
      description: "Overall plant water stress and moisture status",
      farmerFriendly: t('plant_water_stress_desc'),
      recommendation: indices.ndmi >= 0.4 ? t('plant_water_stress_recommendation_no_stress') :
                     indices.ndmi >= 0.2 ? "Mild water stress, increase irrigation." :
                     "🚨 Severe water stress! Immediate irrigation needed.",
      icon: "💧",
      color: "from-blue-600 to-indigo-600",
      category: "Water"
    },
    {
      id: "rsm",
      name: "RSM",
      fullName: t('root_zone_moisture'),
      value: indices.rsm,
      optimal: [0.3, 0.6] as [number, number],
      description: "Soil moisture available to plant roots",
      farmerFriendly: t('root_zone_moisture_desc'),
      recommendation: indices.rsm >= 0.4 ? t('root_zone_moisture_recommendation_excellent') :
                     indices.rsm >= 0.2 ? "Adequate soil moisture." :
                     "🚨 Dry soil at root level - water your field now!",
      icon: "🌿",
      color: "from-teal-500 to-green-600",
      category: "Water"
    },
    {
      id: "rvi",
      name: "RVI",
      fullName: t('biomass_growth_index'),
      value: indices.rvi,
      optimal: [2.0, 8.0] as [number, number],
      description: "Total plant biomass and growth vigor",
      farmerFriendly: t('biomass_growth_index_desc'),
      recommendation: indices.rvi >= 4.0 ? t('biomass_growth_recommendation_excellent') :
                     indices.rvi >= 2.0 ? "Good growth rate." :
                     "⚠️ Slow growth - check nutrients, water, and pest issues.",
      icon: "🌾",
      color: "from-yellow-500 to-amber-600",
      category: "Growth"
    },
    {
      id: "soc_vis",
      name: "SOC",
      fullName: t('soil_organic_carbon'),
      value: indices.soc_vis,
      optimal: [0.3, 0.7] as [number, number],
      description: "Soil health and organic matter content",
      farmerFriendly: t('soil_organic_carbon_desc'),
      recommendation: indices.soc_vis >= 0.5 ? t('soil_organic_carbon_recommendation_good') :
                     indices.soc_vis >= 0.3 ? "Good soil health, maintain organic practices." :
                     "⚠️ Low soil organic matter. Add compost or farmyard manure.",
      icon: "🪨",
      color: "from-stone-600 to-amber-700",
      category: "Soil"
    }
  ];







  // Enhanced audio error handling
  const handleAudioError = (audioId: string, errorMessage: string) => {
    blackBoxService.logError('audio_failure', errorMessage, fieldId, `audio_play_${audioId}`, undefined, false);
    console.error(`Audio playback failed for ${audioId}:`, errorMessage);
  };

  // Get status based on value and optimal range
  const getStatus = (value: number, optimal: [number, number]) => {
    if (value >= optimal[0] && value <= optimal[1]) return { label: "Optimal", color: "bg-success text-success-foreground" };
    if (value < optimal[0] * 0.8) return { label: "Poor", color: "bg-destructive text-destructive-foreground" };
    if (value > optimal[1] * 1.2) return { label: "Excess", color: "bg-warning text-warning-foreground" };
    return { label: "Monitor", color: "bg-warning text-warning-foreground" };
  };

  // Get NPK status for nutrient levels
  const getNPKStatus = (value: number, nutrient: 'nitrogen' | 'phosphorus' | 'potassium') => {
    const ranges = {
      nitrogen: { low: 1.5, optimal: [2.0, 4.0], high: 4.5 },
      phosphorus: { low: 0.2, optimal: [0.3, 0.8], high: 1.0 },
      potassium: { low: 1.0, optimal: [1.5, 2.5], high: 3.0 }
    };
    
    const range = ranges[nutrient];
    if (value >= range.optimal[0] && value <= range.optimal[1]) {
      return { label: "Optimal", color: "bg-success text-success-foreground" };
    }
    if (value < range.low) {
      return { label: "Low", color: "bg-destructive text-destructive-foreground" };
    }
    if (value > range.high) {
      return { label: "High", color: "bg-warning text-warning-foreground" };
    }
    return { label: "Moderate", color: "bg-info text-info-foreground" };
  };

  // Generate comprehensive soil health summary
  const generateSoilHealthSummary = () => {
    if (!indices) return "Analysis in progress...";
    
    const indexData = getIndexData(indices);
    const healthyIndices = indexData.filter(index => {
      const status = getStatus(index.value, index.optimal);
      return status.label === "Optimal";
    });
    
    const poorIndices = indexData.filter(index => {
      const status = getStatus(index.value, index.optimal);
      return status.label === "Poor";
    });

    let overallHealth = "excellent";
    if (poorIndices.length > 2) overallHealth = "poor";
    else if (poorIndices.length > 0) overallHealth = "moderate";
    else if (healthyIndices.length >= 6) overallHealth = "excellent";
    else overallHealth = "good";

    const npkSummary = showNPKSection ? 
      `Your nutrient analysis shows ${
        indices.nitrogen !== undefined ? `nitrogen at ${indices.nitrogen.toFixed(1)} percent, ` : ''
      }${
        indices.phosphorus !== undefined ? `phosphorus at ${indices.phosphorus.toFixed(1)} percent, ` : ''
      }${
        indices.potassium !== undefined ? `and potassium at ${indices.potassium.toFixed(1)} percent. ` : ''
      }` : 'Nutrient analysis is not available with sufficient confidence at this time. ';

    return `Advanced vegetation analysis summary for your field. Based on location-specific algorithms that simulate ${indices.satelliteSource || 'Sentinel-2'} satellite analysis from ${indices.analysisDate ? new Date(indices.analysisDate).toLocaleDateString() : 'today'}, your field health is ${overallHealth}. Out of ${indexData.length} vegetation indices analyzed, ${healthyIndices.length} are in optimal condition and ${poorIndices.length} require attention. ${npkSummary}The analysis considers your geographic location, seasonal patterns, and climate zone for accurate vegetation health assessment.`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-16 w-full rounded" />
                <Skeleton className="h-9 w-full rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Analysis Failed</AlertTitle>
          <AlertDescription>
            {error}. Please try refreshing the page or check your internet connection.
          </AlertDescription>
        </Alert>
        
        <Card className="p-8 text-center">
          <Satellite className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Satellite Data</h3>
          <p className="text-muted-foreground mb-4">
            We're having trouble connecting to the satellite analysis service.
          </p>
          <Button onClick={() => fetchVegetationIndices(true)} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (!indices) {
    return null; // Will show loading or error states above
  }

  const indexData = getIndexData(indices);
  const showNPKSection = indices.npk_confidence !== undefined && indices.npk_confidence > 0.7;

  // Group indices by category
  const groupedIndices = indexData.reduce((acc, index) => {
    if (!acc[index.category]) acc[index.category] = [];
    acc[index.category].push(index);
    return acc;
  }, {} as Record<string, typeof indexData>);

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      {/* Info Banner */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Advanced Satellite Simulation</AlertTitle>
        <AlertDescription className="text-blue-700">
          Using scientifically-based algorithms that simulate real Sentinel-2 satellite analysis. 
          Results are based on your field location, seasonal patterns, and climate zone for realistic vegetation health assessment.
        </AlertDescription>
      </Alert>

      {/* Analysis Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Satellite className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Vegetation Health Analysis</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {indices.analysisDate ? new Date(indices.analysisDate).toLocaleDateString() : 'Today'}
                  </span>
                  <span className="flex items-center gap-1">
                    <CloudIcon className="w-4 h-4" />
                    {indices.cloudCover?.toFixed(0) || 0}% clouds
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Location-Based Analysis
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const summary = generateSoilHealthSummary();
                  blackBoxService.logAudioInteraction('soil-health-summary', 'soil_summary', summary, fieldId);
                  blackBoxService.logUserInteraction('audio_play', 'soil_health_summary', fieldId);
                  playAudio(summary, 'soil-health-summary');
                }}
              >
                <Volume2 className={`w-4 h-4 mr-2 ${playingAudio === 'soil-health-summary' ? 'animate-pulse text-primary' : ''}`} />
                🎯 Summary
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  // Check if cache is valid
                  if (fieldDataCacheService.isCacheValid(fieldId)) {
                    const timeRemaining = fieldDataCacheService.getTimeUntilExpiry(fieldId);
                    toast({
                      title: "📊 Data Already Up-to-Date",
                      description: `Satellite data was updated recently. Next update available in ${timeRemaining}.`,
                      duration: 4000,
                    });
                  } else {
                    await fetchVegetationIndices(true); // Force refresh
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Data
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Vegetation Indices by Category */}
      {Object.entries(groupedIndices).map(([category, categoryIndices]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{category} Indicators</h3>
            <Badge variant="outline" className="text-xs">
              {categoryIndices.length} indices
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryIndices.map((index) => {
              const status = getStatus(index.value, index.optimal);
              const progressValue = ((index.value - Math.min(...index.optimal)) / (Math.max(...index.optimal) - Math.min(...index.optimal))) * 100;
              
              return (
                <Card key={index.id} className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${index.color} text-white`}>
                          <span className="text-lg">{index.icon}</span>
                        </div>
                        <div>
                          <CardTitle className="text-base">{index.fullName}</CardTitle>
                          <CardDescription className="text-xs">{index.name}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{index.value.toFixed(3)}</div>
                        <Badge className={status.color} variant="secondary">
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{index.optimal[0]}</span>
                        <span>Optimal Range</span>
                        <span>{index.optimal[1]}</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, progressValue))} 
                        className="h-2"
                      />
                    </div>

                    {/* Description */}
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <p className="text-sm text-foreground">{index.farmerFriendly}</p>
                    </div>

                    {/* Recommendation */}
                    <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-900 mb-1">💡 Recommendation</p>
                      <p className="text-sm text-blue-800">{index.recommendation}</p>
                    </div>

                    {/* Audio Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full group-hover:bg-blue-50 transition-colors"
                      disabled={playingAudio === index.id}
                      onClick={() => {
                        try {
                          const statusText = status.label === "Optimal" ? "which is excellent" : 
                                           status.label === "Poor" ? "which needs immediate attention" :
                                           status.label === "Excess" ? "which is higher than needed" :
                                           "which requires monitoring";
                          
                          const detailedExplanation = `${index.fullName} analysis from satellite data. Your current ${index.name} value is ${index.value.toFixed(3)}, ${statusText}. ${index.farmerFriendly} The optimal range for this index is between ${index.optimal[0]} and ${index.optimal[1]}. ${index.recommendation}`;
                          
                          blackBoxService.logAudioInteraction(index.id, 'vegetation_index', detailedExplanation, fieldId);
                          blackBoxService.logUserInteraction('audio_play', `vegetation_index_${index.id}`, fieldId, {
                            indexName: index.name,
                            indexValue: index.value,
                            status: status.label
                          });
                          
                          playAudio(detailedExplanation, index.id);
                        } catch (error) {
                          const errorMessage = error instanceof Error ? error.message : 'Unknown audio error';
                          handleAudioError(index.id, errorMessage);
                        }
                      }}
                    >
                      {playingAudio === index.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin text-primary" />
                      ) : (
                        <Volume2 className="w-4 h-4 mr-2" />
                      )}
                      {playingAudio === index.id ? 'Playing...' : 'Listen to Analysis'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* NPK Indicators Section - Only shown when confidence > 0.7 */}
      {showNPKSection && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Nutrient Analysis (NPK)</h2>
          
          <Card className="p-4 bg-card shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧪</span>
              <h3 className="text-base font-semibold">Estimated Nutrient Levels</h3>
              <Badge className="bg-info text-info-foreground">
                {(indices.npk_confidence! * 100).toFixed(0)}% Confidence
              </Badge>
            </div>

            <div className="space-y-3 mb-4">
              {indices.nitrogen !== undefined && (
                <div className="p-3 bg-muted/30 rounded space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟢</span>
                      <div>
                        <p className="text-sm font-medium">Nitrogen (N)</p>
                        <p className="text-xs text-muted-foreground">{indices.nitrogen.toFixed(1)}% - Derived from NDRE + vegetation vigor</p>
                      </div>
                    </div>
                    <Badge className={getNPKStatus(indices.nitrogen, 'nitrogen').color}>
                      {getNPKStatus(indices.nitrogen, 'nitrogen').label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const nitrogenExplanation = `Nitrogen analysis. Your soil has ${indices.nitrogen.toFixed(1)} percent nitrogen, which is ${getNPKStatus(indices.nitrogen, 'nitrogen').label.toLowerCase()}. This estimate is derived from NDRE index and vegetation vigor analysis. Nitrogen is the most important nutrient for plant growth. It helps plants develop green leaves and strong stems. ${
                        getNPKStatus(indices.nitrogen, 'nitrogen').label === 'Low' ? 'Your crops may show yellowing leaves. Apply urea fertilizer or nitrogen-rich organic compost to improve growth.' :
                        getNPKStatus(indices.nitrogen, 'nitrogen').label === 'High' ? 'Too much nitrogen can cause excessive leaf growth and delay flowering. Reduce nitrogen fertilizer application.' :
                        'Your nitrogen levels are perfect for healthy plant growth and good green color.'
                      }`;
                      
                      blackBoxService.logAudioInteraction('nitrogen-detail', 'npk_analysis', nitrogenExplanation, fieldId);
                      blackBoxService.logUserInteraction('audio_play', 'npk_nitrogen_detail', fieldId, {
                        nitrogenValue: indices.nitrogen,
                        status: getNPKStatus(indices.nitrogen, 'nitrogen').label
                      });
                      
                      playAudio(nitrogenExplanation, 'nitrogen-detail');
                    }}
                  >
                    <Volume2 className={`w-3 h-3 mr-1 ${playingAudio === 'nitrogen-detail' ? 'animate-pulse text-primary' : ''}`} />
                    Listen to Nitrogen Details
                  </Button>
                </div>
              )}

              {indices.phosphorus !== undefined && (
                <div className="p-3 bg-muted/30 rounded space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🟠</span>
                      <div>
                        <p className="text-sm font-medium">Phosphorus (P)</p>
                        <p className="text-xs text-muted-foreground">{indices.phosphorus.toFixed(1)}% - Estimated from vegetation indices + soil data</p>
                      </div>
                    </div>
                    <Badge className={getNPKStatus(indices.phosphorus, 'phosphorus').color}>
                      {getNPKStatus(indices.phosphorus, 'phosphorus').label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const phosphorusExplanation = `Phosphorus analysis. Your soil has ${indices.phosphorus.toFixed(1)} percent phosphorus, which is ${getNPKStatus(indices.phosphorus, 'phosphorus').label.toLowerCase()}. This estimate comes from vegetation indices combined with soil data analysis. Phosphorus is crucial for root development, flowering, and fruit formation. ${
                        getNPKStatus(indices.phosphorus, 'phosphorus').label === 'Low' ? 'Low phosphorus can cause poor root growth and delayed flowering. Apply DAP fertilizer or bone meal to improve phosphorus levels.' :
                        getNPKStatus(indices.phosphorus, 'phosphorus').label === 'High' ? 'Excess phosphorus can interfere with other nutrient uptake. Reduce phosphorus fertilizer application.' :
                        'Your phosphorus levels are excellent for strong root development and good flowering.'
                      }`;
                      
                      blackBoxService.logAudioInteraction('phosphorus-detail', 'npk_analysis', phosphorusExplanation, fieldId);
                      blackBoxService.logUserInteraction('audio_play', 'npk_phosphorus_detail', fieldId, {
                        phosphorusValue: indices.phosphorus,
                        status: getNPKStatus(indices.phosphorus, 'phosphorus').label
                      });
                      
                      playAudio(phosphorusExplanation, 'phosphorus-detail');
                    }}
                  >
                    <Volume2 className={`w-3 h-3 mr-1 ${playingAudio === 'phosphorus-detail' ? 'animate-pulse text-primary' : ''}`} />
                    Listen to Phosphorus Details
                  </Button>
                </div>
              )}

              {indices.potassium !== undefined && (
                <div className="p-3 bg-muted/30 rounded space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔵</span>
                      <div>
                        <p className="text-sm font-medium">Potassium (K)</p>
                        <p className="text-xs text-muted-foreground">{indices.potassium.toFixed(1)}% - Estimated from plant health + stress indicators</p>
                      </div>
                    </div>
                    <Badge className={getNPKStatus(indices.potassium, 'potassium').color}>
                      {getNPKStatus(indices.potassium, 'potassium').label}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const potassiumExplanation = `Potassium analysis. Your soil has ${indices.potassium.toFixed(1)} percent potassium, which is ${getNPKStatus(indices.potassium, 'potassium').label.toLowerCase()}. This estimate is based on plant health and stress indicators analysis. Potassium acts like a vitamin for plants, helping them resist diseases, drought, and cold weather. ${
                        getNPKStatus(indices.potassium, 'potassium').label === 'Low' ? 'Low potassium makes plants weak and susceptible to diseases. Apply muriate of potash or wood ash to strengthen your plants.' :
                        getNPKStatus(indices.potassium, 'potassium').label === 'High' ? 'Excess potassium can interfere with calcium and magnesium uptake. Reduce potassium fertilizer application.' :
                        'Your potassium levels are perfect for strong, disease-resistant plants.'
                      }`;
                      
                      blackBoxService.logAudioInteraction('potassium-detail', 'npk_analysis', potassiumExplanation, fieldId);
                      blackBoxService.logUserInteraction('audio_play', 'npk_potassium_detail', fieldId, {
                        potassiumValue: indices.potassium,
                        status: getNPKStatus(indices.potassium, 'potassium').label
                      });
                      
                      playAudio(potassiumExplanation, 'potassium-detail');
                    }}
                  >
                    <Volume2 className={`w-3 h-3 mr-1 ${playingAudio === 'potassium-detail' ? 'animate-pulse text-primary' : ''}`} />
                    Listen to Potassium Details
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-warning/10 p-3 rounded mb-3">
              <p className="text-sm font-medium text-foreground">⚠️ Important Disclaimer:</p>
              <p className="text-xs text-muted-foreground">
                These are estimated values based on satellite imagery analysis. For accurate nutrient levels, 
                we recommend conducting a professional soil test at an agricultural laboratory.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const nitrogenText = indices.nitrogen !== undefined ? 
                  `Nitrogen level is ${indices.nitrogen.toFixed(1)} percent, which is ${getNPKStatus(indices.nitrogen, 'nitrogen').label.toLowerCase()}. Nitrogen is essential for leaf growth and green color. ${
                    getNPKStatus(indices.nitrogen, 'nitrogen').label === 'Low' ? 'Consider applying urea or nitrogen-rich fertilizer.' :
                    getNPKStatus(indices.nitrogen, 'nitrogen').label === 'High' ? 'Reduce nitrogen application to prevent excessive leaf growth.' :
                    'Your nitrogen levels are good for healthy plant growth.'
                  }` : '';
                
                const phosphorusText = indices.phosphorus !== undefined ? 
                  `Phosphorus level is ${indices.phosphorus.toFixed(1)} percent, which is ${getNPKStatus(indices.phosphorus, 'phosphorus').label.toLowerCase()}. Phosphorus helps with root development and flowering. ${
                    getNPKStatus(indices.phosphorus, 'phosphorus').label === 'Low' ? 'Consider applying DAP or phosphorus-rich fertilizer.' :
                    getNPKStatus(indices.phosphorus, 'phosphorus').label === 'High' ? 'Reduce phosphorus application.' :
                    'Your phosphorus levels support good root and flower development.'
                  }` : '';
                
                const potassiumText = indices.potassium !== undefined ? 
                  `Potassium level is ${indices.potassium.toFixed(1)} percent, which is ${getNPKStatus(indices.potassium, 'potassium').label.toLowerCase()}. Potassium strengthens plants against diseases and stress. ${
                    getNPKStatus(indices.potassium, 'potassium').label === 'Low' ? 'Consider applying muriate of potash or potassium-rich fertilizer.' :
                    getNPKStatus(indices.potassium, 'potassium').label === 'High' ? 'Reduce potassium application.' :
                    'Your potassium levels help plants resist diseases and stress.'
                  }` : '';
                
                const fullExplanation = `NPK Nutrient Analysis Results. Our analysis has ${(indices.npk_confidence! * 100).toFixed(0)} percent confidence. ${nitrogenText} ${phosphorusText} ${potassiumText} Important reminder: These are estimated values based on satellite imagery and vegetation analysis. For the most accurate nutrient levels, we recommend conducting a professional soil test at an agricultural laboratory.`;
                
                playAudio(fullExplanation, 'npk-analysis');
              }}
            >
              <Volume2 className={`w-4 h-4 mr-2 ${playingAudio === 'npk-analysis' ? 'animate-pulse text-primary' : ''}`} />
              🔊 Listen to NPK Analysis
            </Button>
          </Card>
        </div>
      )}

      {/* Soil Management Recommendations */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Soil Management Recommendations</h2>
        
        <Card className="p-4 bg-card shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🌱</span>
            <h3 className="text-base font-semibold">Smart Farming Actions</h3>
          </div>

          <div className="space-y-2 mb-4">
            {/* Dynamic recommendations based on indices */}
            {indices.ndmi < 0.3 && (
              <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded">
                <span className="text-sm">💧</span>
                <p className="text-sm text-foreground">
                  <strong>Urgent:</strong> Increase irrigation frequency. Your crops are showing water stress.
                </p>
              </div>
            )}
            
            {indices.ndre < 0.5 && (
              <div className="flex items-start gap-2 p-2 bg-warning/10 rounded">
                <span className="text-sm">🟢</span>
                <p className="text-sm text-foreground">
                  <strong>Nutrition:</strong> Apply nitrogen fertilizer or urea spray to improve leaf health.
                </p>
              </div>
            )}
            
            {indices.soc_vis < 0.3 && (
              <div className="flex items-start gap-2 p-2 bg-info/10 rounded">
                <span className="text-sm">🪨</span>
                <p className="text-sm text-foreground">
                  <strong>Soil Health:</strong> Add organic compost or farmyard manure to improve soil quality.
                </p>
              </div>
            )}
            
            {indices.ndvi >= 0.6 && indices.ndmi >= 0.3 && indices.soc_vis >= 0.3 && (
              <div className="flex items-start gap-2 p-2 bg-success/10 rounded">
                <span className="text-sm">✅</span>
                <p className="text-sm text-foreground">
                  <strong>Excellent:</strong> Your field is in great condition! Continue current practices.
                </p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const managementRecommendations = `Soil Management Recommendations for your field. Based on your vegetation indices analysis, here are the key actions you should take. ${
                indices.ndmi < 0.3 ? 'First priority: Your crops are showing water stress. Increase irrigation frequency immediately to prevent yield loss. ' : ''
              }${
                indices.ndre < 0.5 ? 'Nutrition priority: Your plants need more nitrogen. Apply urea fertilizer or nitrogen-rich organic fertilizer to improve leaf health and growth. ' : ''
              }${
                indices.soc_vis < 0.3 ? 'Soil health priority: Your soil organic matter is low. Add compost, farmyard manure, or green manure to improve soil fertility and water retention. ' : ''
              }${
                indices.ndvi >= 0.6 && indices.ndmi >= 0.3 && indices.soc_vis >= 0.3 ? 'Great news! Your field is in excellent condition. Continue your current farming practices as they are working very well. ' : ''
              }Remember to monitor your field regularly and adjust these recommendations based on weather conditions and crop growth stage. For best results, combine these satellite-based insights with regular field visits and soil testing.`;
              
              blackBoxService.logAudioInteraction('management-recommendations', 'management_recommendations', managementRecommendations, fieldId);
              blackBoxService.logUserInteraction('audio_play', 'management_recommendations', fieldId, {
                waterStress: indices.ndmi < 0.3,
                nitrogenDeficiency: indices.ndre < 0.5,
                lowSoilHealth: indices.soc_vis < 0.3,
                overallHealthy: indices.ndvi >= 0.6 && indices.ndmi >= 0.3 && indices.soc_vis >= 0.3
              });
              
              playAudio(managementRecommendations, 'management-recommendations');
            }}
          >
            <Volume2 className={`w-4 h-4 mr-2 ${playingAudio === 'management-recommendations' ? 'animate-pulse text-primary' : ''}`} />
            🎯 Listen to Management Actions
          </Button>
        </Card>
      </div>

      {/* NPK Analysis Section */}
      {showNPKSection && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <CardTitle className="text-lg">NPK Nutrient Analysis</CardTitle>
                <CardDescription>
                  Derived from satellite vegetation indices • {(indices.npk_confidence! * 100).toFixed(0)}% confidence
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nitrogen */}
              {indices.nitrogen !== undefined && (
                <Card className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-green-800">Nitrogen (N)</h4>
                        <p className="text-sm text-green-600">{indices.nitrogen.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Derived from NDRE + vegetation vigor
                    </p>
                    <Progress value={(indices.nitrogen / 5.0) * 100} className="h-2" />
                  </CardContent>
                </Card>
              )}

              {/* Phosphorus */}
              {indices.phosphorus !== undefined && (
                <Card className="border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-orange-800">Phosphorus (P)</h4>
                        <p className="text-sm text-orange-600">{indices.phosphorus.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Estimated from vegetation indices + soil data
                    </p>
                    <Progress value={(indices.phosphorus / 1.5) * 100} className="h-2" />
                  </CardContent>
                </Card>
              )}

              {/* Potassium */}
              {indices.potassium !== undefined && (
                <Card className="border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-semibold text-blue-800">Potassium (K)</h4>
                        <p className="text-sm text-blue-600">{indices.potassium.toFixed(1)}%</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Estimated from plant health + stress indicators
                    </p>
                    <Progress value={(indices.potassium / 3.5) * 100} className="h-2" />
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Important Note</AlertTitle>
              <AlertDescription className="text-amber-700">
                These are estimated values based on satellite imagery analysis. For precise nutrient levels, 
                we recommend conducting a professional soil test at an agricultural laboratory.
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                const npkExplanation = `NPK nutrient analysis from satellite data. ${
                  indices.nitrogen !== undefined ? `Nitrogen level is estimated at ${indices.nitrogen.toFixed(1)} percent. ` : ''
                }${
                  indices.phosphorus !== undefined ? `Phosphorus level is estimated at ${indices.phosphorus.toFixed(1)} percent. ` : ''
                }${
                  indices.potassium !== undefined ? `Potassium level is estimated at ${indices.potassium.toFixed(1)} percent. ` : ''
                }These estimates are derived from vegetation health indicators with ${(indices.npk_confidence! * 100).toFixed(0)} percent confidence. For accurate results, conduct a professional soil test.`;
                
                blackBoxService.logAudioInteraction('npk-analysis', 'npk_analysis', npkExplanation, fieldId);
                playAudio(npkExplanation, 'npk-analysis');
              }}
            >
              <Volume2 className={`w-4 h-4 mr-2 ${playingAudio === 'npk-analysis' ? 'animate-pulse text-primary' : ''}`} />
              Listen to NPK Analysis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* User Feedback Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-base font-semibold text-foreground">How helpful was this satellite analysis?</h3>
          </div>
          
          {showFeedbackThanks ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🙏</div>
              <p className="text-sm font-medium text-green-700">
                Thank you for your feedback! This helps us improve our satellite-based soil analysis.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your feedback helps us improve our real-time vegetation analysis and recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant={userFeedback['overall'] === 'helpful' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback('overall', 'helpful')}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Very Helpful
                </Button>
                
                <Button
                  variant={userFeedback['overall'] === 'not_helpful' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleFeedback('overall', 'not_helpful')}
                  className="flex items-center gap-2"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Needs Improvement
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    blackBoxService.logUserFeedback(
                      'suggestion',
                      'User wants to provide detailed feedback on satellite analysis',
                      'vegetation_indices',
                      fieldId
                    );
                  }}
                  className="text-muted-foreground"
                >
                  💬 Suggest Improvements
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
