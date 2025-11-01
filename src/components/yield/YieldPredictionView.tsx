import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Download, 
  TrendingUp,
  Gauge,
  Thermometer,
  Droplets,
  Bug,
  Wheat,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  Calendar,
  Target,
  Share2,
  Copy
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { YieldPredictionService, YieldPredictionResponse } from "@/lib/yieldPredictionService";
import { ReportService } from "@/lib/reportService";
import { blackBoxService } from "@/lib/blackBoxService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Use the interface from the service
type YieldPrediction = YieldPredictionResponse;

interface YieldPredictionViewProps {
  fieldId: string;
}

export const YieldPredictionView: React.FC<YieldPredictionViewProps> = ({ fieldId }) => {
  const [prediction, setPrediction] = useState<YieldPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAudioPlay = (text: string, id: string) => {
    if (playingAudio === id) {
      audioService.stop();
      setPlayingAudio(null);
    } else {
      // Log audio interaction
      blackBoxService.logAudioInteraction(id, 'yield_prediction', text, fieldId);
      blackBoxService.logUserInteraction('audio_play', `yield_${id}`, fieldId, {
        predictedYield: prediction?.predicted_yield,
        confidence: prediction?.confidence,
        audioContent: text.substring(0, 100) // First 100 chars for logging
      });
      
      audioService.speak(
        text,
        () => setPlayingAudio(id),
        () => setPlayingAudio(null)
      );
    }
  };

  const fetchYieldPrediction = async () => {
    setLoading(true);
    setError(null);

    try {
      // Log yield prediction request
      blackBoxService.logUserInteraction('page_view', 'yield_prediction_view', fieldId, {
        timestamp: new Date().toISOString()
      });
      
      const predictionResult = await YieldPredictionService.getPrediction(fieldId);
      setPrediction(predictionResult);
      
      // Log successful yield prediction
      blackBoxService.logUserInteraction('button_click', 'yield_prediction_loaded', fieldId, {
        predictedYield: predictionResult.predicted_yield,
        confidence: predictionResult.confidence,
        dataQuality: predictionResult.data_quality,
        varietyName: predictionResult.variety_info?.variety_name
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch yield prediction';
      setError(errorMessage);
      
      // Log yield prediction error
      blackBoxService.logError('api_failure', errorMessage, fieldId, 'yield_prediction_fetch');
      
      console.error('Yield prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYieldPrediction();
  }, [fieldId]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 0.8) return "default";
    if (confidence >= 0.6) return "secondary";
    return "destructive";
  };

  const getDataQualityColor = (quality: number) => {
    if (quality >= 0.8) return "text-green-600";
    if (quality >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getDroughtToleranceColor = (tolerance: string) => {
    switch (tolerance.toLowerCase()) {
      case "high": return "text-green-600";
      case "medium": return "text-yellow-600";
      case "low": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const formatAdjustmentText = (factor: number) => {
    const percentage = Math.round((factor - 1) * 100);
    if (percentage > 0) return `+${percentage}%`;
    if (percentage < 0) return `${percentage}%`;
    return "No impact";
  };

  const getAdjustmentColor = (factor: number) => {
    if (factor > 1.05) return "text-green-600";
    if (factor < 0.95) return "text-red-600";
    return "text-gray-600";
  };

  const handleDownloadReport = () => {
    if (!prediction) return;
    
    try {
      ReportService.generateYieldPredictionReportPDF(prediction, fieldId);
      
      // Log report download
      blackBoxService.logUserInteraction('button_click', 'yield_report_downloaded', fieldId, {
        reportType: 'pdf',
        predictedYield: prediction.predicted_yield,
        confidence: prediction.confidence
      });
      
      toast({
        title: "Report Downloaded",
        description: "Yield prediction report has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      
      // Log download error
      blackBoxService.logError('api_failure', 'Failed to generate yield prediction report', fieldId, 'report_download');
      
      toast({
        title: "Download Failed",
        description: "Failed to generate the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareReport = async () => {
    if (!prediction) return;
    
    try {
      const shareMessage = ReportService.formatYieldPredictionShareMessage(prediction, fieldId);
      ReportService.shareViaWhatsApp(shareMessage);
      
      // Log report share
      blackBoxService.logUserInteraction('button_click', 'yield_report_shared', fieldId, {
        shareMethod: 'whatsapp',
        predictedYield: prediction.predicted_yield,
        confidence: prediction.confidence
      });
      
      toast({
        title: "Sharing Report",
        description: "Opening WhatsApp to share your yield prediction report.",
      });
    } catch (error) {
      console.error('Error sharing report:', error);
      
      // Log share error
      blackBoxService.logError('api_failure', 'Failed to share yield prediction report', fieldId, 'report_share');
      
      toast({
        title: "Share Failed",
        description: "Failed to share the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyReport = async () => {
    if (!prediction) return;
    
    try {
      const shareMessage = ReportService.formatYieldPredictionShareMessage(prediction, fieldId);
      const success = await ReportService.copyToClipboard(shareMessage);
      
      if (success) {
        toast({
          title: "Report Copied",
          description: "Yield prediction report has been copied to clipboard.",
        });
      } else {
        throw new Error('Failed to copy to clipboard');
      }
    } catch (error) {
      console.error('Error copying report:', error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy the report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchYieldPrediction}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!prediction) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No yield prediction data available for this field.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                <Wheat className="h-5 w-5 text-green-600" />
                Yield Prediction
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    `Yield prediction for your field: ${prediction.predicted_yield} tons per hectare with ${Math.round(prediction.confidence * 100)} percent confidence. The predicted range is from ${prediction.prediction_range.lower_bound} to ${prediction.prediction_range.upper_bound} tons per hectare.`,
                    "main-prediction"
                  )}
                  className="p-1 h-8 w-8"
                >
                  {playingAudio === "main-prediction" ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <Badge variant={getConfidenceBadgeVariant(prediction.confidence)}>
                    <span className={getConfidenceColor(prediction.confidence)}>
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Data Quality:</span>
                  <span className={`font-semibold ${getDataQualityColor(prediction.data_quality)}`}>
                    {Math.round(prediction.data_quality * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  setLoading(true);
                  try {
                    const refreshedPrediction = await YieldPredictionService.refreshPrediction(fieldId);
                    setPrediction(refreshedPrediction);
                    setError(null);
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Failed to refresh prediction');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="flex items-center gap-1"
                title="Refresh prediction"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1"
                    title="Download or share report"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareReport}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share via WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyReport}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Main Yield Display */}
          <div className="text-center mb-6 p-6 bg-white/60 rounded-lg border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="h-6 w-6 text-green-600" />
              <span className="text-lg font-medium text-muted-foreground">Predicted Yield</span>
            </div>
            <div className="text-4xl font-bold text-green-700 mb-2">
              {prediction.predicted_yield} t/ha
            </div>
            <div className="text-sm text-muted-foreground">
              Range: {prediction.prediction_range.lower_bound} - {prediction.prediction_range.upper_bound} t/ha
            </div>
          </div>

          {/* Yield Range Visualization */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Yield Range Visualization</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAudioPlay(
                  `The yield range shows a minimum expected yield of ${prediction.prediction_range.lower_bound} tons per hectare, predicted yield of ${prediction.predicted_yield} tons per hectare, and maximum potential of ${prediction.prediction_range.upper_bound} tons per hectare.`,
                  "yield-range"
                )}
                className="p-1 h-6 w-6"
              >
                {playingAudio === "yield-range" ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="relative">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Lower Bound</span>
                <span>Predicted</span>
                <span>Upper Bound</span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute h-full bg-gradient-to-r from-yellow-400 to-green-500 rounded-full"
                  style={{ 
                    left: '10%', 
                    width: '80%' 
                  }}
                />
                <div 
                  className="absolute h-full w-1 bg-green-700 rounded-full"
                  style={{ 
                    left: `${10 + (prediction.predicted_yield - prediction.prediction_range.lower_bound) / (prediction.prediction_range.upper_bound - prediction.prediction_range.lower_bound) * 80}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium mt-1">
                <span className="text-yellow-600">{prediction.prediction_range.lower_bound}</span>
                <span className="text-green-700">{prediction.predicted_yield}</span>
                <span className="text-green-600">{prediction.prediction_range.upper_bound}</span>
              </div>
            </div>
          </div>

          {/* Confidence and Quality Indicators */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-white/60 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Prediction Confidence</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    `Prediction confidence is ${Math.round(prediction.confidence * 100)} percent. This indicates how reliable the yield prediction is based on available data and model accuracy.`,
                    "confidence"
                  )}
                  className="p-1 h-5 w-5"
                >
                  {playingAudio === "confidence" ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Progress value={prediction.confidence * 100} className="mb-2" />
              <div className={`text-lg font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                {Math.round(prediction.confidence * 100)}%
              </div>
            </div>
            <div className="p-4 bg-white/60 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Data Quality</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    `Data quality is ${Math.round(prediction.data_quality * 100)} percent. Higher data quality means more accurate satellite imagery and field information was available for the prediction.`,
                    "data-quality"
                  )}
                  className="p-1 h-5 w-5"
                >
                  {playingAudio === "data-quality" ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Progress value={prediction.data_quality * 100} className="mb-2" />
              <div className={`text-lg font-semibold ${getDataQualityColor(prediction.data_quality)}`}>
                {Math.round(prediction.data_quality * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variety Information Card */}
      {prediction.variety_info && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wheat className="h-5 w-5 text-amber-600" />
              Crop Variety Information
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAudioPlay(
                  `Crop variety information: You are growing ${prediction.variety_info?.variety_name} which has a maturity period of ${prediction.variety_info?.maturity_days} days and yield potential of ${prediction.variety_info?.yield_potential} tons per hectare. This variety has ${prediction.variety_info?.drought_tolerance.toLowerCase()} drought tolerance.`,
                  "variety-info"
                )}
                className="p-1 h-6 w-6"
              >
                {playingAudio === "variety-info" ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Variety Name:</span>
                  <Badge variant="outline" className="font-medium">
                    {prediction.variety_info.variety_name}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Maturity Days:</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{prediction.variety_info.maturity_days} days</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Yield Potential:</span>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="font-medium">{prediction.variety_info.yield_potential} t/ha</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Drought Tolerance:</span>
                  <Badge 
                    variant={prediction.variety_info.drought_tolerance === "High" ? "default" : 
                            prediction.variety_info.drought_tolerance === "Medium" ? "secondary" : "destructive"}
                  >
                    <span className={getDroughtToleranceColor(prediction.variety_info.drought_tolerance)}>
                      {prediction.variety_info.drought_tolerance}
                    </span>
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environmental Factors Card */}
      {prediction.environmental_factors && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-600" />
              Environmental Impact Factors
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const factors = prediction.environmental_factors!;
                  const audioText = `Environmental factors affecting yield: Temperature adjustment is ${formatAdjustmentText(factors.temperature_adjustment)}, rainfall adjustment is ${formatAdjustmentText(factors.rainfall_adjustment)}, soil moisture adjustment is ${formatAdjustmentText(factors.soil_moisture_adjustment)}, and pest pressure adjustment is ${formatAdjustmentText(factors.pest_pressure_adjustment)}.`;
                  handleAudioPlay(audioText, "environmental-factors");
                }}
                className="p-1 h-6 w-6"
              >
                {playingAudio === "environmental-factors" ? (
                  <VolumeX className="h-3 w-3" />
                ) : (
                  <Volume2 className="h-3 w-3" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className={`font-medium ${getAdjustmentColor(prediction.environmental_factors.temperature_adjustment)}`}>
                  {formatAdjustmentText(prediction.environmental_factors.temperature_adjustment)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Rainfall</span>
                </div>
                <span className={`font-medium ${getAdjustmentColor(prediction.environmental_factors.rainfall_adjustment)}`}>
                  {formatAdjustmentText(prediction.environmental_factors.rainfall_adjustment)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Soil Moisture</span>
                </div>
                <span className={`font-medium ${getAdjustmentColor(prediction.environmental_factors.soil_moisture_adjustment)}`}>
                  {formatAdjustmentText(prediction.environmental_factors.soil_moisture_adjustment)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Pest Pressure</span>
                </div>
                <span className={`font-medium ${getAdjustmentColor(prediction.environmental_factors.pest_pressure_adjustment)}`}>
                  {formatAdjustmentText(prediction.environmental_factors.pest_pressure_adjustment)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Environmental Impact Explanation</p>
                  <p>These factors show how current environmental conditions are affecting your predicted yield compared to optimal conditions. Positive adjustments indicate favorable conditions, while negative adjustments suggest challenges that may reduce yield.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prediction Metadata */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Prediction Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Generated:</span>
                <span className="font-mono text-xs">
                  {new Date(prediction.prediction_timestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Field ID:</span>
                <Badge variant="outline" className="text-xs font-mono">
                  {fieldId}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Prediction Complete
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Model Accuracy:</span>
                <Badge variant="secondary" className="text-xs">
                  {prediction.confidence >= 0.8 ? 'High' : prediction.confidence >= 0.6 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};