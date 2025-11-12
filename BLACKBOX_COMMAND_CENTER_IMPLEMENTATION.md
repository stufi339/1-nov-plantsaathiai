# 🚀 BlackBox Command Center - Implementation Guide

## **Quick Start: Build in 10 Weeks**

This guide provides step-by-step implementation for the BlackBox Command Center dashboard.

---

## **Week 1-2: Field Health Command Center**

### **Step 1: Create Intelligence Correlation Service**

Create `src/lib/intelligenceCorrelationService.ts`:

```typescript
import { supabaseFieldService } from './supabaseFieldService';
import { weatherService } from './weatherService';
import { mandiPriceService } from './mandiPriceService';
import { diseaseDetectionService } from './diseaseDetectionService';
import { blackBoxService } from './blackBoxService';

export interface FieldHealthAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  field: string;
  fieldId: string;
  issue: string;
  impact: string;
  action: string;
  confidence: number;
  timeWindow: string;
  financialImpact: number;
  createdAt: Date;
}

export class IntelligenceCorrelationService {
  async analyzeFieldHealth(fieldId: string): Promise<FieldHealthAlert[]> {
    const alerts: FieldHealthAlert[] = [];

    try {
      // Get all data sources
      const [field, latestData, weather, diseases] = await Promise.all([
        supabaseFieldService.getFields().then(fields => 
          fields.find(f => f.id === fieldId)
        ),
        supabaseFieldService.getLatestFieldData(fieldId),
        this.getFieldWeather(fieldId),
        diseaseDetectionService.getDiseaseOutbreaks(fieldId)
      ]);

      if (!field || !latestData) return alerts;

      // 1. NDVI Drop Alert
      if (latestData.ndvi < 0.6) {
        const ndviDrop = this.calculateNDVIDrop(fieldId, latestData.ndvi);
        if (ndviDrop > 10) {
          alerts.push({
            id: `ndvi_drop_${fieldId}`,
            severity: 'critical',
            field: field.name,
            fieldId,
            issue: `Plant health dropped ${ndviDrop}%`,
            impact: `Potential yield loss: ₹${this.calculateYieldLoss(field, ndviDrop)}`,
            action: 'Check for nitrogen deficiency. Apply NPK fertilizer today.',
            confidence: 0.85,
            timeWindow: 'Next 24 hours',
            financialImpact: this.calculateYieldLoss(field, ndviDrop),
            createdAt: new Date()
          });
        }
      }

      // 2. Disease Risk Alert (Correlation: High humidity + Warm temp + NDVI drop)
      if (weather && weather.humidity > 80 && weather.temp > 25 && latestData.ndvi < 0.65) {
        alerts.push({
          id: `disease_risk_${fieldId}`,
          severity: 'warning',
          field: field.name,
          fieldId,
          issue: 'High disease risk detected',
          impact: 'Humidity + temperature correlation indicates fungal disease risk',
          action: 'Spray Mancozeb (2g/L) preventively. Remove infected leaves.',
          confidence: 0.78,
          timeWindow: 'Next 48 hours',
          financialImpact: 1500,
          createdAt: new Date()
        });
      }

      // 3. Water Stress Alert
      if (latestData.ndwi < 0.3 && latestData.soil_moisture < 30) {
        alerts.push({
          id: `water_stress_${fieldId}`,
          severity: 'critical',
          field: field.name,
          fieldId,
          issue: 'Severe water stress detected',
          impact: `Crop stress can reduce yield by 20-30%`,
          action: 'Irrigate immediately. Water deeply for 2-3 hours.',
          confidence: 0.90,
          timeWindow: 'Urgent - Next 6 hours',
          financialImpact: 3000,
          createdAt: new Date()
        });
      }

      // 4. Disease Outbreak Alert
      if (diseases.length > 0) {
        const latestDisease = diseases[0];
        alerts.push({
          id: `disease_outbreak_${fieldId}`,
          severity: 'critical',
          field: field.name,
          fieldId,
          issue: `${latestDisease.disease_name} detected`,
          impact: `${latestDisease.confidence}% confidence. Can spread rapidly.`,
          action: `Apply recommended treatment immediately. Check nearby plants.`,
          confidence: latestDisease.confidence / 100,
          timeWindow: 'Urgent - Today',
          financialImpact: 2500,
          createdAt: new Date()
        });
      }

      // Log to BlackBox
      blackBoxService.logUserInteraction(
        'page_view',
        'field_health_analysis',
        fieldId,
        { alertCount: alerts.length }
      );

      return alerts.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2, success: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });

    } catch (error) {
      console.error('Failed to analyze field health:', error);
      blackBoxService.logError('api_failure', 'Field health analysis failed', fieldId);
      return [];
    }
  }

  private calculateNDVIDrop(fieldId: string, currentNDVI: number): number {
    // Get historical NDVI from BlackBox or cache
    const historicalNDVI = 0.75; // Placeholder - should fetch from history
    return Math.round(((historicalNDVI - currentNDVI) / historicalNDVI) * 100);
  }

  private calculateYieldLoss(field: any, ndviDrop: number): number {
    // Estimate yield loss based on NDVI drop
    const baseYield = 4000; // kg per hectare
    const pricePerKg = 25; // ₹25 per kg
    const area = field.area || 1; // hectares
    const yieldLossPercentage = ndviDrop * 1.5; // 1.5x multiplier
    return Math.round(baseYield * area * pricePerKg * (yieldLossPercentage / 100));
  }

  private async getFieldWeather(fieldId: string): Promise<any> {
    try {
      const fields = await supabaseFieldService.getFields();
      const field = fields.find(f => f.id === fieldId);
      if (field && field.location) {
        return await weatherService.getWeatherByCity(field.location);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export const intelligenceCorrelationService = new IntelligenceCorrelationService();
```



