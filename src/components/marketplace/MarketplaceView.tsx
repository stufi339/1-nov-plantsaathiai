import { useState, useEffect } from 'react';
import { MarketplaceHeader } from './MarketplaceHeader';
import { RecommendationSection, EmptyRecommendations } from './RecommendationSection';
import { RecommendationCard } from './RecommendationCard';
import { Loader2 } from 'lucide-react';
import type { ProductRecommendation } from '@/lib/marketplace/types';
import { marketIntelligenceService } from '@/lib/marketplace/MarketIntelligenceService';
import { amazonAffiliateService } from '@/lib/marketplace/AmazonAffiliateService';
import { filterByCategory, filterByPriority, formatIndianCurrency } from '@/lib/marketplace/utils';
import { blackBoxService } from '@/lib/blackBoxService';

export const MarketplaceView = () => {
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<{ id: string; name: string }[]>([]);

  // Load fields on mount
  useEffect(() => {
    // Log marketplace page view
    blackBoxService.logUserInteraction('page_view', 'marketplace_view', undefined, {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.screen.width}x${window.screen.height}`
    });
    
    loadFields();
  }, []);

  // Load recommendations when field changes
  useEffect(() => {
    if (selectedField) {
      loadRecommendations();
    }
  }, [selectedField]);

  const loadFields = () => {
    try {
      const fieldIds: { id: string; name: string }[] = [];

      // Get all fields from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('field_') && key.endsWith('_data')) {
          const fieldId = key.replace('field_', '').replace('_data', '');
          const fieldDataStr = localStorage.getItem(key);
          
          if (fieldDataStr) {
            const fieldData = JSON.parse(fieldDataStr);
            fieldIds.push({
              id: fieldId,
              name: fieldData.name || fieldId,
            });
          }
        }
      }

      setFields(fieldIds);

      // Auto-select first field if available
      if (fieldIds.length > 0 && selectedField === 'all') {
        setSelectedField(fieldIds[0].id);
      }
    } catch (error) {
      console.error('Failed to load fields:', error);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      if (selectedField === 'all') {
        // Load recommendations for all fields
        const allRecommendations: ProductRecommendation[] = [];
        
        for (const field of fields) {
          const analysis = await marketIntelligenceService.analyzeField(field.id);
          const recs = marketIntelligenceService.generateRecommendations(analysis);
          allRecommendations.push(...recs);
        }

        setRecommendations(allRecommendations);
        
        // Log recommendations loaded
        blackBoxService.logUserInteraction('page_view', 'marketplace_recommendations_loaded', undefined, {
          fieldCount: fields.length,
          recommendationCount: allRecommendations.length,
          categories: [...new Set(allRecommendations.map(r => r.category))],
          priorities: [...new Set(allRecommendations.map(r => r.priority))],
          timestamp: new Date().toISOString()
        });
      } else {
        // Load recommendations for selected field
        const analysis = await marketIntelligenceService.analyzeField(selectedField);
        const recs = marketIntelligenceService.generateRecommendations(analysis);
        setRecommendations(recs);
        
        // Log field-specific recommendations
        blackBoxService.logUserInteraction('page_view', 'marketplace_field_recommendations', selectedField, {
          recommendationCount: recs.length,
          categories: [...new Set(recs.map(r => r.category))],
          priorities: [...new Set(recs.map(r => r.priority))],
          urgentCount: recs.filter(r => r.priority === 'immediate').length,
          preventiveCount: recs.filter(r => r.priority === 'preventive').length,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recommendations');
      setRecommendations([]);
      
      // Log error
      blackBoxService.logError(
        'api_failure',
        error instanceof Error ? error.message : 'Failed to load recommendations',
        selectedField !== 'all' ? selectedField : undefined,
        'marketplace_load_recommendations',
        error instanceof Error ? error.stack : undefined,
        false
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter recommendations based on selected filters
  const getFilteredRecommendations = (): ProductRecommendation[] => {
    let filtered = [...recommendations];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filterByCategory(filtered, selectedCategory);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filterByPriority(filtered, selectedPriority as any);
    }

    return filtered;
  };

  const filteredRecommendations = getFilteredRecommendations();

  // Group by priority
  const immediateRecs = filteredRecommendations.filter((r) => r.priority === 'immediate');
  const preventiveRecs = filteredRecommendations.filter((r) => r.priority === 'preventive');
  const seasonalRecs = filteredRecommendations.filter((r) => r.priority === 'seasonal');

  // Get all products for browsing
  const [allProducts, setAllProducts] = useState<ProductRecommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllProducts();
  }, []);

  const loadAllProducts = () => {
    // Import product catalog and convert to recommendations for display
    import('@/lib/marketplace/productCatalog').then(({ PRODUCT_CATALOG }) => {
      const allProductRecs: ProductRecommendation[] = PRODUCT_CATALOG.map((product) => ({
        id: product.product_id,
        product_name: product.product_name.en,
        category: product.category,
        priority: 'seasonal' as const,
        urgency_score: 0,
        confidence: 1,
        reason: 'Available for purchase',
        detailed_explanation: `${product.product_name.en} from ${product.manufacturer}`,
        timing_guidance: 'Available anytime',
        application_instructions: product.application_rate,
        expected_benefit: 'Supports crop health and productivity',
        amazon_link: `https://www.amazon.in/dp/${product.amazon_asin}?tag=${product.amazon_affiliate_tag}`,
        price: product.base_price,
        package_size: product.package_sizes[0],
        image_url: product.image_url,
        eco_friendly: product.is_eco_friendly,
        local_manufacturer: product.is_local,
        regional_available: true,
        fields_needing: [],
      }));
      setAllProducts(allProductRecs);
    });
  };

  // Filter all products by search and category
  const getFilteredAllProducts = (): ProductRecommendation[] => {
    let filtered = [...allProducts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    return filtered;
  };

  const filteredAllProducts = getFilteredAllProducts();
  const hasRecommendations = filteredRecommendations.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Amazon-style Compact Header */}
      <div className="bg-[#232F3E] text-white sticky top-0 z-50 shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">🛒 Marketplace</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-white/10 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Search Bar - Amazon style */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                
                // Log search (debounced in real implementation)
                if (query.length > 2) {
                  blackBoxService.logUserInteraction('button_click', 'marketplace_search', undefined, {
                    searchQuery: query,
                    resultCount: filteredAllProducts.length,
                    timestamp: new Date().toISOString()
                  });
                }
              }}
              className="w-full px-4 py-2 pr-10 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-400 hover:bg-orange-500 p-1.5 rounded">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal Category Scroll - Amazon style */}
        <div className="overflow-x-auto scrollbar-hide border-t border-white/10">
          <div className="flex gap-1 px-4 py-2 min-w-max">
            <button
              onClick={() => {
                setSelectedCategory('all');
                blackBoxService.logUserInteraction('button_click', 'marketplace_category_filter', undefined, {
                  category: 'all',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-orange-400 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setSelectedCategory('fertilizer');
                blackBoxService.logUserInteraction('button_click', 'marketplace_category_filter', undefined, {
                  category: 'fertilizer',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'fertilizer'
                  ? 'bg-orange-400 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Fertilizers
            </button>
            <button
              onClick={() => {
                setSelectedCategory('fungicide');
                blackBoxService.logUserInteraction('button_click', 'marketplace_category_filter', undefined, {
                  category: 'fungicide',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'fungicide'
                  ? 'bg-orange-400 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Fungicides
            </button>
            <button
              onClick={() => {
                setSelectedCategory('pesticide');
                blackBoxService.logUserInteraction('button_click', 'marketplace_category_filter', undefined, {
                  category: 'pesticide',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'pesticide'
                  ? 'bg-orange-400 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Pesticides
            </button>
            <button
              onClick={() => {
                setSelectedCategory('equipment');
                blackBoxService.logUserInteraction('button_click', 'marketplace_category_filter', undefined, {
                  category: 'equipment',
                  timestamp: new Date().toISOString()
                });
              }}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                selectedCategory === 'equipment'
                  ? 'bg-orange-400 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              Equipment
            </button>
          </div>
        </div>
      </div>

      {/* Field Selector - Compact */}
      {fields.length > 0 && (
        <div className="bg-white border-b px-4 py-2">
          <select
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="text-sm border rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="all">All Fields</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                📍 {field.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Content - Amazon style */}
      <div className="pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mx-4 mt-4">
            <p className="text-red-800 font-medium mb-2">Error Loading Products</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={loadRecommendations}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Recommended Products - Amazon "Inspired by your browsing history" style */}
            {hasRecommendations && (
              <div className="bg-white mb-2">
                <div className="px-4 py-3 border-b">
                  <h2 className="text-lg font-bold text-gray-900">
                    Recommended for your farm
                  </h2>
                  <p className="text-xs text-gray-600">Based on soil analysis & crop health</p>
                </div>

                {/* Immediate - Horizontal Scroll */}
                {immediateRecs.length > 0 && (
                  <div className="px-4 py-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-red-600">🚨 Urgent</h3>
                      <span className="text-xs text-gray-500">{immediateRecs.length} items</span>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                      <div className="flex gap-3 pb-2">
                        {immediateRecs.map((rec) => (
                          <div key={rec.id} className="flex-shrink-0 w-40">
                            <div 
                              onClick={() => window.location.href = `/marketplace/product/${rec.id}`}
                              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                            >
                              <img src={rec.image_url} alt={rec.product_name} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                <p className="text-xs font-medium line-clamp-2 mb-1">{rec.product_name}</p>
                                <p className="text-sm font-bold text-gray-900">{formatIndianCurrency(rec.price)}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/marketplace/product/${rec.id}`;
                                  }}
                                  className="w-full mt-2 bg-orange-400 hover:bg-orange-500 text-white text-xs py-1.5 rounded"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Preventive - Horizontal Scroll */}
                {preventiveRecs.length > 0 && (
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-orange-600">🛡️ Preventive</h3>
                      <span className="text-xs text-gray-500">{preventiveRecs.length} items</span>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
                      <div className="flex gap-3 pb-2">
                        {preventiveRecs.map((rec) => (
                          <div key={rec.id} className="flex-shrink-0 w-40">
                            <div 
                              onClick={() => window.location.href = `/marketplace/product/${rec.id}`}
                              className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                            >
                              <img src={rec.image_url} alt={rec.product_name} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                <p className="text-xs font-medium line-clamp-2 mb-1">{rec.product_name}</p>
                                <p className="text-sm font-bold text-gray-900">{formatIndianCurrency(rec.price)}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/marketplace/product/${rec.id}`;
                                  }}
                                  className="w-full mt-2 bg-orange-400 hover:bg-orange-500 text-white text-xs py-1.5 rounded"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Products - Amazon Grid Style */}
            <div className="bg-white mt-2">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">All Products</h2>
                  <p className="text-xs text-gray-600">{filteredAllProducts.length} results</p>
                </div>
              </div>

              {filteredAllProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                  {filteredAllProducts.map((product) => (
                    <div 
                      key={product.id} 
                      onClick={() => {
                        // Log product view from browse
                        blackBoxService.logUserInteraction('button_click', 'marketplace_product_view', undefined, {
                          productId: product.id,
                          productName: product.product_name,
                          category: product.category,
                          price: product.price,
                          ecoFriendly: product.eco_friendly,
                          source: 'browse_all_products',
                          searchQuery: searchQuery || undefined,
                          selectedCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
                          timestamp: new Date().toISOString()
                        });
                        window.location.href = `/marketplace/product/${product.id}`;
                      }}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                    >
                      <img src={product.image_url} alt={product.product_name} className="w-full h-40 object-cover" />
                      <div className="p-3">
                        <p className="text-sm font-medium line-clamp-2 mb-2 h-10">{product.product_name}</p>
                        <div className="flex items-baseline gap-1 mb-2">
                          <span className="text-lg font-bold text-gray-900">{formatIndianCurrency(product.price)}</span>
                        </div>
                        {product.eco_friendly && (
                          <span className="inline-block text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mb-2">
                            🌱 Eco
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/marketplace/product/${product.id}`;
                          }}
                          className="w-full bg-orange-400 hover:bg-orange-500 text-white text-sm py-2 rounded font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
