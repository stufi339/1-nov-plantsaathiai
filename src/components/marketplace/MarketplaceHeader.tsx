import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { cartService } from '@/lib/marketplace/CartService';

interface MarketplaceHeaderProps {
  selectedField: string;
  onFieldChange: (fieldId: string) => void;
  fields: { id: string; name: string }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedPriority: string;
  onPriorityChange: (priority: string) => void;
}

export const MarketplaceHeader = ({
  selectedField,
  onFieldChange,
  fields,
  selectedCategory,
  onCategoryChange,
  selectedPriority,
  onPriorityChange,
}: MarketplaceHeaderProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    
    const handleCartUpdate = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateCartCount = () => {
    const cart = cartService.getCart();
    setCartCount(cart.itemCount);
  };

  return (
    <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
      <div className="px-6 py-4">
        {/* Header with Cart Icon */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">🛒 Marketplace</h1>
          <button
            onClick={() => navigate('/cart')}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ShoppingCart className="w-6 h-6 text-gray-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
        {/* Field Selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Select Field
          </label>
          <Select value={selectedField} onValueChange={onFieldChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select a field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fields</SelectItem>
              {fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Category
          </label>
          <Tabs value={selectedCategory} onValueChange={onCategoryChange}>
            <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="fertilizer">Fertilizers</TabsTrigger>
              <TabsTrigger value="fungicide">Fungicides</TabsTrigger>
              <TabsTrigger value="pesticide">Pesticides</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="seed_treatment">Seeds</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            Priority
          </label>
          <Tabs value={selectedPriority} onValueChange={onPriorityChange}>
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="immediate">🚨 Immediate</TabsTrigger>
              <TabsTrigger value="preventive">🛡️ Preventive</TabsTrigger>
              <TabsTrigger value="seasonal">📅 Seasonal</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
