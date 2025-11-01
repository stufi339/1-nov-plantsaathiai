import type { ProductRecommendation } from '@/lib/marketplace/types';
import { RecommendationCard } from './RecommendationCard';
import { AlertCircle } from 'lucide-react';

interface RecommendationSectionProps {
  title: string;
  recommendations: ProductRecommendation[];
  urgencyIndicator: 'high' | 'medium' | 'low';
  fieldId: string;
}

export const RecommendationSection = ({
  title,
  recommendations,
  urgencyIndicator,
  fieldId,
}: RecommendationSectionProps) => {
  if (recommendations.length === 0) {
    return null;
  }

  const getUrgencyColor = () => {
    switch (urgencyIndicator) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-orange-500 bg-orange-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getUrgencyIcon = () => {
    switch (urgencyIndicator) {
      case 'high':
        return '🚨';
      case 'medium':
        return '🛡️';
      case 'low':
        return '📅';
      default:
        return '📦';
    }
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className={`border-l-4 ${getUrgencyColor()} p-4 mb-4 rounded-r-lg`}>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>{getUrgencyIcon()}</span>
          {title}
          <span className="text-sm font-normal text-gray-600">
            ({recommendations.length} {recommendations.length === 1 ? 'product' : 'products'})
          </span>
        </h2>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            fieldId={fieldId}
          />
        ))}
      </div>
    </div>
  );
};

export const EmptyRecommendations = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Recommendations Available</h3>
      <p className="text-gray-600 text-center max-w-md">
        We couldn't generate recommendations for this field. Make sure your field has recent soil analysis,
        disease detection, or weather data.
      </p>
    </div>
  );
};
