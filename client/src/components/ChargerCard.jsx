import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Zap, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ChargerCard({ charger, onSelect }) {
  const primaryEquipment = charger.equipments?.[0] || {};
  const isDedicated = primaryEquipment.isDedicatedEvse;

  // Image fallback
  const displayImage = (charger.images && charger.images.length > 0)
    ? charger.images[0]
    : 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="group rounded-3xl bg-navy-900/90 border border-slate-800/80 hover:border-brand-500/50 transition-all duration-300 hover:shadow-glow flex flex-col overflow-hidden">
      {/* Image with Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        <img
          src={displayImage}
          alt={charger.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/30" />

        {/* Verification Status & Category */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          {charger.isVerified ? (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500 text-navy-950 shadow-md">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Host
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-navy-950 shadow-md">
              Pending Review
            </span>
          )}

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md text-slate-200 border border-white/10 uppercase tracking-wide">
            {charger.category}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-navy-950/90 backdrop-blur-md text-amber-300 border border-amber-500/30">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{charger.rating.toFixed(1)}</span>
          <span className="text-slate-400 font-normal text-[10px]">({charger.totalReviews})</span>
        </div>

        {/* Distance Badge */}
        {charger.distanceKm !== null && charger.distanceKm !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-navy-950/90 backdrop-blur-md text-brand-300 border border-brand-500/30">
            <MapPin className="w-3.5 h-3.5 text-brand-400" />
            <span>{charger.distanceKm} km away</span>
          </div>
        )}

        {/* Price tag */}
        <div className="absolute bottom-3 right-3 text-right">
          <div className="px-3 py-1 rounded-xl bg-navy-950/95 backdrop-blur-md border border-brand-500/40 shadow-lg">
            <span className="text-sm font-extrabold text-white">₹{charger.pricePerHour || 35}</span>
            <span className="text-[10px] text-slate-400 font-normal"> / hr</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {charger.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{charger.landmark ? `${charger.landmark}, ${charger.city}` : charger.address}</span>
          </p>

          {/* Host info */}
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <img
              src={charger.host?.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={charger.host?.user?.name || 'Host'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
            />
            <span className="text-xs text-slate-300 truncate">
              Hosted by <strong className="text-white">{charger.host?.user?.name || 'Local Host'}</strong>
            </span>
          </div>

          {/* Equipment specs */}
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-navy-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Equipment</span>
              <span className="font-medium text-slate-200 truncate block">
                {isDedicated ? '⚡ Level 2 Wallbox' : '🔌 16A 3-Pin Socket'}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-navy-950/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Max Power</span>
              <span className="font-medium text-brand-300">
                {primaryEquipment.powerKw || 3.3} kW (230V)
              </span>
            </div>
          </div>

          {/* Compatibility tags */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Compatible:</span>
            {primaryEquipment.supportedVehicles?.slice(0, 3).map((v, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium border border-slate-700/60"
              >
                {v}
              </span>
            ))}
            {primaryEquipment.supportedVehicles?.length > 3 && (
              <span className="text-[10px] text-brand-400 font-semibold">
                +{primaryEquipment.supportedVehicles.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <Link
            to={`/chargers/${charger.id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs text-center transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
          </Link>
          <Link
            to={`/booking/${charger.id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs text-center transition-all shadow-glow flex items-center justify-center gap-1"
          >
            <span>Book Slot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

