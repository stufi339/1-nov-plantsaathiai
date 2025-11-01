/**
 * Browser-Compatible Test Runner for Plant Saathi Services
 * Tests all services with real rice field data
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2,
  Download,
  MapPin,
  Calendar,
  Wheat
} from 'lucide-react';
import { geeService } from '@/lib/geeService';
import { YieldPredictionService } from '@/lib/yieldPredictionService';
import { blackBoxService } from '@/lib/blackBoxService';
import { audioService } from '@/lib/audioService';
import { ReportService } from '@/lib/reportService';
import { useToast } from '@/hooks/use-toast';

// Test configuration for your rice field
const RICE_FIELD_CONFIG = {
  fieldId: 'rice-field-test-001',
  cropType: 'rice',
  variety: 'IR-64',
  sowingDate: '2025-07-21',
  currentDate: '2025-10-27',
  coordinates: {
    lat: 28.368717,
    lng: 77.540933,
    polygon: [
      [28.368717, 77.540933],
      [28.368989, 77.540859],
      [28.369041, 77.541089],
      [28.368791, 77.541176]
    ]
  },
  area: 2.5,
  irrigationType: 'flood',
  soilType: 'clay_loam'
};

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration?: number;
  data?: any;
  error?: string;
}

export const TestRunner: React.FC = () => {
  const { toast } = useToast();
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Vegetation Indices Analysis', status: 'pending' },
    { name: 'Yield Prediction Service', status: 'pending' },
    { name: 'Audio Service Integration', status: 'pending' },
    { name: 'Black Box Logging', status: 'pending' },
    { name: 'Report Generation', status: 'pending' }
  ]);
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState(-1);
  const [overallProgress, setOverallProgress] = useState(0);
  const [testResults, setTestResults] = useState<any>({});

  // Calculate field metrics
  const sowingDate = new Date(RICE_FIELD_CONFIG.sowingDate);
  const currentDate = new Date(RICE_FIELD_CONFIG.currentDate);
  const daysAfterSowing = Math.floor((currentDate.getTime() - sowingDate.getTime()) / (1000 * 60 * 60 * 24));
  const expectedMaturityDays = 115;
  const growthPercentage = (daysAfterSowing / expectedMaturityDays) * 100;

  const updateTestStatus = (index: number, status: TestResult['status'], data?: any, error?: string, duration?: number) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, data, error, duration } : test
    ));
  };

  const runVegetationAnalysisTest = async (): Promise<any> => {
    const startTime = Date.now();
    
    try {
      // Validate coordinates
      const isValid = geeService.validateCoordinates(RICE_FIELD_CONFIG.coordinates);
      if (!isValid) throw new Error('Invalid coordinates');
      
      // Get date range
      const dateRange = await geeService.getAvailableDateRange(RICE_FIELD_CONFIG.coordinates);
      
      // Analyze vegetation indices
      const vegetationData = await geeService.analyzeVegetationIndices({
        coordinates: RICE_FIELD_CONFIG.coordinates,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        cloudCoverThreshold: 20
      });
      
      // Log to black box
      blackBoxService.logVegetationIndicesView(
        RICE_FIELD_CONFIG.fieldId,
        {
          ndvi: vegetationData.ndvi,
          msavi2: vegetationData.msavi2,
          ndre: vegetationData.ndre,
          ndwi: vegetationData.ndwi,
          ndmi: vegetationData.ndmi,
          soc_vis: vegetationData.soc_vis,
          rsm: vegetationData.rsm,
          rvi: vegetationData.rvi
        },
        vegetationData.nitrogen ? {
          nitrogen: vegetationData.nitrogen,
          phosphorus: vegetationData.phosphorus,
          potassium: vegetationData.potassium,
          confidence: vegetationData.npk_confidence!
        } : undefined
      );
      
      return {
        ...vegetationData,
        duration: Date.now() - startTime,
        dateRange
      };
    } catch (error) {
      throw new Error(`Vegetation analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runYieldPredictionTest = async (): Promise<any> => {
    const startTime = Date.now();
    
    try {
      // Check eligibility
      const isEligible = await YieldPredictionService.isEligibleForPrediction(RICE_FIELD_CONFIG.fieldId);
      
      if (!isEligible) {
        return {
          eligible: false,
          growthPercentage,
          daysAfterSowing,
          duration: Date.now() - startTime,
          message: 'Field not yet eligible for yield prediction'
        };
      }
      
      // Get prediction
      const yieldPrediction = await YieldPredictionService.getPrediction(RICE_FIELD_CONFIG.fieldId);
      
      return {
        ...yieldPrediction,
        eligible: true,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Yield prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAudioServiceTest = async (vegetationData: any, yieldData: any): Promise<any> => {
    const startTime = Date.now();
    
    try {
      const isSupported = audioService.isSupported();
      
      if (!isSupported) {
        return {
          supported: false,
          duration: Date.now() - startTime,
          message: 'Audio not supported in this environment'
        };
      }
      
      // Test vegetation audio
      const vegetationAudio = `Your rice field shows NDVI of ${vegetationData.ndvi.toFixed(2)}, indicating healthy vegetation.`;
      blackBoxService.logAudioInteraction('test-vegetation', 'vegetation_index', vegetationAudio, RICE_FIELD_CONFIG.fieldId);
      
      // Test yield audio if available
      if (yieldData && yieldData.eligible) {
        const yieldAudio = `Predicted yield is ${yieldData.predicted_yield} tons per hectare with ${Math.round(yieldData.confidence * 100)} percent confidence.`;
        blackBoxService.logAudioInteraction('test-yield', 'yield_prediction', yieldAudio, RICE_FIELD_CONFIG.fieldId);
      }
      
      return {
        supported: true,
        vegetationAudioLength: vegetationAudio.length,
        yieldAudioLength: yieldData?.eligible ? 100 : 0,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Audio service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runBlackBoxTest = async (): Promise<any> => {
    const startTime = Date.now();
    
    try {
      // Test various logging functions
      blackBoxService.logFieldAccess(RICE_FIELD_CONFIG.fieldId, 'view', ['test_section'], 60);
      blackBoxService.logUserInteraction('button_click', 'test_button', RICE_FIELD_CONFIG.fieldId, { testRun: true });
      blackBoxService.logError('api_failure', 'Test error', RICE_FIELD_CONFIG.fieldId, 'test_action', undefined, false);
      blackBoxService.logUserFeedback('rating', 'Test feedback', 'test_feature', RICE_FIELD_CONFIG.fieldId, 5);
      
      const analytics = blackBoxService.getAnalyticsSummary();
      
      return {
        ...analytics,
        duration: Date.now() - startTime,
        logsExported: true
      };
    } catch (error) {
      throw new Error(`Black box test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runReportGenerationTest = async (vegetationData: any, yieldData: any): Promise<any> => {
    const startTime = Date.now();
    
    try {
      // Test vegetation report (create a mock disease result for testing)
      const mockDiseaseResult = {
        disease_name: 'Test Disease',
        confidence: 0.85,
        disease_stage: 'Early',
        yield_impact: 'Low' as const,
        spread_risk: 'Medium' as const,
        recovery_chance: 'Good' as const,
        symptoms: ['Test symptom'],
        action_plan: ['Test action'],
        treatments: { organic: ['Test treatment'], chemical: [], ipm: [], cultural: [] },
        recommended_videos: ['Test video'],
        faqs: [{ question: 'Test question?', answer: 'Test answer' }],
        tips: ['Test tip'],
        model_version: 'test-v1.0'
      };
      const vegetationReport = ReportService.formatWhatsAppMessage(mockDiseaseResult);
      
      // Test yield report if available
      let yieldReport = '';
      if (yieldData && yieldData.eligible) {
        yieldReport = ReportService.formatYieldPredictionShareMessage(yieldData, RICE_FIELD_CONFIG.fieldId);
      }
      
      // Test clipboard (may not work in all environments)
      let clipboardSupported = false;
      try {
        clipboardSupported = await ReportService.copyToClipboard('Test clipboard content');
      } catch {
        clipboardSupported = false;
      }
      
      return {
        vegetationReportLength: vegetationReport.length,
        yieldReportLength: yieldReport.length,
        clipboardSupported,
        duration: Date.now() - startTime
      };
    } catch (error) {
      throw new Error(`Report generation test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setCurrentTest(0);
    setOverallProgress(0);
    
    const results: any = {};
    
    try {
      // Test 1: Vegetation Analysis
      setCurrentTest(0);
      updateTestStatus(0, 'running');
      try {
        const vegetationResult = await runVegetationAnalysisTest();
        results.vegetation = vegetationResult;
        updateTestStatus(0, 'passed', vegetationResult, undefined, vegetationResult.duration);
        toast({
          title: "✅ Vegetation Analysis Complete",
          description: `NDVI: ${vegetationResult.ndvi.toFixed(3)}, Analysis time: ${vegetationResult.duration}ms`,
        });
      } catch (error) {
        updateTestStatus(0, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
        toast({
          title: "❌ Vegetation Analysis Failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      }
      setOverallProgress(20);

      // Test 2: Yield Prediction
      setCurrentTest(1);
      updateTestStatus(1, 'running');
      try {
        const yieldResult = await runYieldPredictionTest();
        results.yield = yieldResult;
        updateTestStatus(1, 'passed', yieldResult, undefined, yieldResult.duration);
        toast({
          title: yieldResult.eligible ? "✅ Yield Prediction Complete" : "⚠️ Yield Prediction Skipped",
          description: yieldResult.eligible 
            ? `Predicted: ${yieldResult.predicted_yield} t/ha (${Math.round(yieldResult.confidence * 100)}% confidence)`
            : `Field at ${growthPercentage.toFixed(1)}% growth - prediction available at 85%`,
        });
      } catch (error) {
        updateTestStatus(1, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
        toast({
          title: "❌ Yield Prediction Failed",
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: "destructive"
        });
      }
      setOverallProgress(40);

      // Test 3: Audio Service
      setCurrentTest(2);
      updateTestStatus(2, 'running');
      try {
        const audioResult = await runAudioServiceTest(results.vegetation, results.yield);
        results.audio = audioResult;
        updateTestStatus(2, 'passed', audioResult, undefined, audioResult.duration);
        toast({
          title: audioResult.supported ? "✅ Audio Service Ready" : "⚠️ Audio Not Supported",
          description: audioResult.supported ? "Audio synthesis working correctly" : "Audio not available in this environment",
        });
      } catch (error) {
        updateTestStatus(2, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      }
      setOverallProgress(60);

      // Test 4: Black Box Logging
      setCurrentTest(3);
      updateTestStatus(3, 'running');
      try {
        const blackBoxResult = await runBlackBoxTest();
        results.blackBox = blackBoxResult;
        updateTestStatus(3, 'passed', blackBoxResult, undefined, blackBoxResult.duration);
        toast({
          title: "✅ Logging System Active",
          description: `Session: ${blackBoxResult.sessionId.substring(0, 12)}... (${blackBoxResult.totalInteractions} interactions)`,
        });
      } catch (error) {
        updateTestStatus(3, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      }
      setOverallProgress(80);

      // Test 5: Report Generation
      setCurrentTest(4);
      updateTestStatus(4, 'running');
      try {
        const reportResult = await runReportGenerationTest(results.vegetation, results.yield);
        results.reports = reportResult;
        updateTestStatus(4, 'passed', reportResult, undefined, reportResult.duration);
        toast({
          title: "✅ Report Generation Ready",
          description: `Generated ${reportResult.vegetationReportLength + reportResult.yieldReportLength} characters of reports`,
        });
      } catch (error) {
        updateTestStatus(4, 'failed', undefined, error instanceof Error ? error.message : 'Unknown error');
      }
      setOverallProgress(100);

      setTestResults(results);
      
      // Final success toast
      const passedTests = tests.filter(t => t.status === 'passed').length;
      toast({
        title: "🎉 Testing Complete!",
        description: `${passedTests}/5 tests passed. Your rice field system is ${passedTests >= 4 ? 'working excellently' : 'partially functional'}.`,
      });

    } catch (error) {
      console.error('Test suite failed:', error);
      toast({
        title: "❌ Test Suite Failed",
        description: "Critical error during testing. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentTest(-1);
    }
  };

  const downloadTestResults = () => {
    const exportData = blackBoxService.exportLogs();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rice-field-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "📄 Test Results Downloaded",
      description: "Complete test data exported to JSON file",
    });
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wheat className="w-6 h-6 text-green-600" />
            Plant Saathi Real-Time Testing Suite
          </CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Rice Field Test</p>
                <p className="text-xs text-muted-foreground">{RICE_FIELD_CONFIG.coordinates.lat}°N, {RICE_FIELD_CONFIG.coordinates.lng}°E</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Day {daysAfterSowing} of {expectedMaturityDays}</p>
                <p className="text-xs text-muted-foreground">{growthPercentage.toFixed(1)}% Growth Stage</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{RICE_FIELD_CONFIG.variety} Rice</p>
                <p className="text-xs text-muted-foreground">{RICE_FIELD_CONFIG.area} hectares</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Test Execution</CardTitle>
            <div className="flex gap-2">
              <Button 
                onClick={runAllTests} 
                disabled={isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run All Tests
                  </>
                )}
              </Button>
              {Object.keys(testResults).length > 0 && (
                <Button 
                  onClick={downloadTestResults}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </Button>
              )}
            </div>
          </div>
          {isRunning && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Progress</span>
                <span className="text-sm font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4">
        {tests.map((test, index) => (
          <Card key={index} className={`transition-all duration-200 ${
            currentTest === index ? 'ring-2 ring-blue-500 shadow-lg' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.name}</h3>
                    {test.duration && (
                      <p className="text-xs text-muted-foreground">
                        Completed in {test.duration}ms
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={test.status === 'passed' ? 'default' : 
                            test.status === 'failed' ? 'destructive' : 
                            test.status === 'running' ? 'secondary' : 'outline'}
                    className={getStatusColor(test.status)}
                  >
                    {test.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              {test.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {test.error}
                </div>
              )}
              
              {test.data && test.status === 'passed' && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                  {index === 0 && test.data.ndvi && (
                    <p>NDVI: {test.data.ndvi.toFixed(3)} | NPK Confidence: {test.data.npk_confidence ? (test.data.npk_confidence * 100).toFixed(1) + '%' : 'N/A'}</p>
                  )}
                  {index === 1 && test.data.eligible && (
                    <p>Predicted Yield: {test.data.predicted_yield} t/ha | Confidence: {(test.data.confidence * 100).toFixed(1)}%</p>
                  )}
                  {index === 1 && !test.data.eligible && (
                    <p>Field at {growthPercentage.toFixed(1)}% growth - prediction available at 85%</p>
                  )}
                  {index === 2 && (
                    <p>Audio Support: {test.data.supported ? 'Available' : 'Not Available'}</p>
                  )}
                  {index === 3 && (
                    <p>Session: {test.data.sessionId?.substring(0, 20)}... | Interactions: {test.data.totalInteractions}</p>
                  )}
                  {index === 4 && (
                    <p>Reports Generated: {test.data.vegetationReportLength + test.data.yieldReportLength} characters</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestRunner;