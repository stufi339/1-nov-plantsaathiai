import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Droplets,
  Calendar,
  Clock,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  Bell,
  Loader2,
  Sprout,
} from 'lucide-react';
import {
  jalSaathiService,
  IrrigationRecommendation,
  CropStage,
  SoilType,
} from '@/lib/jalSaathiService';
import { blackBoxService } from '@/lib/blackBoxService';

interface JalSaathiViewProps {
  fieldId?: string;
  cropType?: string;
  sowingDate?: Date;
  location?: { lat: number; lon: number } | string;
}

export const JalSaathiView = ({
  fieldId,
  cropType = 'Rice',
  sowingDate,
  location = 'New Delhi',
}: JalSaathiViewProps) => {
  const [recommendation, setRecommendation] = useState<IrrigationRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropStage, setCropStage] = useState<CropStage | null>(null);

  useEffect(() => {
    // Log Jal Saathi view access
    blackBoxService.logUserInteraction('page_view', 'jal_saathi_view', fieldId, {
      cropType,
      hasFieldId: !!fieldId,
      timestamp: new Date().toISOString(),
    });

    if (fieldId && sowingDate) {
      generateSchedule();
    }
  }, [fieldId, sowingDate]);

  const generateSchedule = async () => {
    if (!sowingDate) {
      setError('Sowing date is required to generate irrigation schedule. Please set sowing date in field details.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get field data from BlackBox/localStorage
      let soilData = null;
      if (fieldId) {
        try {
          const fieldDataStr = localStorage.getItem(`field_${fieldId}_data`);
          if (fieldDataStr) {
            const fieldData = JSON.parse(fieldDataStr);
            soilData = fieldData.comprehensiveAnalysis?.soilProperties || fieldData.soilProperties;
          }
        } catch (e) {
          console.warn('Could not load field soil data:', e);
        }
      }

      // Determine crop stage
      const stage = jalSaathiService.getCropStage(sowingDate, cropType);
      setCropStage(stage);

      // Determine soil type from BlackBox field data
      const soilType: SoilType = jalSaathiService.determineSoilType(soilData);

      // Generate irrigation schedule
      const schedule = await jalSaathiService.generateIrrigationSchedule(
        fieldId || 'demo',
        cropType,
        stage,
        soilType,
        location
      );

      setRecommendation(schedule);

      // Log schedule generation with comprehensive data
      blackBoxService.logUserInteraction('button_click', 'generate_irrigation_schedule', fieldId, {
        cropType,
        cropStage: stage.stage,
        soilType: soilType.type,
        scheduleDays: schedule.schedule.length,
        waterSavings: schedule.weeklyWaterSavings,
        costSavings: schedule.costSavings,
        hasSoilData: !!soilData,
        location: typeof location === 'string' ? location : `${location.lat},${location.lon}`,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to generate irrigation schedule:', err);
      setError('Failed to generate irrigation schedule. Please try again.');

      blackBoxService.logError(
        'api_failure',
        err instanceof Error ? err.message : 'Failed to generate irrigation schedule',
        fieldId,
        'generate_irrigation_schedule',
        err instanceof Error ? err.stack : undefined,
        false
      );
    } finally {
      setLoading(false);
    }
  };
 
 const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Generating your irrigation schedule...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing weather, crop stage, and soil type</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">💧 Jal Saathi</h2>
              <p className="text-blue-100 text-sm">Smart Water Scheduler for Your Farm</p>
            </div>
            <Droplets className="h-12 w-12 text-blue-200" />
          </div>

          {cropStage && (
            <div className="flex items-center gap-4 pt-4 border-t border-blue-400/30">
              <div className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Crop Stage</p>
                  <p className="font-semibold capitalize">{cropStage.stage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Water Need</p>
                  <p className="font-semibold capitalize">{cropStage.waterRequirement.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-100" />
                <div>
                  <p className="text-xs text-blue-100">Days in Stage</p>
                  <p className="font-semibold">{cropStage.daysInStage} days</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={generateSchedule} className="mt-3" size="sm">
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!recommendation && !error && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Droplets className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Generate Your Irrigation Schedule</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get a personalized 7-day irrigation plan based on weather, crop stage, and soil type
            </p>
            <Button onClick={generateSchedule} size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Generate Schedule
            </Button>
          </CardContent>
        </Card>
      )}

      {recommendation && (
        <>
          {/* Savings Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500 rounded-full">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-100">
                    Save Water & Money
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Compared to traditional irrigation
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Water Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    {recommendation.weeklyWaterSavings}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">per week</p>
                </div>
                <div className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Cost Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{recommendation.costSavings}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">diesel/electricity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          {recommendation.alerts.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-amber-600">
                  <Bell className="h-5 w-5" />
                  Important Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendation.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg"
                  >
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{alert}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 7-Day Irrigation Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                7-Day Irrigation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendation.schedule.map((schedule, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    schedule.isSkipped
                      ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          schedule.isSkipped ? 'bg-gray-200 dark:bg-gray-800' : 'bg-blue-500'
                        }`}
                      >
                        {schedule.isSkipped ? (
                          <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                          <Droplets className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{getDayName(schedule.date)}</p>
                        <p className="text-xs text-muted-foreground">{schedule.date}</p>
                      </div>
                    </div>
                    <Badge
                      variant={schedule.isSkipped ? 'secondary' : 'default'}
                      className={schedule.isSkipped ? '' : 'bg-blue-500'}
                    >
                      {schedule.confidence}% confidence
                    </Badge>
                  </div>

                  {schedule.isSkipped ? (
                    <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-950 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground">{schedule.skipReason}</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-950 rounded">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-sm font-semibold">{schedule.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-950 rounded">
                          <Droplets className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-semibold">{schedule.duration}h</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-950 rounded">
                          <TrendingDown className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Water</p>
                            <p className="text-sm font-semibold">
                              {Math.round(schedule.duration * schedule.waterAmount)}L
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 p-3 bg-white dark:bg-gray-950 rounded-lg">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{schedule.reason}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-600">
                <Lightbulb className="h-5 w-5" />
                Irrigation Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recommendation.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* WhatsApp Reminder Info */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-emerald-500 rounded-full">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2">
                    📱 WhatsApp Reminders (Coming Soon!)
                  </h3>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                    Get irrigation reminders directly on WhatsApp:
                  </p>
                  <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
                    <li>• "Tomorrow 4 PM: 1.5 hours of irrigation needed"</li>
                    <li>• "Heavy rain predicted - skip irrigation, save water!"</li>
                    <li>• Voice reminders in your local language</li>
                  </ul>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-3">
                    💡 For now, set phone reminders based on this schedule
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <Button onClick={generateSchedule} variant="outline" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Refresh Schedule
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