### **Step 2: Create Field Health Command Center Component**

Create `src/components/dashboard/FieldHealthCommandCenter.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, Droplets, Bug, Thermometer } from 'lucide-react';
import { intelligenceCorrelationService, FieldHealthAlert } from '@/lib/intelligenceCorrelationService';

interface FieldHealthCommandCenterProps {
  fields: any[];
}

export const FieldHealthCommandCenter = ({ fields }: FieldHealthCommandCenterProps) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<FieldHealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealthAlerts();
  }, [fields]);

  const loadHealthAlerts = async () => {
    try {
      setLoading(true);
      const allAlerts: FieldHealthAlert[] = [];

      for (const field of fields) {
        const fieldAlerts = await intelligenceCorrelationService.analyzeFieldHealth(field.id);
        allAlerts.push(...fieldAlerts);
      }

      setAlerts(allAlerts);
    } catch (error) {
      console.error('Failed to load health alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'warning': return Thermometer;
      case 'info': return Droplets;
      default: return Bug;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-orange-500 bg-orange-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-green-500 bg-green-50';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="p-6 text-center bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="text-4xl mb-3">✅</div>
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          {t('all_fields_healthy') || 'All Fields Healthy!'}
        </h3>
        <p className="text-sm text-green-700">
          {t('no_critical_issues') || 'No critical issues detected. Keep monitoring regularly.'}
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          {t('field_health_alerts') || 'Field Health Alerts'}
        </h2>
        <Badge variant="destructive">{alerts.length}</Badge>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert) => {
          const Icon = getAlertIcon(alert.severity);
          return (
            <Alert key={alert.id} className={`${getAlertColor(alert.severity)} border-l-4`}>
              <Icon className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{alert.field}</p>
                    <p className="text-xs text-muted-foreground">{alert.timeWindow}</p>
                  </div>
                  <Badge className="text-xs">
                    {Math.round(alert.confidence * 100)}% confidence
                  </Badge>
                </div>
                <p className="text-sm font-medium mb-1">🚨 {alert.issue}</p>
                <p className="text-xs text-muted-foreground mb-2">💰 {alert.impact}</p>
                <p className="text-xs bg-white/50 p-2 rounded border border-gray-200">
                  ✅ <strong>Action:</strong> {alert.action}
                </p>
              </AlertDescription>
            </Alert>
          );
        })}
      </div>

      {alerts.length > 5 && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          +{alerts.length - 5} {t('more_alerts') || 'more alerts'}
        </p>
      )}
    </Card>
  );
};
```

