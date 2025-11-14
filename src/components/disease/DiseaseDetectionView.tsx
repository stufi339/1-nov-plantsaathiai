import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DiseaseResultCard, DiseaseResult } from "./DiseaseResultCard";
import { blackBoxService } from "@/lib/blackBoxService";
import { diseaseDetectionService, DiseaseAnalysisResponse } from "@/lib/diseaseDetectionService";

type AnalysisState = "capture" | "analyzing" | "results" | "outbreak_prompt";

export const DiseaseDetectionView = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("capture");
  const [diseaseResult, setDiseaseResult] = useState<DiseaseResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [userFields, setUserFields] = useState<Array<{ id: string; name: string }>>([]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setApiError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setApiError('Image size too large. Please select an image smaller than 10MB');
      return;
    }

    console.log('Processing image:', file.name, file.type, file.size);
    
    const reader = new FileReader();
    
    reader.onloadstart = () => {
      console.log('Starting to read file...');
    };
    
    reader.onloadend = () => {
      console.log('File read complete');
      const result = reader.result as string;
      if (result) {
        setSelectedImage(result);
        setAnalysisState("capture");
        setApiError(null); // Clear any previous errors
        
        // Log image capture interaction
        blackBoxService.logUserInteraction('button_click', 'disease_image_captured', undefined, {
          captureMethod: e.target.id === 'camera-input' ? 'camera' : 'upload',
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name
        });
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file:', reader.error);
      setApiError('Failed to read image file. Please try again.');
      blackBoxService.logError('component_error', 'FileReader error', undefined, 'image_capture');
    };
    
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    // Log retake action
    blackBoxService.logUserInteraction('button_click', 'disease_retake_photo', undefined, {
      previousAnalysisState: analysisState,
      hadResult: diseaseResult !== null
    });
    
    // Reset all state to initial values for clean retake
    setSelectedImage(null);
    setAnalysisState("capture");
    setDiseaseResult(null);
    setApiError(null); // Clear any errors
    setUserFields([]); // Clear field selection
    
    // Clear any file inputs to allow selecting the same file again
    const cameraInput = document.getElementById("camera-input") as HTMLInputElement;
    const uploadInput = document.getElementById("upload-input") as HTMLInputElement;
    if (cameraInput) cameraInput.value = "";
    if (uploadInput) uploadInput.value = "";
    
    console.log('Image capture reset - ready for new image');
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalysisState("analyzing");
    setApiError(null);
    
    // Log analysis start
    blackBoxService.logUserInteraction('button_click', 'disease_analysis_started', undefined, {
      hasImage: !!selectedImage,
      timestamp: new Date().toISOString()
    });

    try {
      // Call the disease detection API
      const result: DiseaseAnalysisResponse = await diseaseDetectionService.analyzeDisease({
        image: selectedImage,
        crop: "rice", // Can be made dynamic based on user's crop selection
        location: "India",
        symptoms: "User uploaded image"
      });

      // Convert API response to DiseaseResult format
      const diseaseResult: DiseaseResult = {
        disease_name: result.disease_name,
        confidence: result.confidence,
        disease_stage: result.disease_stage || "Unknown",
        symptoms: result.affected_parts || ["Yellowing leaves", "Brown spots", "Wilting"],
        action_plan: [
          "Isolate affected plants immediately",
          "Apply recommended treatments as listed below",
          "Monitor surrounding plants daily for spread",
          "Improve field drainage and air circulation",
          "Remove and destroy severely infected plant parts"
        ],
        treatments: result.treatments,
        recommended_videos: [
          result.disease_name + " treatment",
          result.disease_name + " prevention",
          result.disease_name + " management guide"
        ],
        faqs: [
          {
            question: "How did my plants get this disease?",
            answer: "Diseases can spread through infected seeds, soil, water, wind, insects, or contaminated tools. Proper sanitation and crop rotation help prevent spread."
          },
          {
            question: "Can I save my infected plants?",
            answer: `Recovery chance is ${result.recovery_chance}. Early detection and proper treatment significantly improve outcomes. Follow the recommended treatments carefully.`
          },
          {
            question: "Will this affect my entire crop?",
            answer: `Yield impact is ${result.yield_impact}. Immediate action can minimize damage. Isolate affected areas and monitor closely.`
          },
          {
            question: "How can I prevent this in the future?",
            answer: "Use disease-resistant varieties, practice crop rotation, maintain proper spacing, ensure good drainage, and follow integrated pest management practices."
          }
        ],
        tips: result.prevention_tips && result.prevention_tips.length > 0 ? result.prevention_tips : [
          "Practice crop rotation to break disease cycles",
          "Use certified disease-free seeds and planting material",
          "Maintain proper plant spacing for air circulation",
          "Avoid overhead irrigation to reduce leaf wetness",
          "Remove and destroy infected plant debris",
          "Sanitize tools between plants to prevent spread",
          "Monitor fields regularly for early disease detection",
          "Apply preventive treatments during high-risk periods"
        ],
        yield_impact: normalizeYieldImpact(result.yield_impact),
        spread_risk: normalizeSpreadRisk(result.spread_risk || "Medium"),
        recovery_chance: normalizeRecoveryChance(result.recovery_chance),
        model_version: "PlantSaathi-Disease-API-v1.0"
      };

      setDiseaseResult(diseaseResult);
      
      // Check if it's a healthy plant or invalid image - skip outbreak prompt
      const isHealthy = result.disease_name.toLowerCase().includes('healthy') || 
                        result.disease_name.toLowerCase().includes('no disease');
      const isNotPlant = result.disease_name.toLowerCase().includes('not a plant') ||
                         result.disease_name.toLowerCase().includes('invalid') ||
                         result.confidence < 0.3;
      
      // Skip outbreak prompt for healthy plants and invalid images
      if (isHealthy || isNotPlant) {
        setAnalysisState("results");
      } else {
        setAnalysisState("outbreak_prompt"); // Show outbreak prompt for diseased plants
      }
      
      // Log successful analysis
      blackBoxService.logUserInteraction('button_click', 'disease_analysis_completed', undefined, {
        diseaseName: result.disease_name,
        confidence: result.confidence,
        yieldImpact: result.yield_impact,
        recoveryChance: result.recovery_chance,
        isHealthy,
        isNotPlant
      });
      
    } catch (error) {
      console.error("Analysis failed:", error);
      
      // Log analysis error
      const errorMessage = error instanceof Error ? error.message : 'Unknown analysis error';
      blackBoxService.logError('api_failure', errorMessage, undefined, 'disease_analysis');
      
      setApiError(errorMessage);
      setAnalysisState("capture");
    }
  };

  const handleOutbreakResponse = async (isOutbreak: boolean) => {
    // Check if it's a healthy plant or invalid image - skip outbreak prompt
    const isHealthy = diseaseResult?.disease_name.toLowerCase().includes('healthy') || 
                      diseaseResult?.disease_name.toLowerCase().includes('no disease');
    const isNotPlant = diseaseResult?.disease_name.toLowerCase().includes('not a plant') ||
                       diseaseResult?.disease_name.toLowerCase().includes('invalid') ||
                       (diseaseResult?.confidence || 0) < 0.3;
    
    if (isHealthy || isNotPlant) {
      // Skip outbreak saving for healthy/invalid images
      setAnalysisState("results");
      return;
    }
    
    if (isOutbreak) {
      // Load user's fields from Supabase
      const fields = await loadUserFields();
      setUserFields(fields);
      
      if (fields.length === 0) {
        // No fields available, show message and go to results
        alert("No fields found. Please add fields first in Soil Saathi.");
        setAnalysisState("results");
      }
    } else {
      // Not an outbreak, just show results
      blackBoxService.logUserInteraction('button_click', 'disease_not_outbreak', undefined, {
        disease_name: diseaseResult?.disease_name
      });
      setAnalysisState("results");
    }
  };

  const handleFieldSelection = (fieldId: string, fieldName: string) => {
    if (!diseaseResult || !selectedImage) return;

    try {
      // Save disease outbreak to field's black box
      diseaseDetectionService.saveDiseaseOutbreak(
        fieldId,
        fieldName,
        diseaseResult,
        selectedImage
      );

      // Show success message
      alert(`Disease outbreak saved to field: ${fieldName}`);
      
      // Move to results view
      setAnalysisState("results");
      
    } catch (error) {
      console.error("Failed to save outbreak:", error);
      alert("Failed to save disease outbreak. Please try again.");
    }
  };

  const loadUserFields = async (): Promise<Array<{ id: string; name: string }>> => {
    try {
      // Load fields from Supabase
      const { supabaseFieldService } = await import('@/lib/supabaseFieldService');
      const fieldsData = await supabaseFieldService.getFields();
      
      const fields = fieldsData.map(field => ({
        id: field.id,
        name: field.name
      }));

      return fields;
    } catch (error) {
      console.error("Failed to load fields:", error);
      return [];
    }
  };

  // Helper functions to normalize API response values to expected types
  const normalizeYieldImpact = (impact: string): "Low" | "Medium" | "High" => {
    const normalized = impact.toLowerCase();
    if (normalized.includes("low")) return "Low";
    if (normalized.includes("high")) return "High";
    return "Medium";
  };

  const normalizeSpreadRisk = (risk: string): "Low" | "Medium" | "High" => {
    const normalized = risk.toLowerCase();
    if (normalized.includes("low")) return "Low";
    if (normalized.includes("high")) return "High";
    return "Medium";
  };

  const normalizeRecoveryChance = (chance: string): "Poor" | "Fair" | "Good" | "Excellent" => {
    const normalized = chance.toLowerCase();
    if (normalized.includes("poor")) return "Poor";
    if (normalized.includes("excellent")) return "Excellent";
    if (normalized.includes("good")) return "Good";
    return "Fair";
  };

  const renderContent = () => {
    switch (analysisState) {
      case "capture":
        return (
          <div className="px-6 py-6">
            {apiError && (
              <Card className="p-4 mb-4 bg-destructive/10 border-destructive">
                <p className="text-sm text-destructive">
                  <strong>Error:</strong> {apiError}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your connection and try again.
                </p>
              </Card>
            )}
            
            {!selectedImage ? (
              <Card className="p-8 text-center bg-card">
                <Camera className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">{t('capture_plant_image')}</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('take_clear_photo_instruction')}
                </p>

                <div className="space-y-3">
                  <div>
                    <label htmlFor="camera-input" className="block">
                      <Button 
                        className="w-full bg-gradient-to-r from-destructive to-destructive/80"
                        type="button"
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Camera className="w-4 h-4 mr-2" />
                          Open Camera
                        </span>
                      </Button>
                    </label>
                    <input
                      id="camera-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleImageCapture}
                    />
                  </div>

                  <div>
                    <label htmlFor="upload-input" className="block">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        type="button"
                        asChild
                      >
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload from Gallery
                        </span>
                      </Button>
                    </label>
                    <input
                      id="upload-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageCapture}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded">
                  <h3 className="font-medium text-sm mb-2">📸 Tips for best results:</h3>
                  <ul className="text-xs text-muted-foreground space-y-1 text-left">
                    <li>• Ensure good lighting (natural daylight is best)</li>
                    <li>• Capture the affected area clearly</li>
                    <li>• Hold camera steady for sharp image</li>
                    <li>• Include the entire leaf/fruit if possible</li>
                  </ul>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="p-4 bg-card">
                  <img 
                    src={selectedImage} 
                    alt="Captured plant" 
                    className="w-full rounded-lg mb-4"
                  />
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-destructive to-destructive/80"
                      onClick={handleAnalyze}
                    >
                      Analyze Disease
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleRetake}
                    >
                      Retake Photo
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        );

      case "analyzing":
        return (
          <div className="px-6 py-6">
            <Card className="p-8 text-center bg-card">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-primary animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Analyzing Image</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Our AI is examining your plant for diseases...
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>🔍 Processing image quality</p>
                <p>🧠 Running disease detection model</p>
                <p>📊 Calculating confidence scores</p>
                <p>💡 Generating recommendations</p>
              </div>
            </Card>
          </div>
        );

      case "outbreak_prompt":
        return (
          <div className="px-6 py-6">
            <Card className="p-6 bg-card">
              <div className="text-center mb-6">
                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                <h2 className="text-xl font-semibold mb-2">Disease Detected</h2>
                <p className="text-sm text-muted-foreground">
                  {diseaseResult?.disease_name} identified with {((diseaseResult?.confidence || 0) * 100).toFixed(0)}% confidence
                </p>
              </div>

              <div className="mb-6 p-4 bg-muted/30 rounded">
                <p className="text-sm font-medium mb-2">Is this disease outbreak in your field?</p>
                <p className="text-xs text-muted-foreground">
                  If yes, we'll save this information to your field records for tracking and management.
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-destructive to-destructive/80"
                  onClick={() => handleOutbreakResponse(true)}
                >
                  Yes, It's a Field Outbreak
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleOutbreakResponse(false)}
                >
                  No, Just Checking
                </Button>
              </div>

              {userFields.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-3">Select Affected Field:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userFields.map((field) => (
                      <Button
                        key={field.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleFieldSelection(field.id, field.name)}
                      >
                        🌾 {field.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        );

      case "results":
        return (
          <div className="px-6 py-6">
            {diseaseResult && selectedImage && (
              <DiseaseResultCard
                result={diseaseResult}
                imageUrl={selectedImage}
                onRetake={handleRetake}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero pb-24">
      <header className="px-6 pt-8 pb-4 bg-gradient-to-r from-destructive to-destructive/80 text-white">
        <Button
          onClick={() => {
            if (analysisState === "results") {
              // From results, go back to capture state but keep the image
              setAnalysisState("capture");
              setDiseaseResult(null);
            } else if (analysisState === "outbreak_prompt") {
              // From outbreak prompt, go back to capture
              setAnalysisState("capture");
              setDiseaseResult(null);
            } else if (analysisState === "analyzing") {
              // During analysis, allow canceling back to capture
              setAnalysisState("capture");
            } else {
              // From capture state, navigate away from the page
              navigate(-1);
            }
          }}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {analysisState === "results" ? "Back to Image" : 
           analysisState === "outbreak_prompt" ? "Back" :
           analysisState === "analyzing" ? "Cancel" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold mb-1">{t('disease_detection_title')}</h1>
        <p className="text-sm opacity-90">
          {analysisState === "capture" && t('scan_crops_diseases')}
          {analysisState === "analyzing" && t('analyzing_plant_image')}
          {analysisState === "outbreak_prompt" && t('field_outbreak_confirmation')}
          {analysisState === "results" && t('disease_analysis_results')}
        </p>
      </header>

      {renderContent()}
    </div>
  );
};
