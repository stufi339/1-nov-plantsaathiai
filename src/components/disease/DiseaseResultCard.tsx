import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  Shield,
  TrendingUp,
  Camera,
  Copy,
  FileText,
  Clock,
  Cpu
} from "lucide-react";
import { audioService } from "@/lib/audioService";
import { ReportService } from "@/lib/reportService";
import { TreatmentRecommendations } from "./TreatmentRecommendations";
import { EducationalResources } from "./EducationalResources";
import { toast } from "@/components/ui/sonner";
import { blackBoxService } from "@/lib/blackBoxService";

export interface DiseaseResult {
  disease_name: string;
  confidence: number;
  disease_stage: string;
  symptoms: string[];
  action_plan: string[];
  treatments: {
    organic: string[];
    chemical: string[];
    ipm: string[];
    cultural: string[];
  };
  recommended_videos: string[];
  faqs: Array<{ question: string; answer: string }>;
  tips: string[];
  yield_impact: "Low" | "Medium" | "High";
  spread_risk: "Low" | "Medium" | "High";
  recovery_chance: "Poor" | "Fair" | "Good" | "Excellent";
  model_version: string;
}

interface DiseaseResultCardProps {
  result: DiseaseResult;
  imageUrl: string;
  onRetake: () => void;
  playAudio?: (text: string) => void;
}

