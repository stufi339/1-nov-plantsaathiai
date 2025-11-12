import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { mandiPriceHistoryService, PriceTrend } from '@/lib/mandiPriceHistoryService';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';

interface MandiPriceChartsProps {
  commodity?: string;
  state?: string;
}

export const MandiPriceCharts = ({ commodity, state }: MandiPriceChartsProps) => {
  const { t } = useTranslation();
  const [trend, setTrend] = useState<PriceTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [topGainers, setTopGainers] = useState<PriceTrend[]>([]);
  const [topLosers, setTopLosers] = useState<PriceTrend[]>([]);

  useEffect(() => {
    loadData();
  }, [commodity, state]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (commodity) {
        const trendData = await mandiPriceHistoryService.getPriceTrend(commodity, state);
        setTrend(trendData);
      } else {
        // Load market overview
        const [gainers, losers] = await Promise.all([
          mandiPriceHistoryService.getTopGainers(5),
          mandiPriceHistoryService.getTopLosers(5)
        ]);
        setTopGainers(gainers);
        setTopLosers(losers);
      }
    } catch (error) {
      console.error('Error loading price data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  // Single commodity view with trend chart
  if (commodity && trend) {
    const maxPrice = Math.max(...trend.history.map(h => h.price));
    const minPrice = Math.min(...trend.history.map(h => h.price));
    const priceRange = maxPrice - minPrice;

    return (
      <div className="space-y-4">
        {/* Price Trend Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg capitalize">{commodity}</h3>
              <p className="text-sm text-gray-600">30-Day Price Trend</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">₹{trend.currentPrice}</div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend.trend === 'up' ? 'text-green-600' : 
                trend.trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {trend.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {trend.trend === 'stable' && <Minus className="w-4 h-4" />}
                {trend.changePercent > 0 ? '+' : ''}{trend.changePercent}%
              </div>
            </div>
          </div>

          {/* Simple Line Chart */}
          <div className="relative h-40 bg-gradient-to-b from-blue-50 to-white rounded-lg p-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="25" x2="100" y2="25" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" />
              <line x1="0" y1="75" x2="100" y2="75" stroke="#e5e7eb" strokeWidth="0.5" />
              
              {/* Price line */}
              <polyline
                points={trend.history.map((point, i) => {
                  const x = (i / (trend.history.length - 1)) * 100;
                  const y = 100 - ((point.price - minPrice) / priceRange) * 80 - 10;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={trend.trend === 'up' ? '#10b981' : trend.trend === 'down' ? '#ef4444' : '#6b7280'}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* Area under line */}
              <polygon
                points={`0,100 ${trend.history.map((point, i) => {
                  const x = (i / (trend.history.length - 1)) * 100;
                  const y = 100 - ((point.price - minPrice) / priceRange) * 80 - 10;
                  return `${x},${y}`;
                }).join(' ')} 100,100`}
                fill={trend.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 
                      trend.trend === 'down' ? 'rgba(239, 68, 68, 0.1)' : 
                      'rgba(107, 114, 128, 0.1)'}
              />
            </svg>
            
            {/* Price labels */}
            <div className="absolute top-2 left-2 text-xs text-gray-500">₹{maxPrice}</div>
            <div className="absolute bottom-2 left-2 text-xs text-gray-500">₹{minPrice}</div>
          </div>

          {/* Date range */}
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {trend.history[0]?.date}
            </span>
            <span>{trend.history[trend.history.length - 1]?.date}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-xs text-blue-600 mb-1">Current</div>
            <div className="text-lg font-bold text-blue-900">₹{trend.currentPrice}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 text-center">
            <div className="text-xs text-purple-600 mb-1">Previous</div>
            <div className="text-lg font-bold text-purple-900">₹{trend.previousPrice}</div>
          </div>
          <div className={`rounded-lg p-3 text-center ${
            trend.trend === 'up' ? 'bg-green-50' : 
            trend.trend === 'down' ? 'bg-red-50' : 
            'bg-gray-50'
          }`}>
            <div className={`text-xs mb-1 ${
              trend.trend === 'up' ? 'text-green-600' : 
              trend.trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>Change</div>
            <div className={`text-lg font-bold ${
              trend.trend === 'up' ? 'text-green-900' : 
              trend.trend === 'down' ? 'text-red-900' : 
              'text-gray-900'
            }`}>
              {trend.change > 0 ? '+' : ''}₹{trend.change}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Market overview with top gainers and losers
  return (
    <div className="space-y-4">
      {/* Top Gainers */}
      {topGainers.length > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold text-green-900">Top Gainers</h3>
          </div>
          <div className="space-y-2">
            {topGainers.map((item, i) => (
              <div key={i} className="bg-white/80 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold capitalize text-sm">{item.commodity}</div>
                  <div className="text-xs text-gray-600">₹{item.currentPrice}/quintal</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold text-sm">+{item.changePercent}%</div>
                  <div className="text-xs text-gray-600">+₹{item.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Losers */}
      {topLosers.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-red-900">Top Losers</h3>
          </div>
          <div className="space-y-2">
            {topLosers.map((item, i) => (
              <div key={i} className="bg-white/80 rounded-lg p-3 flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold capitalize text-sm">{item.commodity}</div>
                  <div className="text-xs text-gray-600">₹{item.currentPrice}/quintal</div>
                </div>
                <div className="text-right">
                  <div className="text-red-600 font-bold text-sm">{item.changePercent}%</div>
                  <div className="text-xs text-gray-600">₹{item.change}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No data message */}
      {topGainers.length === 0 && topLosers.length === 0 && (
        <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
          <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <h3 className="font-bold text-blue-900 mb-2">Building Price History</h3>
          <p className="text-sm text-blue-700">
            Price trends will appear here once we collect historical data.
            Check back tomorrow!
          </p>
        </div>
      )}
    </div>
  );
};
