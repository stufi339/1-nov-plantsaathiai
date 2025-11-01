import { useState, useEffect } from 'react';
import { Save, X, Upload, Eye } from 'lucide-react';
import type { ProductCatalogEntry } from '@/lib/marketplace/types';

interface ProductFormProps {
  product?: ProductCatalogEntry | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSave, onCancel }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: {
      en: '',
      hi: '',
      bn: '',
    },
    category: 'fertilizer',
    subcategory: '',
    amazon_asin: '',
    amazon_link: '',
    amazon_affiliate_tag: 'plantsaathi-21',
    base_price: 0,
    package_sizes: [''],
    manufacturer: '',
    is_local: true,
    is_eco_friendly: false,
    sustainability_rating: 3,
    image_url: '',
    application_rate: '',
    safety_precautions: [''],
    effectiveness_rating: 4.0,
    regional_availability: ['IN'],
  });

  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        product_id: product.product_id,
        product_name: product.product_name,
        category: product.category,
        subcategory: product.subcategory,
        amazon_asin: product.amazon_asin,
        amazon_link: product.amazon_link || '',
        amazon_affiliate_tag: product.amazon_affiliate_tag,
        base_price: product.base_price,
        package_sizes: product.package_sizes,
        manufacturer: product.manufacturer,
        is_local: product.is_local,
        is_eco_friendly: product.is_eco_friendly,
        sustainability_rating: product.sustainability_rating,
        image_url: product.image_url,
        application_rate: product.application_rate,
        safety_precautions: product.safety_precautions,
        effectiveness_rating: product.effectiveness_rating,
        regional_availability: product.regional_availability,
      });
      setPreviewImage(product.image_url);
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.product_id || !formData.product_name.en || !formData.amazon_asin) {
      alert('Please fill in all required fields');
      return;
    }

    // In a real app, this would save to database
    console.log('Saving product:', formData);
    alert(`Product ${product ? 'updated' : 'created'} successfully!\n\nIn production, this would:\n- Save to database\n- Update product catalog\n- Refresh marketplace`);
    
    onSave();
  };

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image_url: url });
    setPreviewImage(url);
  };

  const addPackageSize = () => {
    setFormData({
      ...formData,
      package_sizes: [...formData.package_sizes, '']
    });
  };

  const updatePackageSize = (index: number, value: string) => {
    const newSizes = [...formData.package_sizes];
    newSizes[index] = value;
    setFormData({ ...formData, package_sizes: newSizes });
  };

  const removePackageSize = (index: number) => {
    setFormData({
      ...formData,
      package_sizes: formData.package_sizes.filter((_, i) => i !== index)
    });
  };

  const addSafetyPrecaution = () => {
    setFormData({
      ...formData,
      safety_precautions: [...formData.safety_precautions, '']
    });
  };

  const updateSafetyPrecaution = (index: number, value: string) => {
    const newPrecautions = [...formData.safety_precautions];
    newPrecautions[index] = value;
    setFormData({ ...formData, safety_precautions: newPrecautions });
  };

  const removeSafetyPrecaution = (index: number) => {
    setFormData({
      ...formData,
      safety_precautions: formData.safety_precautions.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-2 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_id}
                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                    placeholder="e.g., fert_urea_001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_name.en}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      product_name: { ...formData.product_name, en: e.target.value }
                    })}
                    placeholder="e.g., Urea 46-0-0 Fertilizer (50kg)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={formData.product_name.hi}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      product_name: { ...formData.product_name, hi: e.target.value }
                    })}
                    placeholder="e.g., यूरिया 46-0-0 उर्वरक (50 किग्रा)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name (Bengali)
                  </label>
                  <input
                    type="text"
                    value={formData.product_name.bn}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      product_name: { ...formData.product_name, bn: e.target.value }
                    })}
                    placeholder="e.g., ইউরিয়া 46-0-0 সার (50 কেজি)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="fertilizer">Fertilizer</option>
                      <option value="fungicide">Fungicide</option>
                      <option value="pesticide">Pesticide</option>
                      <option value="equipment">Equipment</option>
                      <option value="seed_treatment">Seed Treatment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="e.g., nitrogen, organic"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Amazon */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Pricing & Amazon</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                      placeholder="1250"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amazon ASIN *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.amazon_asin}
                      onChange={(e) => setFormData({ ...formData, amazon_asin: e.target.value })}
                      placeholder="B08XYZ1234"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manual Amazon Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.amazon_link}
                    onChange={(e) => setFormData({ ...formData, amazon_link: e.target.value })}
                    placeholder="https://www.amazon.in/dp/B08XYZ1234?tag=plantsaathi-21"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If provided, this link will be used instead of auto-generated ASIN link
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Sizes
                  </label>
                  {formData.package_sizes.map((size, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={size}
                        onChange={(e) => updatePackageSize(index, e.target.value)}
                        placeholder="e.g., 50kg"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {formData.package_sizes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackageSize(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPackageSize}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add Package Size
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Product Image */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Image</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {previewImage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview
                    </label>
                    <img
                      src={previewImage}
                      alt="Product preview"
                      className="w-full h-48 object-cover rounded-lg border"
                      onError={() => setPreviewImage('')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g., IFFCO"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Rate
                  </label>
                  <textarea
                    value={formData.application_rate}
                    onChange={(e) => setFormData({ ...formData, application_rate: e.target.value })}
                    placeholder="e.g., 100-150 kg/hectare for rice"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Effectiveness (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={formData.effectiveness_rating}
                      onChange={(e) => setFormData({ ...formData, effectiveness_rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sustainability (1-5)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.sustainability_rating}
                      onChange={(e) => setFormData({ ...formData, sustainability_rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_eco_friendly}
                      onChange={(e) => setFormData({ ...formData, is_eco_friendly: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Eco-Friendly Product</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_local}
                      onChange={(e) => setFormData({ ...formData, is_local: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Made in India</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Precautions
                  </label>
                  {formData.safety_precautions.map((precaution, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={precaution}
                        onChange={(e) => updateSafetyPrecaution(index, e.target.value)}
                        placeholder="e.g., Wear protective gloves"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      {formData.safety_precautions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSafetyPrecaution(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addSafetyPrecaution}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add Safety Precaution
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-8 flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