export const DiseaseResultCard: React.FC<DiseaseResultCardProps> = ({
  result,
  imageUrl,
  onRetake
}) => {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [showAllSymptoms, setShowAllSymptoms] = useState(false);
  const [analysisTimestamp] = useState(new Date());
  
  // Check if plant is healthy - comprehensive detection
  const isHealthy = result.disease_name.toLowerCase().includes('healthy') || 
                    result.disease_name.toLowerCase().includes('no disease') ||
                    result.disease_name.toLowerCase().includes('disease-free') ||
                    result.disease_name.toLowerCase().includes('disease free') ||
                    result.disease_name.toLowerCase() === 'healthy' ||
                    result.disease_name.toLowerCase() === 'no disease detected' ||
                    result.disease_name.toLowerCase() === 'plant is healthy' ||
                    (result.confidence > 0.7 && result.disease_name.toLowerCase().includes('normal'));
  
  // Check if image is not a plant
  const isNotPlant = result.disease_name.toLowerCase().includes('not a plant') ||
                     result.disease_name.toLowerCase().includes('invalid') ||
                     result.disease_name.toLowerCase().includes('no plant detected') ||
                     result.disease_name.toLowerCase().includes('unrecognized') ||
                     result.confidence < 0.3; // Very low confidence suggests wrong image type
  
  // Check if result is uncertain/unknown
  const isUncertain = !isHealthy && !isNotPlant && (
    result.disease_name.toLowerCase().includes('unknown') ||
    result.disease_name.toLowerCase().includes('uncertain') ||
    result.disease_name.toLowerCase().includes('unable to detect') ||
    result.disease_name.toLowerCase().includes('not sure') ||
    result.disease_name.toLowerCase().includes('unclear') ||
    result.disease_name.toLowerCase() === 'unknown disease' ||
    (result.confidence >= 0.3 && result.confidence < 0.5) // Low-medium confidence
  );

  const handleAudioPlay = (text: string, id: string) => {
    if (playingAudio === id) {
      audioService.stop();
      setPlayingAudio(null);
    } else {
      // Log audio interaction
      blackBoxService.logAudioInteraction(id, 'disease_analysis', text);
      blackBoxService.logUserInteraction('audio_play', `disease_${id}`, undefined, {
        diseaseName: result.disease_name,
        confidence: result.confidence,
        audioContent: text.substring(0, 100) // First 100 chars for logging
      });
      
      audioService.speak(
        text,
        () => setPlayingAudio(id),
        () => setPlayingAudio(null)
      );
    }
  };

  const getImpactBadgeVariant = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "low": return "default";
      case "medium": return "secondary";
      case "high": return "destructive";
      default: return "outline";
    }
  };

  const getRecoveryBadgeVariant = (chance: string) => {
    switch (chance.toLowerCase()) {
      case "excellent": return "default";
      case "good": return "secondary";
      case "fair": return "outline";
      case "poor": return "destructive";
      default: return "outline";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600";
    if (confidence >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const handleDownloadPDF = () => {
    try {
      ReportService.generateDiseaseReportPDF(result, imageUrl);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    }
  };

  const handleShareWhatsApp = () => {
    try {
      const message = ReportService.formatWhatsAppMessage(result);
      ReportService.shareViaWhatsApp(message);
      toast.success("Opening WhatsApp to share report...");
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      toast.error("Failed to share via WhatsApp. Please try again.");
    }
  };

  const handleCopyReport = async () => {
    try {
      const message = ReportService.formatWhatsAppMessage(result);
      const success = await ReportService.copyToClipboard(message);
      if (success) {
        toast.success("Report copied to clipboard!");
      } else {
        toast.error("Failed to copy report to clipboard.");
      }
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy report to clipboard.");
    }
  };

  const handleFullSummaryAudio = () => {
    const summaryText = `Complete disease analysis summary: 
      We have detected ${result.disease_name} with ${Math.round(result.confidence * 100)} percent confidence. 
      The disease is currently in ${result.disease_stage} stage. 
      
      Impact assessment shows ${result.yield_impact} yield impact, ${result.spread_risk} spread risk, and ${result.recovery_chance} recovery chance.
      
      Main symptoms include: ${result.symptoms.slice(0, 3).join(', ')}.
      
      Immediate action plan: ${result.action_plan.slice(0, 3).join('. ')}.
      
      Treatment options are available in organic, chemical, IPM, and cultural categories. 
      Please review the detailed recommendations and educational resources for complete guidance.`;
    
    handleAudioPlay(summaryText, "full-summary");
  };

  // If not a plant, show special error message
  if (isNotPlant) {
    return (
      <div className="space-y-4">
        <Card className="bg-card border-orange-200 dark:border-orange-800">
          <CardHeader>
            <CardTitle className="text-xl mb-2 flex items-center gap-2 text-orange-600 dark:text-orange-400">
              ⚠️ Invalid Image Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Uploaded image" 
                  className="w-full h-48 object-cover rounded-lg border border-orange-200"
                />
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
                  Not a Plant
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                      This doesn't appear to be a plant image
                    </h3>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      Our AI model couldn't detect any plant in this image. Please upload a clear photo of a plant's leaves, stems, or fruits for disease analysis.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-orange-900 dark:text-orange-100">📸 Tips for best results:</p>
                      <ul className="space-y-1 ml-4">
                        <li className="text-orange-800 dark:text-orange-200">• Take a photo of plant leaves, stems, or fruits</li>
                        <li className="text-orange-800 dark:text-orange-200">• Ensure the plant is clearly visible and in focus</li>
                        <li className="text-orange-800 dark:text-orange-200">• Use good lighting (natural daylight works best)</li>
                        <li className="text-orange-800 dark:text-orange-200">• Avoid photos of people, animals, or objects</li>
                        <li className="text-orange-800 dark:text-orange-200">• Get close enough to see plant details</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={onRetake}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Another Photo
                </Button>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                <p>Confidence Score: {Math.round(result.confidence * 100)}%</p>
                <p className="mt-1">Model: {result.model_version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If uncertain/unknown, show special guidance message
  if (isUncertain) {
    return (
      <div className="space-y-4">
        <Card className="bg-card border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-xl mb-2 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              ⚠️ Uncertain Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative">
                <img 
                  src={imageUrl} 
                  alt="Uploaded image" 
                  className="w-full h-48 object-cover rounded-lg border border-yellow-200"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                  Low Confidence: {Math.round(result.confidence * 100)}%
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      Unable to Confidently Identify Disease
                    </h3>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                      Our AI model detected: <strong>{result.disease_name}</strong> but with low confidence ({Math.round(result.confidence * 100)}%). 
                      This could mean the image quality needs improvement or the symptoms are not clear enough.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">📸 For better results, try:</p>
                      <ul className="space-y-1 ml-4">
                        <li className="text-yellow-800 dark:text-yellow-200">• Take a clearer, well-lit photo of the affected area</li>
                        <li className="text-yellow-800 dark:text-yellow-200">• Focus on the most visible symptoms (spots, discoloration, etc.)</li>
                        <li className="text-yellow-800 dark:text-yellow-200">• Capture multiple angles of the affected plant parts</li>
                        <li className="text-yellow-800 dark:text-yellow-200">• Ensure the plant fills most of the frame</li>
                        <li className="text-yellow-800 dark:text-yellow-200">• Avoid shadows or glare on the leaves</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Possible Result (if any) */}
              {result.disease_name && result.disease_name.toLowerCase() !== 'unknown' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                        Possible Detection: {result.disease_name}
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                        The model suggests this might be <strong>{result.disease_name}</strong>, but we recommend:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4">
                        <li>• Taking another photo with better lighting</li>
                        <li>• Consulting with a local agricultural expert</li>
                        <li>• Monitoring the plant for symptom progression</li>
                        <li>• Comparing with known disease images online</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={onRetake}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Take Better Photo
                </Button>
              </div>

              {/* Expert Consultation Suggestion */}
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-purple-600 dark:text-purple-400 mt-0.5">💡</div>
                  <div className="flex-1">
                    <h5 className="font-medium text-purple-900 dark:text-purple-100 text-sm mb-1">
                      Need Expert Help?
                    </h5>
                    <p className="text-xs text-purple-800 dark:text-purple-200">
                      For uncertain cases, we recommend consulting with your local agricultural extension officer 
                      or plant pathologist who can physically examine the plant and provide accurate diagnosis.
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                <p>Confidence Score: {Math.round(result.confidence * 100)}%</p>
                <p className="mt-1">Model: {result.model_version}</p>
                <p className="mt-1 text-yellow-600 dark:text-yellow-400">⚠️ Low confidence - retake recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Result Card */}
      <Card className="bg-card">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2 flex items-center gap-2">
                {isHealthy ? '✅ Healthy Plant Detected' : `🦠 ${result.disease_name}`}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    isHealthy 
                      ? `Great news! Your plant is healthy with ${Math.round(result.confidence * 100)} percent confidence. No disease detected. Continue with regular care and monitoring.`
                      : `Disease detected: ${result.disease_name}. Confidence level: ${Math.round(result.confidence * 100)} percent. Disease stage: ${result.disease_stage}`,
                    "main-diagnosis"
                  )}
                  className="p-1 h-8 w-8"
                >
                  {playingAudio === "main-diagnosis" ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Confidence:</span>
                  <span className={`font-semibold ${isHealthy ? 'text-green-600' : getConfidenceColor(result.confidence)}`}>
                    {Math.round(result.confidence * 100)}%
                  </span>
                </div>
                {!isHealthy && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Stage:</span>
                    <Badge variant="outline">{result.disease_stage}</Badge>
                  </div>
                )}
                {isHealthy && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      No Disease
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleFullSummaryAudio}
                className="flex items-center gap-1"
                title="Listen to summary"
              >
                {playingAudio === "full-summary" ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Summary</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPDF}
                className="flex items-center gap-1"
                title="Download PDF report"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">PDF</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleShareWhatsApp}
                className="flex items-center gap-1"
                title="Share via WhatsApp"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyReport}
                className="flex items-center gap-1"
                title="Copy report to clipboard"
              >
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
            </div>
          </div>

          {/* Impact Assessment Badges - Show different content for healthy plants */}
          {!isHealthy ? (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant="ghost"
                className="text-center p-2 h-auto flex-col"
                onClick={() => handleAudioPlay(
                  `Yield impact is ${result.yield_impact}. This indicates the potential effect on your crop harvest.`,
                  "yield-impact"
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-xs text-muted-foreground">Yield Impact</span>
                  {playingAudio === "yield-impact" ? (
                    <VolumeX className="h-3 w-3 ml-1" />
                  ) : (
                    <Volume2 className="h-3 w-3 ml-1" />
                  )}
                </div>
                <Badge variant={getImpactBadgeVariant(result.yield_impact)}>
                  {result.yield_impact}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                className="text-center p-2 h-auto flex-col"
                onClick={() => handleAudioPlay(
                  `Spread risk is ${result.spread_risk}. This shows how quickly the disease might spread to other plants.`,
                  "spread-risk"
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span className="text-xs text-muted-foreground">Spread Risk</span>
                  {playingAudio === "spread-risk" ? (
                    <VolumeX className="h-3 w-3 ml-1" />
                  ) : (
                    <Volume2 className="h-3 w-3 ml-1" />
                  )}
                </div>
                <Badge variant={getImpactBadgeVariant(result.spread_risk)}>
                  {result.spread_risk}
                </Badge>
              </Button>
              <Button
                variant="ghost"
                className="text-center p-2 h-auto flex-col"
                onClick={() => handleAudioPlay(
                  `Recovery chance is ${result.recovery_chance}. This indicates how likely your plants are to recover with proper treatment.`,
                  "recovery-chance"
                )}
              >
                <div className="flex items-center justify-center mb-1">
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="text-xs text-muted-foreground">Recovery</span>
                  {playingAudio === "recovery-chance" ? (
                    <VolumeX className="h-3 w-3 ml-1" />
                  ) : (
                    <Volume2 className="h-3 w-3 ml-1" />
                  )}
                </div>
                <Badge variant={getRecoveryBadgeVariant(result.recovery_chance)}>
                  {result.recovery_chance}
                </Badge>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-xs text-muted-foreground">Plant Health</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Excellent
                </Badge>
              </div>
              <div className="text-center p-2">
                <div className="flex items-center justify-center mb-1">
                  <Shield className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-xs text-muted-foreground">Disease Risk</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  None
                </Badge>
              </div>
              <div className="text-center p-2">
                <div className="flex items-center justify-center mb-1">
                  <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                  <span className="text-xs text-muted-foreground">Status</span>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                  Healthy
                </Badge>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {/* Image Preview Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Analyzed Image
              </h3>
              <Button variant="outline" size="sm" onClick={onRetake}>
                Retake Photo
              </Button>
            </div>
            <div className="relative">
              <img 
                src={imageUrl} 
                alt="Analyzed plant" 
                className="w-full h-48 object-cover rounded-lg border"
              />
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {Math.round(result.confidence * 100)}% Match
              </div>
            </div>
          </div>

          {/* Symptoms Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                🔍 Visible Symptoms
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    `Visible symptoms include: ${result.symptoms.join(', ')}`,
                    "symptoms"
                  )}
                  className="p-1 h-6 w-6"
                >
                  {playingAudio === "symptoms" ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </h3>
            </div>
            <div className="space-y-2">
              {result.symptoms.slice(0, showAllSymptoms ? undefined : 3).map((symptom, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-destructive mt-1">•</span>
                  <span>{symptom}</span>
                </div>
              ))}
              {result.symptoms.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSymptoms(!showAllSymptoms)}
                  className="text-xs p-0 h-auto"
                >
                  {showAllSymptoms ? (
                    <>Show Less <ChevronUp className="h-3 w-3 ml-1" /></>
                  ) : (
                    <>Show {result.symptoms.length - 3} More <ChevronDown className="h-3 w-3 ml-1" /></>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Action Plan Section - Only show for diseased plants */}
          {!isHealthy && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="font-medium">⚡ Immediate Action Plan</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAudioPlay(
                    `Immediate action plan: ${result.action_plan.join('. ')}`,
                    "action-plan"
                  )}
                  className="p-1 h-6 w-6"
                >
                  {playingAudio === "action-plan" ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div className="space-y-2">
                {result.action_plan.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-sm flex-1">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Healthy Plant Message */}
          {isHealthy && (
            <div className="mb-6">
              <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-300 dark:border-green-700 rounded-xl shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl shadow-md">
                    ✓
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                      🎉 Great News! Your Plant is Healthy
                    </h3>
                    <p className="text-base text-green-800 dark:text-green-200 mb-4">
                      No disease detected! Your plant shows no signs of infection or stress. Keep up the excellent care!
                    </p>
                    
                    {/* Healthy Plant Care Tips */}
                    <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm mb-2">
                        💚 Continue These Good Practices:
                      </h4>
                      <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>Maintain regular watering schedule based on soil moisture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>Ensure adequate sunlight and air circulation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>Monitor for any changes in leaf color or texture</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>Apply balanced fertilizer as per crop requirements</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                          <span>Keep the area around plants clean and weed-free</span>
                        </li>
                      </ul>
                    </div>

                    {/* Preventive Monitoring */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">
                            Preventive Care Tip
                          </h5>
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            Regular monitoring helps catch potential issues early. Check your plants weekly and use our disease detection tool if you notice any unusual symptoms.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Analysis Metadata */}
      <Card className="bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Analysis Metadata
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Model Version:</span>
                <Badge variant="outline" className="text-xs">
                  {result.model_version}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Analysis Time:</span>
                <span className="font-mono text-xs">
                  {analysisTimestamp.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                  Analysis Complete
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Image Quality:</span>
                <Badge variant="secondary" className="text-xs">
                  {result.confidence >= 0.8 ? 'Excellent' : result.confidence >= 0.6 ? 'Good' : 'Fair'}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Processing Details */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Processing Time: ~2.3s</span>
                <span>Image Size: {imageUrl ? 'Optimized' : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Confidence Score:</span>
                <span className={`font-semibold ${getConfidenceColor(result.confidence)}`}>
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Report generated on {analysisTimestamp.toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDownloadPDF}
                  className="text-xs h-7"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyReport}
                  className="text-xs h-7"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Recommendations - Only show if plant is NOT healthy */}
      {!isHealthy && (
        <TreatmentRecommendations 
          treatments={result.treatments}
          playingAudio={playingAudio}
          onAudioPlay={handleAudioPlay}
        />
      )}

      {/* Educational Resources - Show different content for healthy plants */}
      {isHealthy ? (
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              ✅ Your Plant is Healthy!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Great news! No disease detected. Keep up the good work with these preventive measures:
              </p>
              <div className="space-y-2">
                {result.tips.slice(0, 5).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EducationalResources 
          faqs={result.faqs}
          tips={result.tips}
          recommendedVideos={result.recommended_videos}
          playingAudio={playingAudio}
          onAudioPlay={handleAudioPlay}
        />
      )}
    </div>
  );
};