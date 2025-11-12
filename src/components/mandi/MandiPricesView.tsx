import React, { useState, useEffect } from 'react';
import { TrendingUp, Search, MapPin, Calendar, IndianRupee, RefreshCw, ArrowLeft, TrendingDown, Sparkles, Filter, X, Navigation, Clock, Fuel, BarChart3 } from 'lucide-react';
import { mandiPriceService, MandiPrice } from '../../lib/mandiPriceService';
import { mandiPriceHistoryService } from '../../lib/mandiPriceHistoryService';
import { MandiPriceCharts } from './MandiPriceCharts';
import { useLanguage } from '../../hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import '../../styles/mandi-animations.css';

export const MandiPricesView: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [allPrices, setAllPrices] = useState<MandiPrice[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<MandiPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedVariety, setSelectedVariety] = useState('');
  const [commodities, setCommodities] = useState<string[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [varieties, setVarieties] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceStats, setPriceStats] = useState({ highest: 0, lowest: 0, average: 0 });
  const [sortByDistance, setSortByDistance] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [fuelCostPerKm] = useState(8); // ₹8 per km average
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    loadInitialData();
    getUserLocation();
    
    const handleUpdate = (event: any) => {
      setLastUpdateTime(event.detail.timestamp);
      loadInitialData();
    };
    
    window.addEventListener('mandiPricesUpdated', handleUpdate);
    return () => window.removeEventListener('mandiPricesUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allPrices, selectedCommodity, selectedState, selectedVariety, searchTerm, priceRange, sortByDistance, userLocation]);

  useEffect(() => {
    if (filteredPrices.length > 0) {
      const modalPrices = filteredPrices.map(p => p.modal_price).filter(p => p > 0);
      if (modalPrices.length > 0) {
        setPriceStats({
          highest: Math.max(...modalPrices),
          lowest: Math.min(...modalPrices),
          average: Math.round(modalPrices.reduce((a, b) => a + b, 0) / modalPrices.length)
        });
      }
    }
  }, [filteredPrices]);

  useEffect(() => {
    // Update varieties when commodity changes
    if (selectedCommodity && allPrices.length > 0) {
      const commodityPrices = allPrices.filter(p => p.commodity === selectedCommodity);
      const uniqueVarieties = [...new Set(commodityPrices.map(p => p.variety))].filter(Boolean);
      setVarieties(uniqueVarieties);
    } else {
      setVarieties([]);
      setSelectedVariety('');
    }
  }, [selectedCommodity, allPrices]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [statesList, commoditiesList, todayPrices] = await Promise.all([
        mandiPriceService.getAvailableStates(),
        mandiPriceService.getAvailableCommodities(),
        mandiPriceService.getTodaysPrices(),
      ]);
      
      setStates(statesList);
      setCommodities(commoditiesList);
      
      // Add crop images
      let enrichedPrices = mandiPriceService.addCropImages(todayPrices);
      
      // Sort by location if enabled
      if (sortByDistance && userLocation) {
        enrichedPrices = await mandiPriceService.sortByLocation(enrichedPrices, userLocation.lat, userLocation.lon);
      }
      
      setAllPrices(enrichedPrices);
      setLastUpdateTime(mandiPriceService.getLastUpdateTime());
    } catch (error) {
      console.error('Error loading mandi data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 300000
        });
      });
      setUserLocation({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      });
    } catch (error) {
      console.log('Location access denied or unavailable');
    }
  };

  const applyFilters = async () => {
    let filtered = [...allPrices];

    // Apply state filter
    if (selectedState) {
      filtered = filtered.filter(p => p.state === selectedState);
    }

    // Apply commodity filter
    if (selectedCommodity) {
      filtered = filtered.filter(p => p.commodity === selectedCommodity);
    }

    // Apply variety filter
    if (selectedVariety) {
      filtered = filtered.filter(p => p.variety === selectedVariety);
    }

    // Apply price range filter
    filtered = filtered.filter(p => 
      p.modal_price >= priceRange.min && p.modal_price <= priceRange.max
    );

    // Apply search filter (comprehensive)
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.commodity.toLowerCase().includes(search) ||
        p.variety.toLowerCase().includes(search) ||
        p.market.toLowerCase().includes(search) ||
        p.district.toLowerCase().includes(search) ||
        p.state.toLowerCase().includes(search)
      );
    }

    // Sort by distance if enabled
    if (sortByDistance && userLocation) {
      filtered = await mandiPriceService.sortByLocation(filtered, userLocation.lat, userLocation.lon);
    }

    setFilteredPrices(filtered);
  };

  const handleRefresh = async () => {
    mandiPriceService.clearCache();
    await loadInitialData();
  };

  const clearFilters = () => {
    setSelectedCommodity('');
    setSelectedState('');
    setSelectedVariety('');
    setSearchTerm('');
    setPriceRange({ min: 0, max: 100000 });
  };

  const hasActiveFilters = selectedState || selectedCommodity || selectedVariety || searchTerm || priceRange.min > 0 || priceRange.max < 100000;

  const getPriceColor = (price: number) => {
    if (price >= priceStats.highest * 0.9) return 'text-green-600';
    if (price <= priceStats.lowest * 1.1) return 'text-red-600';
    return 'text-blue-600';
  };

  const getPriceTrend = (price: number) => {
    if (price >= priceStats.highest * 0.9) return { icon: TrendingUp, text: '↑ High', color: 'text-green-600' };
    if (price <= priceStats.lowest * 1.1) return { icon: TrendingDown, text: '↓ Low', color: 'text-red-600' };
    return { icon: IndianRupee, text: '→ Avg', color: 'text-blue-600' };
  };

  const calculateTransportCost = (distance?: number) => {
    if (!distance || distance >= 9999) return null;
    return Math.round(distance * fuelCostPerKm * 2); // Round trip
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      {/* Sticky Header - FIXED */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg shadow-lg border-b border-green-100">
        <div className="p-4">
          {/* Top Bar */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-green-50 rounded-lg transition-all active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg animate-pulse">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {t('mandiPrices') || 'Mandi Prices'}
                    <Sparkles className="w-4 h-4 text-yellow-500 animate-bounce" />
                  </h1>
                  <p className="text-xs text-gray-600">
                    {filteredPrices.length} markets • Live prices
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowCharts(!showCharts)}
              className={`p-2 rounded-lg transition-all active:scale-95 ${showCharts ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'}`}
            >
              <BarChart3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-all active:scale-95 ${hasActiveFilters ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600'}`}
            >
              <Filter className={`w-5 h-5 ${showFilters ? 'rotate-180' : ''} transition-transform`} />
            </button>
          </div>

          {/* Quick Stats Bar - Always Visible */}
          {filteredPrices.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="stat-item bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2.5 text-center transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <p className="text-xs text-green-700 font-medium">Highest</p>
                </div>
                <p className="text-base font-bold text-green-600">₹{priceStats.highest}</p>
              </div>
              <div className="stat-item bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2.5 text-center transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee className="w-3 h-3 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">Average</p>
                </div>
                <p className="text-base font-bold text-blue-600">₹{priceStats.average}</p>
              </div>
              <div className="stat-item bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2.5 text-center transform hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <p className="text-xs text-red-700 font-medium">Lowest</p>
                </div>
                <p className="text-base font-bold text-red-600">₹{priceStats.lowest}</p>
              </div>
            </div>
          )}

          {/* Collapsible Filters */}
          <div className={`overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-3">
              {/* Row 1: State & Commodity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {t('selectState') || 'State'}
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all text-sm"
                  >
                    <option value="">{t('allStates') || 'All States'}</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {t('selectCommodity') || 'Commodity'}
                  </label>
                  <select
                    value={selectedCommodity}
                    onChange={(e) => setSelectedCommodity(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all text-sm"
                  >
                    <option value="">{t('allCommodities') || 'All Commodities'}</option>
                    {commodities.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Variety (conditional) */}
              {varieties.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Variety</label>
                  <select
                    value={selectedVariety}
                    onChange={(e) => setSelectedVariety(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all text-sm"
                  >
                    <option value="">All Varieties</option>
                    {varieties.map(variety => (
                      <option key={variety} value={variety}>{variety}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Row 3: Search */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Search className="w-3 h-3" />
                  {t('search') || 'Search'}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search commodity, market, district..."
                    className="w-full pl-10 pr-10 py-2 border-2 border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Row 4: Sort Toggle & Actions */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-blue-100">
                <div className="flex items-center gap-2">
                  <Navigation className={`w-4 h-4 ${sortByDistance ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700">Sort by Distance</span>
                </div>
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    sortByDistance ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      sortByDistance ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 5: Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all active:scale-95 shadow-lg text-sm font-medium"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {t('refresh') || 'Refresh'}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all active:scale-95 flex items-center gap-2 text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>

              {/* Last Update Time */}
              {lastUpdateTime && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {lastUpdateTime.toLocaleString('en-IN', { 
                    day: 'numeric', 
                    month: 'short', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Price Charts Section */}
        {showCharts && (
          <div className="mb-6 animate-slide-in-up">
            <div className="bg-white rounded-2xl shadow-lg p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h2 className="font-bold text-lg text-gray-800">
                    {selectedCommodity ? `${selectedCommodity} Price Trend` : 'Market Overview'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowCharts(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <MandiPriceCharts commodity={selectedCommodity} state={selectedState} />
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600"></div>
              <IndianRupee className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-green-600 animate-pulse" />
            </div>
            <p className="mt-6 text-gray-600 font-medium animate-pulse">{t('loadingPrices') || 'Loading prices...'}</p>
          </div>
        ) : filteredPrices.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{t('noPricesFound') || 'No prices found'}</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all active:scale-95 shadow-lg"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrices.map((price, index) => {
              const trend = getPriceTrend(price.modal_price);
              const TrendIcon = trend.icon;
              const transportCost = calculateTransportCost(price.distance);
              
              return (
                <div 
                  key={index} 
                  className="mandi-card animate-slide-in-up group bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header with Gradient and Crop Image */}
                  <div className="bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    <div className="relative flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {price.cropImage && (
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                            <img 
                              src={price.cropImage} 
                              alt={price.commodity}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white mb-1 truncate">{price.commodity}</h3>
                          <p className="text-sm text-white/90 truncate">{price.variety}</p>
                          {price.distance !== undefined && price.distance < 9999 && (
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full">
                              <Navigation className="w-3 h-3 text-white" />
                              <span className="text-xs text-white font-medium">{Math.round(price.distance)} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
                        <TrendIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Price Grid */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-red-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-red-600 font-medium mb-1">Min</p>
                        <p className="text-sm font-bold text-red-700">₹{price.min_price}</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2 text-center ring-2 ring-blue-200">
                        <p className="text-xs text-blue-600 font-medium mb-1">Modal</p>
                        <p className={`text-sm font-bold ${getPriceColor(price.modal_price)}`}>₹{price.modal_price}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-2 text-center">
                        <p className="text-xs text-green-600 font-medium mb-1">Max</p>
                        <p className="text-sm font-bold text-green-700">₹{price.max_price}</p>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                        per {price.unit}
                      </span>
                    </div>

                    {/* Transport Cost */}
                    {transportCost && (
                      <div className="mb-4 flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-orange-600" />
                          <span className="text-xs text-orange-700 font-medium">Transport Cost</span>
                        </div>
                        <span className="text-sm font-bold text-orange-600">₹{transportCost}</span>
                      </div>
                    )}

                    {/* Location & Date */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-blue-50 rounded">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <span className="flex-1 truncate">{price.market}, {price.district}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="p-1.5 bg-purple-50 rounded">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <span>{new Date(price.arrival_date).toLocaleDateString('en-IN', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}</span>
                      </div>
                    </div>

                    {/* Price Indicator */}
                    {price.modal_price >= priceStats.highest * 0.9 && (
                      <div className="price-indicator mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <TrendingUp className="w-4 h-4 text-green-600 animate-bounce" />
                        <span className="text-xs font-bold text-green-700">🎯 Best Price!</span>
                      </div>
                    )}
                    {price.modal_price <= priceStats.lowest * 1.1 && (
                      <div className="price-indicator mt-3 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                        <TrendingDown className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-bold text-red-700">⚠️ Lower Price</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
