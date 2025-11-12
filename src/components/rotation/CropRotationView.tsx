import React, { useState, useEffect } from 'react';
import { Leaf, TrendingUp, Droplet, Users, Calendar, AlertCircle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { cropRotationService, CropRotationRecommendation, MultiSeasonPlan } from '../../lib/cropRotationService';
import { useLanguage } from '../../hooks/useLanguage';

interface CropRotationViewProps {
  fieldId: string;
  fieldName: string;
}

export function CropRotationView({ fieldId, fieldName }: CropRotationViewProps) {
  const { t } = useLanguage();
  const [recommendation, setRecommendation] = useState<CropRotationRecommendation | null>(null);
  const [multiSeasonPlan, setMultiSeasonPlan] = useState<MultiSeasonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMultiSeason, setShowMultiSeason] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [fieldId]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const rec = await cropRotationService.getRotationRecommendation(fieldId);
      setRecommendation(rec);
    } catch (error) {
      console.error('Error loading rotation recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMultiSeasonPlan = async () => {
    try {
      const plan = await cropRotationService.getMultiSeasonPlan(fieldId, 3);
      setMultiSeasonPlan(plan);
      setShowMultiSeason(true);
    } catch (error) {
      console.error('Error loading multi-season plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Insufficient Data for Recommendations
            </h3>
            <p className="text-yellow-800 text-sm">
              We need more field history to provide personalized crop rotation advice. 
              Continue using Plant Saathi to track your crops, and we'll build intelligent recommendations for you.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Smart Crop Rotation Planner</h2>
        </div>
        <p className="text-green-50">
          AI-powered recommendations for {fieldName} based on your field's history
        </p>
      </div>

      {/* Current → Next Crop Transition */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Season Transition Recommendation
        </h3>

        <div className="grid md:grid-cols-3 gap-4 items-center">
          {/* Current Crop */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-600 font-medium mb-2">CURRENT CROP</div>
            <div className="text-2xl font-bold text-orange-900 capitalize mb-3">
              {recommendation.currentCrop}
            </div>
            <div className="space-y-1 text-sm text-orange-700">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Nitrogen: Depleted</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Disease Risk: Present</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-12 h-12 text-green-600" />
          </div>

          {/* Recommended Crop */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 relative">
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {recommendation.confidence}% Match
            </div>
            <div className="text-sm text-green-600 font-medium mb-2">RECOMMENDED NEXT</div>
            <div className="text-2xl font-bold text-green-900 capitalize mb-3">
              {recommendation.recommendedNextCrop}
            </div>
            <div className="space-y-1 text-sm text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Nitrogen: +{recommendation.soilRegeneration.nitrogenRestoration}%</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Disease: -{recommendation.diseaseRiskReduction}% Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Profit: +₹{recommendation.marketAdvantage.profitIncrease.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Soil Regeneration Benefits */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Leaf className="w-5 h-5 text-green-600" />
          Soil Health Improvement
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-600 font-medium mb-2">Nitrogen (N)</div>
            <div className="text-3xl font-bold text-blue-900 mb-1">
              +{recommendation.soilRegeneration.nitrogenRestoration}%
            </div>
            <div className="text-xs text-blue-700">Natural restoration through legume fixation</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-purple-600 font-medium mb-2">Phosphorus (P)</div>
            <div className="text-3xl font-bold text-purple-900 mb-1">
              +{recommendation.soilRegeneration.phosphorusBalance}%
            </div>
            <div className="text-xs text-purple-700">Balanced nutrient cycling</div>
          </div>

          <div className="bg-amber-50 rounded-lg p-4">
            <div className="text-sm text-amber-600 font-medium mb-2">Potassium (K)</div>
            <div className="text-3xl font-bold text-amber-900 mb-1">
              +{recommendation.soilRegeneration.potassiumEnhancement}%
            </div>
            <div className="text-xs text-amber-700">Enhanced soil fertility</div>
          </div>
        </div>
      </div>

      {/* Market Intelligence */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Market Advantage
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Expected Market Price</span>
              <span className="text-2xl font-bold text-green-600">
                ₹{recommendation.marketAdvantage.expectedPrice}/kg
              </span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Demand Trend</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                recommendation.marketAdvantage.demandTrend === 'high' 
                  ? 'bg-green-100 text-green-800'
                  : recommendation.marketAdvantage.demandTrend === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {recommendation.marketAdvantage.demandTrend.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profit Increase</span>
              <span className="text-2xl font-bold text-green-600">
                +₹{recommendation.marketAdvantage.profitIncrease.toLocaleString('en-IN')}/acre
              </span>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm font-medium text-green-900 mb-2">Nearby Markets</div>
            <div className="space-y-2">
              {recommendation.marketAdvantage.nearbyMarkets.map((market, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>{market}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Implementation Guide
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Preparation Time</span>
              <span className="font-semibold">{recommendation.implementation.preparationTime} days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Sowing Window</span>
              <span className="font-semibold">{recommendation.implementation.sowingWindow}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Expected Yield</span>
              <span className="font-semibold">{recommendation.implementation.expectedYield} tons/acre</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Water Need</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                recommendation.implementation.waterRequirement === 'low'
                  ? 'bg-green-100 text-green-800'
                  : recommendation.implementation.waterRequirement === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {recommendation.implementation.waterRequirement.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Labor Intensity</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                recommendation.implementation.laborIntensity === 'low'
                  ? 'bg-green-100 text-green-800'
                  : recommendation.implementation.laborIntensity === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {recommendation.implementation.laborIntensity.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Why This Recommendation?
        </h3>
        <div className="space-y-2">
          {recommendation.reasoning.map((reason, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-gray-700">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Season Planning */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            3-Year Rotation Plan
          </h3>
          {!showMultiSeason && (
            <button
              onClick={loadMultiSeasonPlan}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Generate Plan
            </button>
          )}
        </div>

        {showMultiSeason && multiSeasonPlan && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium mb-1">Total Soil Improvement</div>
                <div className="text-3xl font-bold text-green-900">
                  +{multiSeasonPlan.totalSoilImprovement}%
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium mb-1">Total Profit Increase</div>
                <div className="text-3xl font-bold text-blue-900">
                  ₹{multiSeasonPlan.totalProfitIncrease.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Season Timeline */}
            <div className="space-y-3">
              {multiSeasonPlan.seasons.map((season, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-32 text-sm font-medium text-gray-600">{season.season}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 capitalize">{season.crop}</div>
                    <div className="text-sm text-gray-600">
                      Soil: {season.soilHealthImpact > 0 ? '+' : ''}{season.soilHealthImpact}% | 
                      Profit: ₹{season.expectedProfit.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>

            {/* Risk Assessment */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <div className="font-medium text-yellow-900 mb-2">Risk Assessment</div>
              <div className="space-y-1">
                {multiSeasonPlan.riskAssessment.map((risk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
