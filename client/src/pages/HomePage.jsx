import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ChargerCard from '../components/ChargerCard';
import {
  Zap,
  Search,
  MapPin,
  ShieldCheck,
  BatteryCharging,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Building2,
  Coffee,
  Home,
  CheckCircle2,
  Users,
  ShieldAlert
} from 'lucide-react';

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState('');
  const [featuredChargers, setFeaturedChargers] = useState([]);
  const [stats, setStats] = useState({
    totalPlugs: 10,
    totalHosts: 5,
    totalRiders: 10,
    totalBookings: 15,
    avgPricePerHour: 35,
    avgRating: 4.9,
    carbonSavedKg: 42,
    reviews: []
  });
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [chargersRes, statsRes] = await Promise.all([
          api.getChargers({ limit: 3 }),
          api.getPlatformStats()
        ]);
        if (chargersRes.success && chargersRes.chargers) {
          setFeaturedChargers(chargersRes.chargers.slice(0, 3));
        }
        if (statsRes.success && statsRes.stats) {
          setStats(statsRes.stats);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      navigate(`/chargers?search=${encodeURIComponent(searchLocation.trim())}`);
    } else {
      navigate('/chargers');
    }
  };

  const faqs = [
    {
      q: 'Can I charge any electric two-wheeler at a host location?',
      a: 'Most host locations offer heavy-duty 16A 3-pin sockets that are compatible with official portable chargers from Ather, Ola, TVS, Bajaj Chetak, and Hero Vida. Some hosts also provide Type 2 AC wallboxes. Check the charger compatibility list on each listing before booking.'
    },
    {
      q: 'How does ChargeNear ensure electrical safety?',
      a: 'Safety is our highest priority. All host listings undergo Admin Verification. We distinguish standard 16A sockets from dedicated EVSE wallboxes, mandate dedicated earth ground rods (< 3 Ohms resistance), and enforce MCB/RCCB circuit breaker protection.'
    },
    {
      q: 'How does payment and slot booking work?',
      a: 'Riders select a date, time, and duration. Our system calculates transparent pricing (Hourly rate + 5% platform fee) and prevents double booking. Payments are simulated using Razorpay test mode with immediate slot confirmation.'
    },
    {
      q: 'How can I become a ChargeNear host and earn?',
      a: 'If you have a home driveway, retail shop, cafe, or office parking space with a safe, grounded 16A socket or Level 2 EVSE, click "Become a Host". List your location, set your price per hour, and submit for verification. You keep 95% of your earnings!'
    }
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 overflow-hidden">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-brand-500/15 rounded-full blur-[130px] -z-10 pointer-events-none" />
        <div className="absolute top-36 right-10 w-[350px] h-[350px] bg-electric/10 rounded-full blur-[110px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-brand-500/30 text-brand-300 text-xs font-semibold shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <span>Peer-to-Peer EV Charging Marketplace</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Find a Charge. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-emerald-300 to-electric">
                  Wherever Life Takes You.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover nearby EV charging points at homes and local businesses. Book a slot, charge your ride, and get back on the road.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="p-2 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch gap-2 max-w-xl mx-auto lg:mx-0"
              >
                <div className="flex-1 flex items-center gap-3 px-3 py-2 text-slate-300">
                  <MapPin className="w-5 h-5 text-brand-400 shrink-0" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search Chennai: T. Nagar, Adyar, Velachery, OMR..."
                    className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-sm transition-all shadow-glow flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Search Plugs</span>
                </button>
              </form>

              {/* CTA Buttons & Social Proof */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/chargers"
                  className="px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-extrabold text-sm transition-all shadow-glow flex items-center gap-2"
                >
                  <span>Find Chargers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/host/add-charger"
                  className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-colors border border-slate-700 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-brand-400" />
                  <span>Become a Host</span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="text-2xl font-black text-white">{stats.totalPlugs}+</span>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Verified Plugs</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-brand-400">₹{stats.avgPricePerHour}</span>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Avg Price / Hr</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-white">{stats.avgRating}★</span>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Rider Rating</span>
                </div>
              </div>
            </div>

            {/* Right Hero Illustration: EV Scooter & Charging Dock */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square rounded-3xl bg-gradient-to-b from-navy-900 to-navy-950 p-6 border border-slate-800 shadow-2xl flex flex-col justify-between overflow-hidden">
                {/* Decorative electric waves */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

                {/* Floating status badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950/80 border border-brand-500/30 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold text-white">Live Station • T. Nagar</span>
                  </div>
                  <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                    3.3 kW Port
                  </span>
                </div>

                {/* SVG Illustration of Electric Scooter + EV Charging Cable */}
                <div className="relative z-10 py-6 flex items-center justify-center">
                  <svg
                    className="w-full max-w-[280px] h-auto drop-shadow-[0_15px_30px_rgba(16,185,129,0.3)]"
                    viewBox="0 0 320 220"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Floor glow */}
                    <ellipse cx="160" cy="195" rx="130" ry="12" fill="#10b981" fillOpacity="0.15" />

                    {/* Charging Station Pedestal */}
                    <rect x="250" y="70" width="28" height="120" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    <circle cx="264" cy="95" r="7" fill="#10b981" className="animate-pulse" />
                    <rect x="257" y="112" width="14" height="6" rx="2" fill="#00F090" />
                    <rect x="257" y="125" width="14" height="2" fill="#64748b" />
                    <rect x="257" y="131" width="14" height="2" fill="#64748b" />

                    {/* Electric Cable running to Scooter */}
                    <path
                      d="M250 140 C 220 160, 190 200, 150 170 C 130 155, 125 150, 120 148"
                      stroke="#00F090"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="6 3"
                    />

                    {/* Electric Scooter Body */}
                    {/* Rear Wheel */}
                    <circle cx="80" cy="175" r="24" fill="#0f172a" stroke="#334155" strokeWidth="4" />
                    <circle cx="80" cy="175" r="12" fill="#1e293b" />
                    <circle cx="80" cy="175" r="4" fill="#00F090" />

                    {/* Front Wheel */}
                    <circle cx="205" cy="175" r="24" fill="#0f172a" stroke="#334155" strokeWidth="4" />
                    <circle cx="205" cy="175" r="12" fill="#1e293b" />
                    <circle cx="205" cy="175" r="4" fill="#00F090" />

                    {/* Scooter Chassis / Footboard */}
                    <path d="M75 160 L 140 160 L 195 130" stroke="#10b981" strokeWidth="10" strokeLinecap="round" />
                    <rect x="95" y="148" width="55" height="12" rx="4" fill="#059669" />

                    {/* Seat & Under-seat battery storage */}
                    <path d="M60 135 C 70 120, 115 120, 125 145 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                    <rect x="70" y="122" width="45" height="10" rx="5" fill="#020617" />

                    {/* Steering column & handlebar */}
                    <line x1="195" y1="130" x2="180" y2="65" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
                    <line x1="165" y1="65" x2="195" y2="65" stroke="#64748b" strokeWidth="5" strokeLinecap="round" />
                    {/* Digital display */}
                    <rect x="175" y="58" width="10" height="8" rx="2" fill="#00F090" />
                    {/* LED Headlight */}
                    <polygon points="185,75 210,80 210,70" fill="#38bdf8" opacity="0.8" />
                  </svg>
                </div>

                {/* Battery charge card overlay */}
                <div className="relative z-10 p-3 rounded-2xl bg-navy-950/90 border border-slate-700/80 backdrop-blur-md flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center">
                      <BatteryCharging className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Ather 450X Charging</span>
                      <span className="text-[10px] text-slate-400">2.1 kWh delivered • 38 min left</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-brand-400">82%</span>
                    <span className="text-[10px] text-slate-400 block font-medium">Safe Earth</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Simple 3-Step Process</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How ChargeNear Works</h2>
          <p className="text-sm text-slate-400">
            Book a verified plug in under a minute. No special membership or subscription needed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 relative hover:border-brand-500/40 transition-all hover:shadow-glow group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Find a Nearby Plug</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open our interactive map to locate verified sockets and Level 2 chargers at homes, shops, and cafes near you in Chennai.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 relative hover:border-brand-500/40 transition-all hover:shadow-glow group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Book Slot & Pay Online</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your time slot. Our conflict-free engine reserves your spot. Complete seamless simulated payment via Razorpay test mode.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 relative hover:border-brand-500/40 transition-all hover:shadow-glow group">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/30 flex items-center justify-center font-extrabold text-lg mb-4 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Plug In & Ride Ahead</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Arrive at the host location, connect your portable EV charger into the dedicated verified socket, relax, and hit the road recharged.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Charging Locations */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Chennai Pilot Hub</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Charging Points</h2>
            <p className="text-xs text-slate-400 mt-1">All locations are verified for proper grounding and safety.</p>
          </div>
          <Link
            to="/chargers"
            className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>View All 10+ Plugs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-navy-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredChargers.map((charger) => (
              <ChargerCard key={charger.id} charger={charger} />
            ))}
          </div>
        )}
      </section>

      {/* Benefits: Riders vs Hosts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* For Riders */}
          <div className="p-8 rounded-3xl bg-navy-900/70 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Why Riders Love ChargeNear</h3>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>No Range Anxiety:</strong> Charge anywhere in neighborhoods where public fast chargers aren't available.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Fair Transparent Pricing:</strong> Pay by the hour (~₹30 - ₹40/hr) with complete cost breakdown upfront.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Verified Safe Earth:</strong> Every plug is tested for copper grounding to protect your vehicle battery and electronics.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span><strong>Cafe & Work Lounges:</strong> Enjoy coffee or Wi-Fi while topping up your ride.</span>
              </li>
            </ul>

            <Link
              to="/chargers"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              <span>Explore nearby sockets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* For Hosts */}
          <div className="p-8 rounded-3xl bg-navy-900/70 border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Why Become a ChargeNear Host</h3>
            </div>

            <ul className="space-y-3.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Turn Idle Plugs into Passive Income:</strong> Earn ₹3,000 - ₹8,000+ monthly from your outdoor 16A socket or porch.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Drive Foot Traffic to Your Business:</strong> Cafes, salons, and retail shops get loyal EV riders spending while waiting.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>You Set the Rules:</strong> Control operating hours, pricing per hour, and accept or decline requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span><strong>Direct UPI Payouts:</strong> Automated earnings accounting sent straight to your UPI ID or bank account.</span>
              </li>
            </ul>

            <Link
              to="/host/add-charger"
              className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
            >
              <span>Start hosting today</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Electrical Safety Charter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-navy-900 to-navy-950 border border-emerald-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>ChargeNear Safety Charter</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Not All Sockets Are Created Equal</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                We clearly distinguish 16A industrial-rated household power sockets from dedicated Level 2 EVSE stations. Unverified household sockets are never labeled as certified fast chargers. Always verify vehicle charger compatibility before booking.
              </p>
            </div>
            <Link
              to="/about"
              className="py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-extrabold text-xs transition-colors shrink-0"
            >
              Read Safety Standards
            </Link>
          </div>
        </div>
      </section>

      {/* Verified Rider Community Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <span className="text-[11px] font-semibold text-brand-400 uppercase tracking-wider bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            Verified Community Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">What Riders & Hosts Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(stats.reviews && stats.reviews.length > 0 ? stats.reviews.slice(0, 3) : []).map((review) => (
            <div key={review.id} className="p-6 rounded-3xl bg-navy-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{review.comment}"
                </p>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                <img
                  src={review.rider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80'}
                  alt={review.rider?.name || 'Rider'}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                />
                <div>
                  <span className="text-xs font-bold text-white block">{review.rider?.name || 'EV Rider'}</span>
                  <span className="text-[10px] text-slate-400">
                    {review.rider?.vehicleModel || 'Electric Two-Wheeler'} • {review.location?.title}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Have Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-navy-900/70 border border-slate-800 overflow-hidden transition-colors"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-white hover:text-brand-300"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    activeFaq === idx ? 'rotate-180 text-brand-400' : ''
                  }`}
                />
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-brand-600 to-emerald-700 p-8 sm:p-12 text-center text-navy-950 relative overflow-hidden shadow-glow">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to Charge or Host?
            </h2>
            <p className="text-sm text-emerald-100 font-medium">
              Join the peer-to-peer EV revolution today. Every plug can power a ride.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register?role=RIDER"
                className="px-6 py-3 rounded-xl bg-navy-950 text-white font-extrabold text-xs hover:bg-navy-900 transition-colors shadow-lg"
              >
                Sign Up as Rider
              </Link>
              <Link
                to="/register?role=HOST"
                className="px-6 py-3 rounded-xl bg-white text-navy-950 font-extrabold text-xs hover:bg-slate-100 transition-colors shadow-lg"
              >
                Sign Up as Host
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

