import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import SafetyNoticeBanner from '../components/SafetyNoticeBanner';
import SafetyCertificateModal from '../components/SafetyCertificateModal';
import EvSavingsCalculator from '../components/EvSavingsCalculator';
import {
  Zap,
  MapPin,
  Star,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Share2,
  Heart,
  MessageSquare,
  Sparkles,
  Navigation,
  FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChargerDetailsPage() {
  const { id } = useParams();
  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadCharger() {
      try {
        const res = await api.getChargerById(id);
        if (res.success && res.charger) {
          setCharger(res.charger);
        }
      } catch (err) {
        toast.error('Failed to load charger details');
      } finally {
        setLoading(false);
      }
    }
    loadCharger();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-96 rounded-3xl bg-navy-900 border border-slate-800" />
        <div className="h-40 rounded-3xl bg-navy-900 border border-slate-800" />
      </div>
    );
  }

  if (!charger) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Charging Location Not Found</h2>
        <p className="text-xs text-slate-400">The requested charging point could not be located.</p>
        <Link to="/chargers" className="inline-block py-2 px-4 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs">
          Return to Chargers
        </Link>
      </div>
    );
  }

  const primaryEquipment = charger.equipments?.[0] || {};
  const images = charger.images || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Link to="/chargers" className="hover:text-brand-300">Chargers</Link>
            <span>/</span>
            <span className="text-slate-300">{charger.city}</span>
            <span>/</span>
            <span className="text-brand-400 font-medium truncate max-w-[200px]">{charger.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {charger.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-brand-400 shrink-0" />
            <span>{charger.address}{charger.landmark ? `, Near ${charger.landmark}` : ''}, {charger.city} - {charger.pincode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${charger.latitude},${charger.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Navigation className="w-4 h-4 text-brand-400" />
            <span>Directions</span>
          </a>

          <button
            onClick={() => setShowCertificate(true)}
            className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Audit Certificate</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }}
            className="p-2.5 rounded-xl bg-navy-900 border border-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <Share2 className="w-4 h-4 text-brand-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Photo */}
        <div className="lg:col-span-8 h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-950 relative border border-slate-800 shadow-2xl">
          <img
            src={images[activeImage] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80'}
            alt={charger.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {charger.isVerified && (
              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-navy-950 shadow-lg">
                <ShieldCheck className="w-4 h-4" /> Verified Host
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-navy-950/80 backdrop-blur-md text-white border border-white/10 uppercase">
              {charger.category}
            </span>
          </div>

          <div className="absolute bottom-4 right-4 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-navy-950/90 backdrop-blur-md text-amber-300 border border-amber-500/30">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{charger.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({charger.totalReviews} verified reviews)</span>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="lg:col-span-4 flex lg:flex-col gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`flex-1 h-24 lg:h-auto rounded-2xl overflow-hidden border-2 transition-all relative ${
                activeImage === i ? 'border-brand-500 shadow-glow' : 'border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Details & Booking Action Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Details, Specs, Safety, Reviews */}
        <div className="lg:col-span-8 space-y-6">
          {/* CRITICAL SAFETY BANNER */}
          <SafetyNoticeBanner
            isDedicatedEvse={primaryEquipment.isDedicatedEvse}
            hasEarthProtection={primaryEquipment.hasEarthProtection}
          />

          {/* About This Charging Location */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">About this Charging Point</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {charger.description}
            </p>
          </div>

          {/* Technical Electrical Specifications Table */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-brand-400" />
                <span>Electrical Specifications</span>
              </h2>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Verified Grounding
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipment</span>
                <span className="font-semibold text-white mt-1 block">
                  {primaryEquipment.isDedicatedEvse ? 'Level 2 Wallbox' : '16A 3-Pin Socket'}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Rated Power</span>
                <span className="font-semibold text-brand-400 mt-1 block">
                  {primaryEquipment.powerKw || 3.3} kW (Max)
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Voltage / Amps</span>
                <span className="font-semibold text-white mt-1 block">
                  {primaryEquipment.voltageV || 230}V / {primaryEquipment.currentA || 16}A
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-navy-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Connector</span>
                <span className="font-semibold text-white mt-1 block">
                  {primaryEquipment.connectorType === 'PIN_3_16A' ? 'Standard 16A 3-Pin' : primaryEquipment.connectorType}
                </span>
              </div>
            </div>

            {/* Safety Features list */}
            {primaryEquipment.safetyFeatures?.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-300 block mb-2">Installed Protection Measures:</span>
                <div className="flex flex-wrap gap-2">
                  {primaryEquipment.safetyFeatures.map((feat, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-slate-800/80 text-emerald-300 border border-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{feat}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Compatibility */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white">Vehicle Compatibility</h2>
            <p className="text-xs text-slate-400">
              Tested and confirmed compatible with portable OEM chargers for the following two-wheelers:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {primaryEquipment.supportedVehicles?.map((veh, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold"
                >
                  ✓ {veh}
                </span>
              ))}
            </div>
          </div>

          {/* Real-time EV Charging & Petrol Savings Calculator */}
          <EvSavingsCalculator
            initialVehicle="Ather 450X Gen 3"
            hostRatePerHour={charger.pricePerHour || 35}
          />

          {/* Amenities */}
          {charger.amenities?.length > 0 && (
            <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-3">
              <h2 className="text-lg font-bold text-white">Location Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {charger.amenities.map((am, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium"
                  >
                    • {am}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Host Profile Info */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">About the Host</h2>
            <div className="flex items-start gap-4">
              <img
                src={charger.host?.user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={charger.host?.user?.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500/30"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-white">{charger.host?.user?.name}</h3>
                  <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                    Host Partner
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {charger.host?.bio || 'Verified local host on the ChargeNear network in Chennai.'}
                </p>
                <div className="pt-1 flex items-center gap-4 text-xs text-slate-400">
                  <span>★ {charger.host?.rating?.toFixed(1) || '4.9'} Host Rating</span>
                  <span>• Fast response time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-400" />
                <span>Rider Reviews ({charger.reviews?.length || 0})</span>
              </h2>
            </div>

            <div className="space-y-3">
              {charger.reviews?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No reviews yet for this charging point.</p>
              ) : (
                charger.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-navy-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.rider?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
                          alt={rev.rider?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-xs font-bold text-white">{rev.rider?.name || 'EV Rider'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>

                    {rev.hostReply && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-brand-300">
                        <strong className="text-white block mb-0.5">Host Reply:</strong>
                        {rev.hostReply}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Call to Action */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-navy-900/95 border border-brand-500/40 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="flex items-baseline justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-3xl font-black text-white">₹{charger.pricePerHour || 35}</span>
                <span className="text-xs text-slate-400"> / hour</span>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Available Today
              </span>
            </div>

            {/* Quick Operating Hours badge */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-400" />
                <span>Operating Timings</span>
              </span>
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>All Days (Mon - Sun)</span>
                <span className="font-mono text-white font-bold">06:00 - 23:00</span>
              </div>
            </div>

            {/* Included in Booking */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Reserved parking spot while charging</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Earth-ground verified circuit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span>Conflict-free double booking guarantee</span>
              </div>
            </div>

            {/* Book Now Button */}
            <Link
              to={`/booking/${charger.id}`}
              className="w-full py-3.5 px-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm text-center transition-all shadow-glow flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Select Date & Book Slot</span>
            </Link>

            <p className="text-[11px] text-slate-400 text-center">
              Instant confirmation • Simulated payment mode
            </p>
          </div>
        </div>
      </div>

      {/* Safety Audit Certificate Modal */}
      {showCertificate && (
        <SafetyCertificateModal
          charger={charger}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

