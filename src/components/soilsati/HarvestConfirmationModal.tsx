import React, { useState, useEffect } from 'react';
import { X, TrendingDown, Calendar, Leaf, AlertTriangle } from 'lucide-react';
import { HarvestCandidate } from '../../lib/fieldLifecycleService';

interface HarvestConfirmationModalProps {
  candidate: HarvestCandidate;
  fieldDataHistory: any[];
  onConfirm: (metadata?: any) => void;
  onReject: () => void;
  onClose: () => void;
}

export const HarvestConfirmationModal: React.FC<HarvestConfirmationModalProps> = ({
  candidate,
  fieldDataHistory,
  onConfirm,
  onReject,
  onClose
}) => {
  const [notes, setNotes] = useState('');
  const [yieldEstimate, setYieldEstimate] = useState('');

  // Prepare chart data (last 30 days)
  const chartData = fieldDataHistory.slice(0, 30).reverse();

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const handleConfirm = () => {
    onConfirm({
      peakNDVI: candidate.peakNDVI,
      peakNDRE: candidate.peakNDRE,
      notes,
      previousCropYield: yieldEstimate ? parseFloat(yieldEstimate) : undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Harvest Detected</h2>
            <p className="text-sm text-gray-600 mt-1">{candidate.fieldName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Confidence Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getConfidenceColor(candidate.confidence)}`}>
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium capitalize">{candidate.confidence} Confidence</span>
          </div>

          {/* Detection Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">NDVI Drop</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {candidate.ndviDropPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {candidate.currentNDVI.toFixed(3)} (Peak: {candidate.peakNDVI.toFixed(3)})
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">NDRE Drop</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {candidate.ndreDropPercent.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {candidate.currentNDRE.toFixed(3)} (Peak: {candidate.peakNDRE.toFixed(3)})
              </div>
            </div>
          </div>

          {/* Vegetation Trend Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">30-Day Vegetation Trend</h3>
            <div className="h-32 flex items-end gap-1">
              {chartData.map((data, index) => {
                const ndvi = data.ndvi || 0;
                const height = (ndvi / candidate.peakNDVI) * 100;
                const isRecent = index >= chartData.length - candidate.consecutiveDays;
                
                return (
                  <div
                    key={index}
                    className="flex-1 relative group"
                  >
                    <div
                      className={`w-full rounded-t transition-all ${
                        isRecent ? 'bg-red-400' : 'bg-green-400'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      {ndvi.toFixed(3)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>30 days ago</span>
              <span>Today</span>
            </div>
          </div>

          {/* Detection Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Detection Criteria Met</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>✓ Both NDVI and NDRE below 60% of season peak</li>
                  <li>✓ Sustained for {candidate.consecutiveDays} consecutive days</li>
                  <li>✓ Detected on {new Date(candidate.detectedDate).toLocaleDateString()}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yield Estimate (optional)
              </label>
              <input
                type="number"
                step="0.1"
                value={yieldEstimate}
                onChange={(e) => setYieldEstimate(e.target.value)}
                placeholder="e.g., 4.5 tons/hectare"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any observations about the harvest..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-900 mb-1">What happens next?</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Field will be marked as "Harvested"</li>
                  <li>• Satellite data fetching will stop (saves costs)</li>
                  <li>• Field enters 21-day dormant period</li>
                  <li>• You can reactivate when ready for next crop</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Not Yet Harvested
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Leaf className="w-5 h-5" />
            Confirm Harvest
          </button>
        </div>
      </div>
    </div>
  );
};
