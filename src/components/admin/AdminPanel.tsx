import { useState } from 'react';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { BlackBoxAnalytics } from './BlackBoxAnalytics';
import { ContentManager } from './ContentManager';
import { Package, Plus, BarChart3, Settings, Users, Database, Video } from 'lucide-react';
import type { ProductCatalogEntry } from '@/lib/marketplace/types';

type AdminView = 'products' | 'add-product' | 'analytics' | 'blackbox' | 'content' | 'settings';

export const AdminPanel = () => {
  const [currentView, setCurrentView] = useState<AdminView>('products');
  const [editingProduct, setEditingProduct] = useState<ProductCatalogEntry | null>(null);

  const handleEditProduct = (product: ProductCatalogEntry) => {
    setEditingProduct(product);
    setCurrentView('add-product');
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setCurrentView('add-product');
  };

  const handleBackToList = () => {
    setEditingProduct(null);
    setCurrentView('products');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#232F3E] text-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold">🛠️ Admin Panel</h1>
          <p className="text-sm opacity-90">Manage your marketplace products</p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setCurrentView('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'products'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Package className="w-5 h-5" />
                Products
              </button>
              
              <button
                onClick={handleAddNew}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'add-product'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
              
              <button
                onClick={() => setCurrentView('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'analytics'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Analytics
              </button>
              
              <button
                onClick={() => setCurrentView('blackbox')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'blackbox'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database className="w-5 h-5" />
                BlackBox Data
              </button>
              
              <button
                onClick={() => setCurrentView('content')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'content'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Video className="w-5 h-5" />
                Content Manager
              </button>
              
              <button
                onClick={() => setCurrentView('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition ${
                  currentView === 'settings'
                    ? 'bg-orange-100 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {currentView === 'products' && (
            <ProductList onEditProduct={handleEditProduct} onAddNew={handleAddNew} />
          )}
          
          {currentView === 'add-product' && (
            <ProductForm 
              product={editingProduct}
              onSave={handleBackToList}
              onCancel={handleBackToList}
            />
          )}
          
          {currentView === 'blackbox' && <BlackBoxAnalytics />}
          
          {currentView === 'content' && (
            <div className="bg-white rounded-lg p-6">
              <ContentManager />
            </div>
          )}
          
          {currentView === 'analytics' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Total Products</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">20+</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Active Users</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">150+</p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">Monthly Sales</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">₹45,000</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Fertilizers</span>
                    <span className="font-semibold">45%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Fungicides</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Equipment</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>Others</span>
                    <span className="font-semibold">10%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentView === 'settings' && (
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Amazon Affiliate</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Affiliate Tag
                      </label>
                      <input
                        type="text"
                        defaultValue="plantsaathi-21"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Marketplace Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Enable smart recommendations</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Show eco-friendly badges</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Enable voice guidance</span>
                    </label>
                  </div>
                </div>
                
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
