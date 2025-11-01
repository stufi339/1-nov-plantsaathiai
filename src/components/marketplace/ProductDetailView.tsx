import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react';
import { productCatalogService } from '@/lib/marketplace/ProductCatalogService';
import { amazonAffiliateService } from '@/lib/marketplace/AmazonAffiliateService';
import { formatIndianCurrency } from '@/lib/marketplace/utils';
import type { ProductCatalogEntry } from '@/lib/marketplace/types';

interface ProductDetailViewProps {
  productId: string;
}

export const ProductDetailView = ({ productId }: ProductDetailViewProps) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductCatalogEntry | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<ProductCatalogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews' | 'qa'>('description');

  useEffect(() => {
    // Get product details
    const productData = productCatalogService.getProductById(productId);
    if (productData) {
      setProduct(productData);
      
      // Get related products (same category)
      const related = productCatalogService.searchByConditions({
        category: productData.category,
      }).filter(p => p.product_id !== productId).slice(0, 4);
      setRelatedProducts(related);
    }
  }, [productId]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-orange-500 hover:text-orange-600"
          >
            ← Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const handleBuyNow = () => {
    amazonAffiliateService.handleBuyClick(
      product.product_id,
      product.product_name.en,
      product.amazon_asin,
      'product_detail',
      { quantity, source: 'product_detail_page' }
    );
  };

  const productImages = [
    product.image_url,
    product.image_url,
    product.image_url,
  ];

  const mockReviews = [
    { name: 'Rajesh Kumar', rating: 5, comment: 'Excellent product, very effective for my crops', date: '2 weeks ago' },
    { name: 'Priya Sharma', rating: 4, comment: 'Good quality, fast delivery', date: '1 month ago' },
    { name: 'Amit Singh', rating: 5, comment: 'Highly recommended for farmers', date: '2 months ago' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-[#232F3E] text-white sticky top-0 z-50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={() => navigate('/marketplace')}
            className="p-2 hover:bg-white/10 rounded mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold flex-1 truncate">{product.product_name.en}</h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/10 rounded">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Product Images and Basic Info */}
        <div className="bg-white">
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Image Gallery */}
            <div>
              <div className="mb-4">
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.product_name.en}
                  className="w-full h-96 object-cover rounded-lg border"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {productImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                      selectedImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.product_name.en}</h1>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.effectiveness_rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({product.effectiveness_rating}) • 127 reviews</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">by {product.manufacturer}</p>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.is_eco_friendly && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    🌱 Eco-Friendly
                  </span>
                )}
                {product.is_local && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    🇮🇳 Made in India
                  </span>
                )}
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  ⭐ {product.sustainability_rating}/5 Sustainability
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatIndianCurrency(product.base_price)}
                  </span>
                  <span className="text-gray-600">({product.package_sizes[0]})</span>
                </div>
                <p className="text-sm text-green-600">✓ Free delivery on orders above ₹499</p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now on Amazon
                </button>
                <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 px-6 rounded-lg font-semibold">
                  Add to Cart
                </button>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free delivery by tomorrow</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>2-year warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white mt-2">
          <div className="border-b">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === 'description' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-3 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === 'specifications' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Specifications
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === 'reviews' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Reviews (127)
              </button>
              <button 
                onClick={() => setActiveTab('qa')}
                className={`px-6 py-3 border-b-2 font-medium whitespace-nowrap transition ${
                  activeTab === 'qa' 
                    ? 'border-orange-500 text-orange-600' 
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Q&A
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Description</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    {product.product_name.en} is a high-quality agricultural input designed to enhance crop productivity 
                    and health. Manufactured by {product.manufacturer}, this product has been trusted by farmers 
                    across India for its effectiveness and reliability.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Application Rate:</strong> {product.application_rate}
                  </p>
                  <p className="text-gray-700">
                    <strong>Safety Precautions:</strong> {product.safety_precautions.join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Category:</dt>
                        <dd className="capitalize">{product.category}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Manufacturer:</dt>
                        <dd>{product.manufacturer}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Package Size:</dt>
                        <dd>{product.package_sizes.join(', ')}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Effectiveness:</dt>
                        <dd>{product.effectiveness_rating}/5</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="font-medium">Eco-Friendly:</dt>
                        <dd>{product.is_eco_friendly ? 'Yes' : 'No'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Made in India:</dt>
                        <dd>{product.is_local ? 'Yes' : 'No'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Sustainability:</dt>
                        <dd>{product.sustainability_rating}/5</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="font-medium">Regional Availability:</dt>
                        <dd>{product.regional_availability.length} states</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                <div className="space-y-4">
                  {mockReviews.map((review, index) => (
                    <div key={index} className="border-b pb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.name}</span>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Q&A Tab */}
            {activeTab === 'qa' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Questions & Answers</h3>
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <p className="font-medium text-gray-900 mb-2">Q: How much area does one bag cover?</p>
                    <p className="text-gray-700 pl-4">A: One 50kg bag typically covers 1-1.5 acres depending on soil conditions and crop type.</p>
                  </div>
                  <div className="border-b pb-4">
                    <p className="font-medium text-gray-900 mb-2">Q: Can this be used for organic farming?</p>
                    <p className="text-gray-700 pl-4">A: {product.is_eco_friendly ? 'Yes, this product is certified for organic farming.' : 'Please check with your organic certification body for approval.'}</p>
                  </div>
                  <div className="border-b pb-4">
                    <p className="font-medium text-gray-900 mb-2">Q: What is the shelf life?</p>
                    <p className="text-gray-700 pl-4">A: When stored properly in a cool, dry place, the shelf life is typically 2-3 years from the manufacturing date.</p>
                  </div>
                  <div className="mt-6">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                      Ask a Question
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white mt-2">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Customers also viewed</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.product_id}
                    onClick={() => navigate(`/marketplace/product/${relatedProduct.product_id}`)}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer"
                  >
                    <img
                      src={relatedProduct.image_url}
                      alt={relatedProduct.product_name.en}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm font-medium line-clamp-2 mb-2">
                        {relatedProduct.product_name.en}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatIndianCurrency(relatedProduct.base_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
