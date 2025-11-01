import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ShoppingCart, Clock, TrendingUp, AlertCircle, ChevronDown, Leaf, MapPin, Plus } from 'lucide-react';
import type { ProductRecommendation } from '@/lib/marketplace/types';
import { amazonAffiliateService } from '@/lib/marketplace/AmazonAffiliateService';
import { cartService } from '@/lib/marketplace/CartService';
import { formatIndianCurrency } from '@/lib/marketplace/utils';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

interface RecommendationCardProps {
  recommendation: ProductRecommendation;
  fieldId: string;
}

export const RecommendationCard = ({ recommendation, fieldId }: RecommendationCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or expandable content
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/marketplace/product/${recommendation.id}`);
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    amazonAffiliateService.handleBuyClick(
      recommendation.id,
      recommendation.product_name,
      recommendation.amazon_link.split('/dp/')[1]?.split('?')[0] || '',
      fieldId,
      {
        priority: recommendation.priority,
        confidence: recommendation.confidence,
        urgency_score: recommendation.urgency_score,
      }
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    cartService.addToCart({
      product_id: recommendation.id,
      product_name: recommendation.product_name,
      price: recommendation.price,
      image_url: recommendation.image_url,
      amazon_link: recommendation.amazon_link,
      package_size: recommendation.package_size,
    }, 1);
    toast.success('Added to cart!', {
      description: recommendation.product_name,
    });
  };

  const getConfidenceBadgeVariant = (confidence: number): 'default' | 'secondary' | 'destructive' => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'destructive';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'immediate':
        return 'text-red-600 bg-red-50';
      case 'preventive':
        return 'text-orange-600 bg-orange-50';
      case 'seasonal':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleCardClick}>
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-green-50 to-blue-50">
        <img
          src={recommendation.image_url}
          alt={recommendation.product_name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Priority Badge */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(recommendation.priority)}`}>
          {recommendation.priority === 'immediate' && '🚨 Immediate'}
          {recommendation.priority === 'preventive' && '🛡️ Preventive'}
          {recommendation.priority === 'seasonal' && '📅 Seasonal'}
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {recommendation.eco_friendly && (
            <Badge variant="default" className="bg-green-600 text-white">
              <Leaf className="w-3 h-3 mr-1" />
              Eco
            </Badge>
          )}
          {recommendation.local_manufacturer && (
            <Badge variant="default" className="bg-orange-600 text-white">
              <MapPin className="w-3 h-3 mr-1" />
              Local
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {recommendation.product_name}
        </h3>

        {/* Confidence Badge */}
        <div className="mb-3">
          <Badge variant={getConfidenceBadgeVariant(recommendation.confidence)}>
            {Math.round(recommendation.confidence * 100)}% confidence
          </Badge>
        </div>

        {/* Reason Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-3 rounded">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">Why recommended:</p>
              <p className="text-sm text-blue-800">{recommendation.reason}</p>
            </div>
          </div>
        </div>

        {/* Timing */}
        <div className="flex items-center gap-2 mb-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-gray-500" />
          <span><strong>When:</strong> {recommendation.timing_guidance}</span>
        </div>

        {/* Expected Benefit */}
        <div className="flex items-start gap-2 mb-4 text-sm text-gray-700">
          <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <span><strong>Benefit:</strong> {recommendation.expected_benefit}</span>
        </div>

        {/* Price and Buy Button */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-gray-900">
              {formatIndianCurrency(recommendation.price)}
            </span>
            <span className="text-xs text-gray-500">{recommendation.package_size}</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleBuyClick}
              className="bg-gradient-primary hover:opacity-90 text-white"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
        </div>

        {/* Expandable Details */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="mt-4">
          <CollapsibleTrigger className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-800">
            <span>{isExpanded ? 'Hide' : 'View'} Details</span>
            <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-3 space-y-3">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900 mb-1">Full Explanation:</p>
              <p className="text-sm text-gray-700">{recommendation.detailed_explanation}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium text-gray-900 mb-1">Application Instructions:</p>
              <p className="text-sm text-gray-700">{recommendation.application_instructions}</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Category: {recommendation.category}</span>
              <span>•</span>
              <span>Urgency: {recommendation.urgency_score}/100</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
};
