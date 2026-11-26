import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ChargerCard from '../components/ChargerCard';
import ChargerMap from '../components/ChargerMap';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Zap,
  Filter,
  Grid,
  Map as MapIcon,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function FindChargersPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [equipmentType, setEquipmentType] = useState('ALL');
  const [isDedicatedOnly, setIsDedicatedOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState(20);
  const [maxPrice, setMaxPrice] = useState(50);
  const [sortBy, setSortBy] = useState('distance'); // 'distance' | 'price' | 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'split'

  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);

  // User coordinate (Chennai center: T. Nagar)
  const userCoords = { lat: 13.0418, lng: 80.2341 };

  useEffect(() => {
    fetchChargers();
  }, [category, equipmentType, isDedicatedOnly, maxDistance, maxPrice]);

  const fetchChargers = async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        equipmentType: equipmentType !== 'ALL' ? equipmentType : undefined,
        isDedicatedEvse: isDedicatedOnly ? 'true' : undefined,
        maxDistance,
        maxPrice,
        userLat: userCoords.lat,
        userLng: userCoords.lng
      };

      const res = await api.getChargers(params);
      if (res.success && res.chargers) {
        setChargers(res.chargers);
      }
    } catch (err) {
      console.error('Failed to query chargers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchChargers();
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setEquipmentType('ALL');
    setIsDedicatedOnly(false);
    setMaxDistance(20);
    setMaxPrice(50);
    setSortBy('distance');
  };

  const sortedChargers = [...chargers].sort((a, b) => {
    if (sortBy === 'price') return (a.pricePerHour || 0) - (b.pricePerHour || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
  });

  const categories = [
    { id: 'ALL', label: 'All Plugs' },
    { id: 'RESIDENTIAL', label: '🏠 Homes & Porches' },
    { id: 'CAFE', label: '☕ Cafes & Dining' },
    { id: 'SHOP', label: '🛍️ Shops & Retail' },
    { id: 'OFFICE', label: '🏢 Tech Parks' },
    { id: 'PARKING', label: '🅿️ Parking Bays' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-brand-400" />
            <span>Find Nearby EV Charging Points</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified peer-to-peer charging locations in Chennai with tested earth grounding.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-navy-900 border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
              viewMode === 'grid'
                ? 'bg-brand-500 text-navy-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid View</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors ${
              viewMode === 'split'
                ? 'bg-brand-500 text-navy-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map & List</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-4">
        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white">
            <Search className="w-4 h-4 text-brand-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by neighborhood, street, or host (e.g. T. Nagar, Adyar, Velachery)..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs sm:text-sm transition-all shadow-glow flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                category === cat.id
                  ? 'bg-brand-500 text-navy-950 border-brand-400 shadow-sm'
                  : 'bg-navy-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Detailed Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80 text-xs">
          {/* Dedicated EVSE filter */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold select-none">
              <input
                type="checkbox"
                checked={isDedicatedOnly}
                onChange={(e) => setIsDedicatedOnly(e.target.checked)}
                className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-navy-950"
              />
              <span>Dedicated Level 2 EVSE Only</span>
            </label>
          </div>

          {/* Distance Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>Max Distance:</span>
              <span className="text-brand-400">{maxDistance} km</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={maxDistance}
              onChange={(e) => setMaxDistance(parseInt(e.target.value))}
              className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Max Price Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300 font-semibold">
              <span>Max Price / Hr:</span>
              <span className="text-brand-400">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Reset Filters button */}
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Count & Sort Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-bold">{sortedChargers.length}</strong> available charging points in Chennai
        </span>
        <div className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1 rounded-xl bg-navy-900 border border-slate-700 text-brand-400 font-semibold text-xs focus:outline-none"
          >
            <option value="distance">Nearest to You</option>
            <option value="price">Price: Low to High</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Content Rendering based on ViewMode */}
      {viewMode === 'grid' ? (
        /* Grid View */
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-navy-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : sortedChargers.length === 0 ? (
          <div className="p-12 rounded-3xl bg-navy-900/60 border border-slate-800 text-center space-y-3">
            <Zap className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No charging points match your criteria</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your distance slider, category filter, or resetting search keywords.
            </p>
            <button
              onClick={resetFilters}
              className="py-2 px-4 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedChargers.map((c) => (
              <ChargerCard key={c.id} charger={c} />
            ))}
          </div>
        )
      ) : (
        /* Split Map & List View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4 max-h-[800px] overflow-y-auto pr-1">
            {sortedChargers.map((c) => (
              <ChargerCard key={c.id} charger={c} />
            ))}
          </div>
          <div className="lg:col-span-7 sticky top-24">
            <ChargerMap
              chargers={sortedChargers}
              center={[userCoords.lat, userCoords.lng]}
              zoom={12}
              userLocation={userCoords}
              height="650px"
            />
          </div>
        </div>
      )}
    </div>
  );
}

