/**
 * Mobile-Optimized Field Dashboard
 * Redesigned for optimal mobile experience with tabbed interface
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Volume2, 
  Camera, 
  TrendingUp, 
  MapPin,
  Leaf,
  TestTube,
  Cloud,
  BarChart3,
  RefreshCw,
  Share2,
  Download
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { CompactVegetationGrid } from "./CompactVegetationGrid";
import { ComprehensiveSoilProperties } from "./ComprehensiveSoilProperties";
import { audioService } from "@/lib/audioService";
import { blackBoxService } from "@/lib/blackBoxService";
import { fieldScreenshotService } from "@/lib/fieldScreenshotService";
import { SoilAnalysisService } from "@/lib/soilAnalysisService";
import { useToast } from "@/hooks/use-toast";

// Mock field data
const mockFieldData = {
  id: "1",
  name: "Field 1",
  cropType: "Rice",
  variety: "IR-64",
  area: 2.5,
  sowingDate: "2024-06-21",
  expectedHarvestDate: "2024-11-18",
  coordinates: [[28.368717, 77.540933], [28.368989, 77.540859], [28.369041, 77.541089], [28.368791, 77.541176]],
  health: {
    ndvi: 0.67,
    status: "healthy"
  }
};

export const MobileOptimizedFieldDashboard = () => {
  const navigate = useNavigate();
  const { fieldId } = useParams();
  const { toast } = useToast();
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [comprehensiveAnalysis, setComprehensiveAnalysis] = useState<any>(null);
  const [vegetationIndices, setVegetationIndices] = useState<any>(null);
  const [fieldScreenshotUrl, setFieldScreenshotUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const field = mockFieldData;

  const growthDays = Math.floor((Date.now() - new Date(field.sowingDate).getTime()) / (1000 * 60 * 60 * 24));
  const harvestDays = Math.floor((new Date(field.expectedHarvestDate).getTime() - new Date(field.sowingDate).getTime()) / (1000 * 60 * 60 * 24));
  const growthPercentage = (growthDays / harvestDays) * 100;

  useEffect(() => {
    // Generate field screenshot
    const polygonPoints = field.coordinates.map(c => [c[0], c[1]] as [number, number]);
    const screenshotUrl = fieldScreenshotService.generateSatelliteImageUrl({
      lat: field.coordinates[0][0],
      lng: field.coordinates[0][1],
      polygon: polygonPoints
    });
    setFieldScreenshotUrl(screenshotUrl);

    // Start analysis
    performAnalysis();

    blackBoxService.logFieldAccess(fieldId || field.id, 'view', ['mobile_optimized_dashboard']);
    blackBoxService.logUserInteraction('page_view', 'mobile_field_dashboard', fieldId || field.id, {
      deviceType: 'mobile',
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId]);

  const performAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const polygonPoints = field.coordinates.map(c => [c[0], c[1]] as [number, number]);
      const analysis = await SoilAnalysisService.analyzePolygon({
        points: polygonPoints
      });
      
      setComprehensiveAnalysis(analysis);
      setVegetationIndices(analysis.vegetation_indices);

      // Log with screenshot
      blackBoxService.logVegetationIndicesView(
        fieldId || field.id,
        analysis.vegetation_indices,
        {
          nitrogen: analysis.npk_analysis.nitrogen.value,
          phosphorus: analysis.npk_analysis.phosphorus.value,
          potassium: analysis.npk_analysis.potassium.value,
          confidence: analysis.npk_analysis.confidence
        },
        fieldScreenshotUrl,
        polygonPoints
      );
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const playAudio = (text: string, id: string) => {
    try {
      audioService.stop();
      if (!audioService.isSupported()) {
        toast({
          title: "🔇 Audio Not Available",
          description: "Your browser doesn't support audio playback.",
          duration: 3000,
        });
        return;
      }
      
      setPlayingAudio(id);
      audioService.speak(text, () => setPlayingAudio(id), () => setPlayingAudio(null));
    } catch (error) {
      console.error('Audio playback failed:', error);
      setPlayingAudio(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast({
      title: "🔄 Refreshing Data",
      description: "Fetching latest field analysis...",
      duration: 2000,
    });
    
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsRefreshing(false);
    toast({
      title: "✅ Data Updated",
      description: "Your field analysis has been refreshed.",
      duration: 2000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${field.name} Analysis`,
        text: `Check out my ${field.cropType} field analysis from Plant Saathi`,
        url: window.location.href
      }).catch(console.error);
    } else {
      toast({
        title: "📋 Link Copied",
        description: "Field link copied to clipboard",
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-20">
      {/* Sticky Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-gradient-primary text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Button
              onClick={() => navigate("/soilsati")}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9 w-9 p-0"
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleShare}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 h-9 w-9 p-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{field.name}</h1>
              <p className="text-sm opacity-90">🌾 {field.cropType} ({field.variety})</p>
            </div>
            <Badge className="bg-white/20 text-white text-sm px-3 py-1">
              {field.area} ha
            </Badge>
          </div>
          
          {/* Quick Stats Bar */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-2 min-w-[100px]">
              <div className="text-xs opacity-80">Growth</div>
              <div className="text-lg font-bold">{growthPercentage.toFixed(0)}%</div>
            </div>
            <div className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-2 min-w-[100px]">
              <div className="text-xs opacity-80">Day</div>
              <div className="text-lg font-bold">{growthDays}/{harvestDays}</div>
            </div>
            <div className="flex-shrink-0 bg-white/10 rounded-lg px-3 py-2 min-w-[100px]">
              <div className="text-xs opacity-80">Health</div>
              <div className="text-lg font-bold">
                {field.health.ndvi >= 0.6 ? '😊' : field.health.ndvi >= 0.4 ? '😐' : '😟'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Optimized Tabbed Content */}
      <div className="px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation - Horizontal Scroll on Mobile */}
          <TabsList className="w-full grid grid-cols-4 h-auto p-1 mb-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm py-2 px-2">
              <BarChart3 className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="vegetation" className="text-xs sm:text-sm py-2 px-2">
              <Leaf className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Vegetation</span>
            </TabsTrigger>
            <TabsTrigger value="soil" className="text-xs sm:text-sm py-2 px-2">
              <TestTube className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Soil</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="text-xs sm:text-sm py-2 px-2">
              <Camera className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Actions</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 mt-0">
            {/* Field Satellite Image */}
            {fieldScreenshotUrl && (
              <Card className="overflow-hidden">
                <img 
                  src={fieldScreenshotUrl} 
                  alt="Field Satellite View" 
                  className="w-full h-56 object-cover"
                />
              </Card>
            )}

            {/* Field Summary Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Field Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Sowing Date</p>
                    <p className="text-sm font-semibold">{new Date(field.sowingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Expected Harvest</p>
                    <p className="text-sm font-semibold">{new Date(field.expectedHarvestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Growth Stage</p>
                    <p className="text-sm font-semibold">Day {growthDays} of {harvestDays}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Progress</p>
                    <p className="text-sm font-semibold">{growthPercentage.toFixed(0)}%</p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const text = `Field summary: ${field.name}, a ${field.area} hectare ${field.cropType} field. Sown on ${new Date(field.sowingDate).toLocaleDateString()}, currently at day ${growthDays} of ${harvestDays}.`;
                    playAudio(text, 'field-summary');
                  }}
                  className="w-full mt-3"
                >
                  <Volume2 className={`w-4 h-4 mr-2 ${playingAudio === 'field-summary' ? 'animate-pulse' : ''}`} />
                  Listen to Summary
                </Button>
              </CardContent>
            </Card>

            {/* Quick Health Status */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {field.health.ndvi >= 0.6 ? '🌱' : field.health.ndvi >= 0.4 ? '🌿' : '🍂'}
                  </div>
                  <h3 className="text-lg font-bold mb-1">
                    {field.health.ndvi >= 0.6 ? 'Healthy Field' : field.health.ndvi >= 0.4 ? 'Moderate Health' : 'Needs Attention'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Based on comprehensive satellite analysis
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vegetation Tab */}
          <TabsContent value="vegetation" className="mt-0">
            {isAnalyzing ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="w-full h-48 bg-muted rounded" />
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-20 bg-muted rounded" />
                  </div>
                  <p className="mt-4 text-muted-foreground">Analyzing your field...</p>
                </CardContent>
              </Card>
            ) : vegetationIndices ? (
              <CompactVegetationGrid
                indices={vegetationIndices}
                fieldScreenshotUrl={fieldScreenshotUrl}
                playAudio={playAudio}
                playingAudio={playingAudio}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No vegetation data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Soil Tab */}
          <TabsContent value="soil" className="mt-0">
            {comprehensiveAnalysis ? (
              <ComprehensiveSoilProperties
                analysis={comprehensiveAnalysis}
                playAudio={playAudio}
                playingAudio={playingAudio}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Cloud className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    Soil analysis will appear here after vegetation analysis completes
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-3 mt-0">
            <Button
              onClick={() => navigate("/disease")}
              className="w-full h-14 text-base bg-gradient-to-r from-destructive to-destructive/80"
            >
              <Camera className="w-5 h-5 mr-2" />
              📸 Diagnose Plant Disease
            </Button>

            <Button
              className="w-full h-14 text-base bg-gradient-to-r from-success to-success/80"
              disabled={growthPercentage < 85}
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              {growthPercentage >= 85 ? '📈 Predict Yield' : `🔒 Predict Yield (${Math.ceil(85 - growthPercentage)}% to go)`}
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 text-base"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Field Analysis
            </Button>

            <Button
              variant="outline"
              className="w-full h-14 text-base"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Report
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
