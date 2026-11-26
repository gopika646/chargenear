import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChargerMap from '../components/ChargerMap';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Zap,
  Star,
  ArrowRight,
  ShieldCheck,
  Compass,
  X,
  Building2
} from 'lucide-react';

export default function MapPage() {
  const [chargers, setChargers] = useState([]);
  const [filteredChargers, setFilteredChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activePin, setActivePin] = useState(null);

  // User location: Chennai Central (T. Nagar)
  const userLocation = { lat: 13.0418, lng: 80.2341 };

  useEffect(() => {
    async function loadMapData() {
      try {
        const res = await api.getChargers({
          userLat: userLocation.lat,
          userLng: userLocation.lng
        });
        if (res.success && res.chargers) {
          setChargers(res.chargers);
          setFilteredChargers(res.chargers);
        }
      } catch (err) {
        console.error('Failed to load map chargers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

  useEffect(() => {
    let result = chargers;

    if (selectedCategory !== 'ALL') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          (c.landmark && c.landmark.toLowerCase().includes(q))
      );
    }

    setFilteredChargers(result);
  }, [search, selectedCategory, chargers]);

  const categories = [
    { id: 'ALL', label: 'All Plugs' },
    { id: 'RESIDENTIAL', label: 'Homes' },
    { id: 'CAFE', label: 'Cafes' },
    { id: 'SHOP', label: 'Shops' },
    { id: 'OFFICE', label: 'Offices' },
    { id: 'PARKING', label: 'Parking' }
  ];

  return (
    <div className="relative w-full h-[calc(100vh-4.5rem)] overflow-hidden">
      {/* Floating Search & Category Controls Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 max-w-xl mx-auto space-y-2 pointer-events-auto">
        <div className="p-2 rounded-2xl bg-navy-950/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 text-slate-300">
            <Search className="w-4 h-4 text-brand-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter map by area: T. Nagar, Adyar, Velachery..."
              className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-[11px] font-bold text-brand-400 px-3 py-1 rounded-xl bg-brand-500/10 border border-brand-500/20 whitespace-nowrap">
            {filteredChargers.length} Plugs
          </div>
        </div>

        {/* Category Pills Overlay */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-center">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`py-1 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-md backdrop-blur-md border ${
                selectedCategory === c.id
                  ? 'bg-brand-500 text-navy-950 border-brand-400'
                  : 'bg-navy-950/85 text-slate-200 border-slate-700/80 hover:bg-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Bottom Legend */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-3 p-3 rounded-2xl bg-navy-950/90 border border-slate-800/80 backdrop-blur-md text-[11px] text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-400/30" />
          <span>Level 2 EVSE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-sky-500 ring-2 ring-sky-400/30" />
          <span>16A Earth Socket</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400 ring-4 ring-sky-400/20 animate-pulse" />
          <span>You</span>
        </div>
      </div>

      {/* Full Size Leaflet Map */}
      <ChargerMap
        chargers={filteredChargers}
        center={[userLocation.lat, userLocation.lng]}
        zoom={12}
        userLocation={userLocation}
        height="100%"
      />
    </div>
  );
}

