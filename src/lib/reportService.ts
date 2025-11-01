import jsPDF from 'jspdf';
import { DiseaseResult } from '@/components/disease/DiseaseResultCard';
import { YieldPredictionResponse } from '@/lib/yieldPredictionService';

export class ReportService {
  static generateDiseaseReportPDF(result: DiseaseResult, imageUrl?: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Plant Disease Analysis Report', margin, yPosition);
    yPosition += 15;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Model Version: ${result.model_version}`, margin, yPosition);
    yPosition += 15;

    // Disease Information
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Disease Information', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Disease Name: ${result.disease_name}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Confidence: ${Math.round(result.confidence * 100)}%`, margin, yPosition);
    yPosition += 8;
    doc.text(`Disease Stage: ${result.disease_stage}`, margin, yPosition);
    yPosition += 15;

    // Impact Assessment
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Impact Assessment', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Yield Impact: ${result.yield_impact}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Spread Risk: ${result.spread_risk}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Recovery Chance: ${result.recovery_chance}`, margin, yPosition);
    yPosition += 15;

    // Symptoms
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Visible Symptoms', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    result.symptoms.forEach((symptom, index) => {
      yPosition = addWrappedText(`${index + 1}. ${symptom}`, margin, yPosition, contentWidth);
      yPosition += 3;
    });
    yPosition += 10;

    // Action Plan
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Immediate Action Plan', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    result.action_plan.forEach((action, index) => {
      yPosition = addWrappedText(`${index + 1}. ${action}`, margin, yPosition, contentWidth);
      yPosition += 3;
    });

    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage();
      yPosition = margin;
    } else {
      yPosition += 15;
    }

    // Treatment Recommendations
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Treatment Recommendations', margin, yPosition);
    yPosition += 10;

    const treatmentCategories = [
      { key: 'organic', title: 'Organic Treatments' },
      { key: 'chemical', title: 'Chemical Treatments' },
      { key: 'ipm', title: 'Integrated Pest Management' },
      { key: 'cultural', title: 'Cultural Practices' }
    ];

    treatmentCategories.forEach(category => {
      const treatments = result.treatments[category.key as keyof typeof result.treatments];
      if (treatments && treatments.length > 0) {
        // Check if we need a new page
        if (yPosition > 220) {
          doc.addPage();
          yPosition = margin;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(category.title, margin, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        treatments.forEach((treatment, index) => {
          yPosition = addWrappedText(`• ${treatment}`, margin, yPosition, contentWidth, 9);
          yPosition += 2;
        });
        yPosition += 8;
      }
    });

    // Prevention Tips
    if (result.tips && result.tips.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Prevention Tips', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      result.tips.forEach((tip, index) => {
        yPosition = addWrappedText(`${index + 1}. ${tip}`, margin, yPosition, contentWidth, 9);
        yPosition += 3;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Plant Saathi AI - Disease Analysis Report | Page ${i} of ${pageCount}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Generate filename and download
    const filename = `disease-report-${result.disease_name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  static formatWhatsAppMessage(result: DiseaseResult): string {
    const shareText = `🔬 *Plant Disease Analysis Report*\n\n` +
      `🦠 *Disease:* ${result.disease_name}\n` +
      `📊 *Confidence:* ${Math.round(result.confidence * 100)}%\n` +
      `📈 *Stage:* ${result.disease_stage}\n\n` +
      `⚠️ *Impact Assessment:*\n` +
      `• Yield Impact: ${result.yield_impact}\n` +
      `• Spread Risk: ${result.spread_risk}\n` +
      `• Recovery Chance: ${result.recovery_chance}\n\n` +
      `🔍 *Key Symptoms:*\n${result.symptoms.slice(0, 3).map((symptom, i) => `${i + 1}. ${symptom}`).join('\n')}\n\n` +
      `⚡ *Immediate Actions:*\n${result.action_plan.slice(0, 3).map((action, i) => `${i + 1}. ${action}`).join('\n')}\n\n` +
      `💊 *Treatment Categories Available:*\n` +
      `• Organic methods (${result.treatments.organic?.length || 0} options)\n` +
      `• Chemical treatments (${result.treatments.chemical?.length || 0} options)\n` +
      `• IPM strategies (${result.treatments.ipm?.length || 0} options)\n` +
      `• Cultural practices (${result.treatments.cultural?.length || 0} options)\n\n` +
      `🤖 *Analysis Details:*\n` +
      `• Model: ${result.model_version}\n` +
      `• Date: ${new Date().toLocaleDateString()}\n` +
      `• Time: ${new Date().toLocaleTimeString()}\n\n` +
      `📱 _Get Plant Saathi AI for comprehensive crop health monitoring and expert agricultural guidance_`;

    return shareText;
  }

  static shareViaWhatsApp(message: string): void {
    if (navigator.share) {
      navigator.share({
        title: 'Plant Disease Analysis Report',
        text: message,
      }).catch(console.error);
    } else {
      // Fallback to WhatsApp Web
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  }

  static generateYieldPredictionReportPDF(prediction: YieldPredictionResponse, fieldId: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y);
      return y + (lines.length * fontSize * 0.4);
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Yield Prediction Report', margin, yPosition);
    yPosition += 15;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Field ID: ${fieldId}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Prediction Date: ${new Date(prediction.prediction_timestamp).toLocaleString()}`, margin, yPosition);
    yPosition += 15;

    // Main Prediction Results
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Prediction Results', margin, yPosition);
    yPosition += 10;

    // Prediction box
    doc.setDrawColor(34, 197, 94); // Green color
    doc.setLineWidth(1);
    doc.rect(margin, yPosition, contentWidth, 30);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Predicted Yield:', margin + 5, yPosition + 10);
    
    doc.setFontSize(18);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text(`${prediction.predicted_yield} tons/hectare`, margin + 5, yPosition + 20);
    
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFontSize(10);
    doc.text(`Confidence: ${Math.round(prediction.confidence * 100)}%`, margin + 5, yPosition + 27);
    
    yPosition += 40;

    // Yield Range
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Yield Range:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Lower Bound: ${prediction.prediction_range.lower_bound} t/ha`, margin, yPosition);
    yPosition += 6;
    doc.text(`Predicted: ${prediction.predicted_yield} t/ha`, margin, yPosition);
    yPosition += 6;
    doc.text(`Upper Bound: ${prediction.prediction_range.upper_bound} t/ha`, margin, yPosition);
    yPosition += 15;

    // Quality Indicators
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Quality Indicators:', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Prediction Confidence: ${Math.round(prediction.confidence * 100)}%`, margin, yPosition);
    yPosition += 6;
    doc.text(`Data Quality: ${Math.round(prediction.data_quality * 100)}%`, margin, yPosition);
    yPosition += 15;

    // Variety Information
    if (prediction.variety_info) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Crop Variety Information', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Variety Name: ${prediction.variety_info.variety_name}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Maturity Days: ${prediction.variety_info.maturity_days} days`, margin, yPosition);
      yPosition += 6;
      doc.text(`Yield Potential: ${prediction.variety_info.yield_potential} t/ha`, margin, yPosition);
      yPosition += 6;
      doc.text(`Drought Tolerance: ${prediction.variety_info.drought_tolerance}`, margin, yPosition);
      yPosition += 15;
    }

    // Environmental Factors
    if (prediction.environmental_factors) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Environmental Impact Factors', margin, yPosition);
      yPosition += 10;

      const formatAdjustment = (factor: number) => {
        const percentage = Math.round((factor - 1) * 100);
        if (percentage > 0) return `+${percentage}%`;
        if (percentage < 0) return `${percentage}%`;
        return "No impact";
      };

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Temperature Impact: ${formatAdjustment(prediction.environmental_factors.temperature_adjustment)}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Rainfall Impact: ${formatAdjustment(prediction.environmental_factors.rainfall_adjustment)}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Soil Moisture Impact: ${formatAdjustment(prediction.environmental_factors.soil_moisture_adjustment)}`, margin, yPosition);
      yPosition += 6;
      doc.text(`Pest Pressure Impact: ${formatAdjustment(prediction.environmental_factors.pest_pressure_adjustment)}`, margin, yPosition);
      yPosition += 15;

      // Environmental factors explanation
      yPosition = addWrappedText(
        'Environmental Impact Explanation: These factors show how current environmental conditions are affecting your predicted yield compared to optimal conditions. Positive adjustments indicate favorable conditions, while negative adjustments suggest challenges that may reduce yield.',
        margin,
        yPosition,
        contentWidth,
        9
      );
      yPosition += 10;
    }

    // Recommendations section
    if (yPosition > 220) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommendations', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Generate recommendations based on prediction data
    const recommendations = [];
    
    if (prediction.confidence < 0.7) {
      recommendations.push('Consider collecting more field data to improve prediction accuracy.');
    }
    
    if (prediction.data_quality < 0.8) {
      recommendations.push('Improve data quality by ensuring accurate field measurements and regular monitoring.');
    }

    if (prediction.environmental_factors) {
      if (prediction.environmental_factors.rainfall_adjustment < 0.9) {
        recommendations.push('Monitor irrigation needs due to below-optimal rainfall conditions.');
      }
      if (prediction.environmental_factors.pest_pressure_adjustment < 0.95) {
        recommendations.push('Implement pest management strategies to minimize yield loss.');
      }
      if (prediction.environmental_factors.soil_moisture_adjustment < 0.9) {
        recommendations.push('Consider soil moisture management techniques to optimize growing conditions.');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Current conditions are favorable for achieving the predicted yield.');
      recommendations.push('Continue with current farming practices and monitor field regularly.');
    }

    recommendations.forEach((recommendation, index) => {
      yPosition = addWrappedText(`${index + 1}. ${recommendation}`, margin, yPosition, contentWidth, 10);
      yPosition += 5;
    });

    // Disclaimer
    yPosition += 10;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    yPosition = addWrappedText(
      'Disclaimer: This yield prediction is based on satellite data, weather patterns, and machine learning models. Actual yields may vary due to unforeseen circumstances, farming practices, and local conditions. Use this prediction as a guide for planning purposes.',
      margin,
      yPosition,
      contentWidth,
      8
    );

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Plant Saathi AI - Yield Prediction Report | Page ${i} of ${pageCount}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    // Generate filename and download
    const filename = `yield-prediction-${fieldId}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  }

  static formatYieldPredictionShareMessage(prediction: YieldPredictionResponse, fieldId: string): string {
    let shareText = `🌾 *Yield Prediction Report*\n\n` +
      `📊 *Predicted Yield:* ${prediction.predicted_yield} tons/hectare\n` +
      `🎯 *Confidence:* ${Math.round(prediction.confidence * 100)}%\n` +
      `📈 *Yield Range:* ${prediction.prediction_range.lower_bound} - ${prediction.prediction_range.upper_bound} t/ha\n\n` +
      `📋 *Field Details:*\n` +
      `• Field ID: ${fieldId}\n` +
      `• Data Quality: ${Math.round(prediction.data_quality * 100)}%\n` +
      `• Prediction Date: ${new Date(prediction.prediction_timestamp).toLocaleDateString()}\n\n`;

    if (prediction.variety_info) {
      shareText += `🌱 *Crop Variety:*\n` +
        `• Variety: ${prediction.variety_info.variety_name}\n` +
        `• Maturity: ${prediction.variety_info.maturity_days} days\n` +
        `• Potential: ${prediction.variety_info.yield_potential} t/ha\n` +
        `• Drought Tolerance: ${prediction.variety_info.drought_tolerance}\n\n`;
    }

    if (prediction.environmental_factors) {
      const formatAdjustment = (factor: number) => {
        const percentage = Math.round((factor - 1) * 100);
        if (percentage > 0) return `+${percentage}%`;
        if (percentage < 0) return `${percentage}%`;
        return "No impact";
      };

      shareText += `🌤️ *Environmental Impact:*\n` +
        `• Temperature: ${formatAdjustment(prediction.environmental_factors.temperature_adjustment)}\n` +
        `• Rainfall: ${formatAdjustment(prediction.environmental_factors.rainfall_adjustment)}\n` +
        `• Soil Moisture: ${formatAdjustment(prediction.environmental_factors.soil_moisture_adjustment)}\n` +
        `• Pest Pressure: ${formatAdjustment(prediction.environmental_factors.pest_pressure_adjustment)}\n\n`;
    }

    shareText += `🤖 *Generated by Plant Saathi AI*\n` +
      `📱 _Get comprehensive crop monitoring and yield predictions for better harvest planning_`;

    return shareText;
  }

  static copyToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
    } else {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.resolve(false);
      }
    }
  }
}