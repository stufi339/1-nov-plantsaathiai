import React, { useState } from 'react';
import { X, Leaf, Calendar, AlertCircle, Sparkles } from 'lucide-react';
import { FieldStatus } from '../../lib/fieldLifecycleService';

interface FieldReactivationModalProps {
  fieldId: string;
  fieldName: string;
  currentStatus: FieldStatus;
  lastCropType?: string;
  dormantUntil?: string;
  onReactivate: (cropType: string, metadata: any) => void;
  onClose: () => void;
}

export const FieldReactivationModal: React.FC<FieldReactivationModalProps> = ({
  fieldId,
  fieldName,
  currentStatus,
  lastCropType,
  dormantUntil,
  onReactivate,
  onClose
}) => {
  const [cropType, setCropType] = useState('');
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const isDormantLockActive = dormantUntil && new Date(dormantUntil) > new Date();
  const daysRemaining = dormantUntil 
    ? Math.ceil((new Date(dormantUntil).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  const commonCrops = [
    'Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane',
    'Soybean', 'Pulses', 'Vegetables', 'Fruits', 'Other'
  ];

  const handleReactivate = () => {
    if (!cropType.trim()) {
      alert('Please enter crop type');
      return;
    }

    onReactivate(cropType, {
      sowingDate,
      notes,
      reactivationReason: 'New crop sowing',
      previousCrop: lastCropType
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Reactivate Field</h2>
            <p className="text-sm text-gray-600 mt-1">{fieldName}</p>
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
          {/* Dormant Lock Warning */}
          {isDormantLockActive && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-yellow-900 mb-1">Dormant Period Active</h4>
                  <p className="text-sm text-yellow-700">
                    This field is in its recommended rest period. {daysRemaining} days remaining until {new Date(dormantUntil).toLocaleDateString()}.
                  </p>
                  <p className="text-sm text-yellow-700 mt-2">
                    You can still reactivate now, but allowing the full dormant period helps soil recovery.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Previous Crop Info */}
          {lastCropType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Leaf className="w-4 h-4" />
                <span className="text-sm font-medium">Previous Crop</span>
              </div>
              <p className="text-blue-900 font-medium">{lastCropType}</p>
              <p className="text-xs text-blue-600 mt-1">
                Consider crop rotation for better soil health
              </p>
            </div>
          )}

          {/* Crop Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Crop Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {commonCrops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => setCropType(crop)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                    cropType === crop
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                  }`}
                >
                  {crop}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              placeholder="Or enter custom crop name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Sowing Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sowing Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={sowingDate}
                onChange={(e) => setSowingDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or plans for this crop cycle..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          {/* What Happens Next */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-green-900 mb-1">What happens next?</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Field will be marked as "Active"</li>
                  <li>• Satellite monitoring will resume</li>
                  <li>• Daily data updates will start</li>
                  <li>• You'll receive health alerts and recommendations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleReactivate}
            disabled={!cropType.trim()}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Leaf className="w-5 h-5" />
            Reactivate Field
          </button>
        </div>
      </div>
    </div>
  );
};
