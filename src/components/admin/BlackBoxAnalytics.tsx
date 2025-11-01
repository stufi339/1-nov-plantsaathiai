import { useState, useMemo, useEffect } from 'react';
import { 
  Database, Download, Filter, Search, MapPin, Calendar,
  TrendingUp, Users, Activity, AlertCircle, Package, Cloud,
  Leaf, Bug, ShoppingCart, BarChart3, Eye, RefreshCw
} from 'lucide-react';
import { blackBoxAnalyticsService, type AnalyticsEntry } from '@/lib/blackBoxAnalyticsService';

// Re-export type for convenience
type BlackBoxEntry = AnalyticsEntry;

interface FilterOptions {
  dateRange: { start: string; end: string };
  state: string;
  district: string;
  village: string;
  dataType: string;
  searchQuery: string;
}

export const BlackBoxAnalytics = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { start: '', end: '' },
    state: '',
    district: '',
    village: '',
    dataType: 'all',
    searchQuery: ''
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'stats'>('stats');
  const [selectedEntry, setSelectedEntry] = useState<BlackBoxEntry | null>(null);
  const [allData, setAllData] = useState<BlackBoxEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real data from BlackBox service
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true);
        const entries = blackBoxAnalyticsService.getEntries();
        console.log('BlackBox Analytics: Loaded', entries.length, 'entries');
        
        // Debug: Log sample entry to check structure
        if (entries.length > 0) {
          console.log('Sample entry:', entries[0]);
        }
        
        setAllData(entries);
      } catch (error) {
        console.error('Failed to load BlackBox data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    console.log('Filtering with:', filters);
    
    const filtered = allData.filter(entry => {
      // Date range filter
      if (filters.dateRange.start) {
        const entryDate = new Date(entry.timestamp);
        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        if (entryDate < startDate) {
          return false;
        }
      }
      
      if (filters.dateRange.end) {
        const entryDate = new Date(entry.timestamp);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        if (entryDate > endDate) {
          return false;
        }
      }

      // Location filters
      if (filters.state && filters.state !== '') {
        if (!entry.location?.state || entry.location.state !== filters.state) {
          return false;
        }
      }
      
      if (filters.district && filters.district !== '') {
        if (!entry.location?.district || entry.location.district !== filters.district) {
          return false;
        }
      }
      
      if (filters.village && filters.village !== '') {
        if (!entry.location?.village || entry.location.village !== filters.village) {
          return false;
        }
      }

      // Data type filter
      if (filters.dataType && filters.dataType !== 'all') {
        if (entry.type !== filters.dataType) {
          return false;
        }
      }

      // Search query
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = JSON.stringify(entry).toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      return true;
    });
    
    console.log('Filtered results:', filtered.length, 'of', allData.length);
    return filtered;
  }, [allData, filters]);

  // Get unique values for dropdowns
  const uniqueStates = useMemo(() => 
    [...new Set(allData.map(e => e.location?.state).filter(Boolean))].sort(),
    [allData]
  );

  const uniqueDistricts = useMemo(() => 
    [...new Set(allData
      .filter(e => !filters.state || e.location?.state === filters.state)
      .map(e => e.location?.district)
      .filter(Boolean))].sort(),
    [allData, filters.state]
  );

  const uniqueVillages = useMemo(() => 
    [...new Set(allData
      .filter(e => !filters.district || e.location?.district === filters.district)
      .map(e => e.location?.village)
      .filter(Boolean))].sort(),
    [allData, filters.district]
  );

  // Calculate statistics
  const stats = useMemo(() => {
    const typeCount: Record<string, number> = {};
    const stateCount: Record<string, number> = {};
    const errorCount = filteredData.filter(e => e.type === 'error').length;
    const uniqueUsers = new Set(filteredData.map(e => e.userId)).size;
    const uniqueFields = new Set(filteredData.map(e => e.fieldId)).size;

    filteredData.forEach(entry => {
      typeCount[entry.type] = (typeCount[entry.type] || 0) + 1;
      if (entry.location?.state) {
        stateCount[entry.location.state] = (stateCount[entry.location.state] || 0) + 1;
      }
    });

    return { typeCount, stateCount, errorCount, uniqueUsers, uniqueFields };
  }, [filteredData]);

  const exportData = () => {
    const exportContent = blackBoxAnalyticsService.exportToJSON({
      dateRange: filters.dateRange.start || filters.dateRange.end ? {
        start: filters.dateRange.start ? new Date(filters.dateRange.start) : undefined,
        end: filters.dateRange.end ? new Date(filters.dateRange.end) : undefined
      } : undefined,
      state: filters.state || undefined,
      district: filters.district || undefined,
      village: filters.village || undefined,
      dataType: filters.dataType !== 'all' ? filters.dataType : undefined,
      searchQuery: filters.searchQuery || undefined
    });

    const dataBlob = new Blob([exportContent], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blackbox-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    console.log('Clearing all filters');
    setFilters({
      dateRange: { start: '', end: '' },
      state: '',
      district: '',
      village: '',
      dataType: 'all',
      searchQuery: ''
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading BlackBox data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (allData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-4">
          Start using the app to generate BlackBox analytics data.
        </p>
        <p className="text-sm text-gray-500">
          Data will appear here as users interact with soil analysis, disease detection,
          weather, marketplace, and other features.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-600" />
            BlackBox Analytics Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive data insights from all user interactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
          <button
            onClick={clearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Start Date
            </label>
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              End Date
            </label>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* State Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              State ({uniqueStates.length} available)
            </label>
            <select
              value={filters.state}
              onChange={(e) => {
                console.log('State changed:', e.target.value);
                setFilters(prev => ({ ...prev, state: e.target.value, district: '', village: '' }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              District ({uniqueDistricts.length} available)
            </label>
            <select
              value={filters.district}
              onChange={(e) => {
                console.log('District changed:', e.target.value);
                setFilters(prev => ({ ...prev, district: e.target.value, village: '' }));
              }}
              disabled={!filters.state}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Districts</option>
              {uniqueDistricts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            {!filters.state && (
              <p className="text-xs text-gray-500 mt-1">Select a state first</p>
            )}
          </div>

          {/* Village Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Village ({uniqueVillages.length} available)
            </label>
            <select
              value={filters.village}
              onChange={(e) => {
                console.log('Village changed:', e.target.value);
                setFilters(prev => ({ ...prev, village: e.target.value }));
              }}
              disabled={!filters.district}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">All Villages</option>
              {uniqueVillages.map(village => (
                <option key={village} value={village}>{village}</option>
              ))}
            </select>
            {!filters.district && (
              <p className="text-xs text-gray-500 mt-1">Select a district first</p>
            )}
          </div>

          {/* Data Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Activity className="w-4 h-4 inline mr-1" />
              Data Type
            </label>
            <select
              value={filters.dataType}
              onChange={(e) => {
                console.log('Data type changed:', e.target.value);
                setFilters(prev => ({ ...prev, dataType: e.target.value }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="vegetation">Soil/Vegetation</option>
              <option value="disease">Disease Detection</option>
              <option value="weather">Weather</option>
              <option value="marketplace">Marketplace</option>
              <option value="field_access">Field Access</option>
              <option value="user_interaction">User Interactions</option>
              <option value="audio">Audio</option>
              <option value="error">Errors</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>

          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search in all fields..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('stats')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'stats' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Statistics
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('cards')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          Card View
        </button>
      </div>

      {/* Results Count */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
        <p className="text-blue-800">
          Showing <span className="font-bold">{filteredData.length}</span> of{' '}
          <span className="font-bold">{allData.length}</span> total entries
        </p>
        <button
          onClick={() => {
            setIsLoading(true);
            const entries = blackBoxAnalyticsService.getEntries();
            setAllData(entries);
            setIsLoading(false);
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Statistics View */}
      {viewMode === 'stats' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-6 h-6" />}
              title="Total Interactions"
              value={filteredData.length}
              color="blue"
            />
            <StatCard
              icon={<Users className="w-6 h-6" />}
              title="Unique Users"
              value={stats.uniqueUsers}
              color="green"
            />
            <StatCard
              icon={<Leaf className="w-6 h-6" />}
              title="Fields Tracked"
              value={stats.uniqueFields}
              color="emerald"
            />
            <StatCard
              icon={<AlertCircle className="w-6 h-6" />}
              title="Errors Logged"
              value={stats.errorCount}
              color="red"
            />
          </div>

          {/* Data Type Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Data Type Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stats.typeCount).map(([type, count]) => (
                <div key={type} className="flex items-center gap-3">
                  <div className="w-32 font-medium capitalize flex items-center gap-2">
                    {getIconForType(type)}
                    {type}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(count / filteredData.length) * 100}%` }}
                    >
                      <span className="text-white text-xs font-semibold">{count}</span>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-600">
                    {((count / filteredData.length) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* State Distribution */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(stats.stateCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([state, count]) => (
                  <div key={state} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{state}</span>
                    <span className="text-blue-600 font-semibold">{count} entries</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Field ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.slice(0, 50).map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                        {getIconForType(entry.type)}
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {entry.location?.village}, {entry.location?.district}, {entry.location?.state}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{entry.userId}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{entry.fieldId}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredData.length > 50 && (
            <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
              Showing first 50 entries. Export data to see all {filteredData.length} entries.
            </div>
          )}
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.slice(0, 30).map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                  {getIconForType(entry.type)}
                  {entry.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{entry.location?.village}, {entry.location?.district}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-mono text-xs">{entry.userId}</span>
                </div>
                {entry.fieldId && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Leaf className="w-4 h-4" />
                    <span className="font-mono text-xs">{entry.fieldId}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedEntry(entry)}
                className="mt-3 w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Details →
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Entry Details</h3>
              <button
                onClick={() => setSelectedEntry(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(selectedEntry, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, title, value, color }: any) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
};

// Helper Functions
function getIconForType(type: string) {
  const icons: Record<string, JSX.Element> = {
    vegetation: <Leaf className="w-4 h-4" />,
    disease: <Bug className="w-4 h-4" />,
    weather: <Cloud className="w-4 h-4" />,
    marketplace: <ShoppingCart className="w-4 h-4" />,
    field_access: <Activity className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />
  };
  return icons[type] || <Activity className="w-4 h-4" />;
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    vegetation: 'bg-green-100 text-green-700',
    disease: 'bg-red-100 text-red-700',
    weather: 'bg-blue-100 text-blue-700',
    marketplace: 'bg-orange-100 text-orange-700',
    field_access: 'bg-purple-100 text-purple-700',
    error: 'bg-red-100 text-red-700'
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

// Helper function removed - using real data now
