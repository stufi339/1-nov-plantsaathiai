import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ExternalLink, Copy, Share2 } from 'lucide-react';
import { cartService } from '@/lib/marketplace/CartService';
import { formatIndianCurrency } from '@/lib/marketplace/utils';
import type { Cart } from '@/lib/marketplace/types';
import { toast } from 'sonner';

export const CartView = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 });

  useEffect(() => {
    loadCart();
    
    // Listen for cart updates
    const handleCartUpdate = (e: CustomEvent) => {
      setCart(e.detail);
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate as EventListener);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate as EventListener);
  }, []);

  const loadCart = () => {
    setCart(cartService.getCart());
  };

  const updateQuantity = (productId: string, quantity: number) => {
    cartService.updateQuantity(productId, quantity);
  };

  const removeItem = (productId: string) => {
    cartService.removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleBulkOrder = () => {
    const links = cartService.generateBulkOrderLinks();
    
    // Open all links in new tabs
    links.forEach((link, index) => {
      setTimeout(() => {
        window.open(link, '_blank');
      }, index * 500); // Stagger opening to avoid popup blockers
    });
    
    toast.success(`Opening ${links.length} product pages...`);
  };

  const copyBulkOrderText = () => {
    const text = cartService.generateBulkOrderText();
    navigator.clipboard.writeText(text);
    toast.success('Order details copied to clipboard!');
  };

  const shareBulkOrder = async () => {
    const text = cartService.generateBulkOrderText();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Plant Saathi Bulk Order',
          text: text,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      copyBulkOrderText();
    }
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      cartService.clearCart();
      toast.success('Cart cleared');
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-[#232F3E] text-white sticky top-0 z-50">
          <div className="flex items-center px-4 py-3">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-2 hover:bg-white/10 rounded mr-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Shopping Cart</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 px-4">
          <ShoppingBag className="w-24 h-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add products to your cart to place a bulk order</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold flex-1">Shopping Cart ({cart.itemCount} items)</h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-300 hover:text-red-100"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Cart Items */}
        <div className="space-y-4 mb-6">
          {cart.items.map((item) => (
            <div key={item.product_id} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex gap-4">
                <img
                  src={item.image_url}
                  alt={item.product_name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.product_name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.package_size}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatIndianCurrency(item.price * item.quantity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatIndianCurrency(item.price)} each
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span>{formatIndianCurrency(cart.total)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Delivery</span>
              <span className="text-green-600">FREE</span>
            </div>
          </div>
          
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{formatIndianCurrency(cart.total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleBulkOrder}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Place Bulk Order on Amazon
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyBulkOrderText}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Details
              </button>
              
              <button
                onClick={shareBulkOrder}
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How Bulk Ordering Works</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Place Bulk Order" to open all products on Amazon</li>
            <li>Add each product to your Amazon cart</li>
            <li>Complete your purchase on Amazon</li>
            <li>Enjoy free delivery on orders above ₹499</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
