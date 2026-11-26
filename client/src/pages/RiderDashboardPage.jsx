import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ChargerCard from '../components/ChargerCard';
import ChargerMap from '../components/ChargerMap';
import EvSavingsCalculator from '../components/EvSavingsCalculator';
import {
  Zap,
  MapPin,
  Calendar,
  Clock,
  BatteryCharging,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Star
} from 'lucide-react';

export default function RiderDashboardPage() {
  const { user } = useAuth();
  const [nearbyChargers, setNearbyChargers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Rider coordinates (Chennai center default)
  const riderLocation = { lat: 13.0418, lng: 80.2341 };

  const avgNearbyPrice = nearbyChargers.length > 0
    ? Math.round(nearbyChargers.reduce((sum, c) => sum + (c.pricePerHour || 0), 0) / nearbyChargers.length)
    : 35;

  const completedCount = recentBookings.filter(b => b.status === 'COMPLETED').length;
  const riderCarbonSaved = (completedCount > 0 ? (completedCount * 4.2).toFixed(1) : '4.2');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [chargersRes, bookingsRes, recsRes] = await Promise.all([
          api.getChargers({ userLat: riderLocation.lat, userLng: riderLocation.lng, limit: 6 }),
          api.getMyBookings(),
          api.getRecommendations({
            userLat: riderLocation.lat,
            userLng: riderLocation.lng,
            vehicleModel: user?.vehicleModel || 'Ather 450X'
          })
        ]);

        if (chargersRes.success && chargersRes.chargers) {
          setNearbyChargers(chargersRes.chargers);
        }
        if (bookingsRes.success && bookingsRes.bookings) {
          setRecentBookings(bookingsRes.bookings.slice(0, 3));
        }
        if (recsRes.success && recsRes.recommendations) {
          setRecommendations(recsRes.recommendations);
        }
      } catch (err) {
        console.error('Error loading rider dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/chargers?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/chargers');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
              Rider Hub
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" /> Chennai, TN
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome, {user?.name || 'EV Rider'}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            You have <strong className="text-brand-400">{nearbyChargers.length} verified charging points</strong> near you. Ready to power your ride today?
          </p>
        </div>

        {/* Vehicle Spec Card */}
        <div className="p-4 rounded-2xl bg-navy-950/90 border border-slate-700/80 backdrop-blur-md flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <BatteryCharging className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Connected Ride</span>
            <span className="text-sm font-extrabold text-white block">{user?.vehicleModel || 'Electric Two-Wheeler'}</span>
            <span className="text-[11px] text-brand-300 font-medium">
              {user?.vehicleNumber ? `${user.vehicleNumber} • ` : ''}{user?.batteryCapacityKwh ? `${user.batteryCapacityKwh} kWh Pack` : '16A Plug Compatible'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Location Search & Filter Trigger */}
      <form
        onSubmit={handleSearch}
        className="p-2 rounded-2xl bg-navy-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-2 shadow-lg"
      >
        <div className="flex-1 flex items-center gap-3 px-3 py-2 text-slate-300 w-full">
          <Search className="w-4 h-4 text-brand-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by area: T. Nagar, Adyar, Velachery, Besant Nagar..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs sm:text-sm transition-all shadow-glow flex items-center justify-center gap-2"
        >
          <span>Find Nearby Plugs</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Nearby Sockets</span>
          <span className="text-2xl font-black text-white mt-1 block">{nearbyChargers.length}</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Within 15 km of T. Nagar</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Average Price</span>
          <span className="text-2xl font-black text-brand-400 mt-1 block">₹{avgNearbyPrice}<span className="text-xs text-slate-400 font-normal">/hr</span></span>
          <span className="text-[10px] text-slate-400 mt-1 block">Solar & 16A verified</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Active Bookings</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {recentBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length}
          </span>
          <span className="text-[10px] text-brand-300 mt-1 block">Upcoming active slots</span>
        </div>
        <div className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block uppercase">Carbon Saved</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">{riderCarbonSaved} <span className="text-xs font-normal">kg</span></span>
          <span className="text-[10px] text-slate-400 mt-1 block">Through clean EV commutes</span>
        </div>
      </div>

      {/* Smart Recommendations Section (Section 10) */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span>Smart Recommendations for Your {user?.vehicleModel || 'EV Ride'}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Ranked by distance, socket compatibility, pricing advantage, and certified earthing.
              </p>
            </div>
            <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-xl border border-brand-500/20 hidden sm:inline-block">
              ⚡ Smart Match Engine
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-3xl bg-navy-900 border border-brand-500/30 hover:border-brand-500 flex flex-col justify-between space-y-3 transition-all hover:shadow-glow group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500 text-navy-950 font-sans">
                      {rec.matchScore}% Match
                    </span>
                    <span className="text-xs font-bold text-white">
                      ₹{rec.pricePerHour}/hr
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-xs line-clamp-1 group-hover:text-brand-300">
                    <Link to={`/chargers/${rec.id}`}>{rec.title}</Link>
                  </h3>

                  <p className="text-[11px] text-brand-300 font-medium line-clamp-2">
                    {rec.matchReason}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">{rec.distanceKm} km away</span>
                  <Link
                    to={`/booking/${rec.id}`}
                    className="font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
                  >
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded EV Savings Calculator */}
      <EvSavingsCalculator
        initialVehicle={user?.vehicleModel || 'Ather 450X'}
        hostRatePerHour={avgNearbyPrice}
      />

      {/* Interactive Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-400" />
              <span>Interactive Charger Radar</span>
            </h2>
            <p className="text-xs text-slate-400">Click any green pin to view pricing and book immediately.</p>
          </div>
          <Link
            to="/map"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>Full Screen Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ChargerMap
          chargers={nearbyChargers}
          center={[riderLocation.lat, riderLocation.lng]}
          zoom={12}
          userLocation={riderLocation}
          height="380px"
        />
      </div>

      {/* Recent Bookings & Nearby Chargers Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Nearby Charging Points Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-400" />
              <span>Nearby Charging Points</span>
            </h2>
            <Link to="/chargers" className="text-xs font-bold text-brand-400 hover:text-brand-300">
              Browse All
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2].map(n => (
                <div key={n} className="h-64 rounded-3xl bg-navy-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nearbyChargers.slice(0, 4).map(c => (
                <ChargerCard key={c.id} charger={c} />
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Bookings & History Shortcut */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-400" />
              <span>My Recent Bookings</span>
            </h2>
            <Link to="/rider/bookings" className="text-xs font-bold text-brand-400 hover:text-brand-300">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">No bookings yet</p>
                <p className="text-[11px] text-slate-400">Book your first charging slot at a nearby host.</p>
                <Link
                  to="/chargers"
                  className="inline-block mt-2 py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
                >
                  Explore Chargers
                </Link>
              </div>
            ) : (
              recentBookings.map(b => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-navy-900/80 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white font-mono">#{b.bookingNumber}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {b.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-200 truncate">{b.location.title}</h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {b.bookingDate} • {b.startTime}
                    </span>
                    <span className="font-bold text-white">₹{b.totalAmount}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

