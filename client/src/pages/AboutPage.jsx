import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Zap,
  ShieldCheck,
  BatteryCharging,
  Leaf,
  Users,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AboutPage() {
  const [stats, setStats] = useState({
    totalPlugs: 10,
    totalHosts: 5,
    totalRiders: 10,
    totalBookings: 15,
    cleanKmPowered: 525,
    carbonSavedKg: 63
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getPlatformStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (e) {
        console.error('Failed to load stats for about page:', e);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          <span>Our Vision & Mission</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Decentralizing EV Charging Infrastructure Across India
        </h1>
        <p className="text-base text-slate-300 leading-relaxed font-normal">
          ChargeNear is a community-driven peer-to-peer charging marketplace empowering electric two-wheeler riders with accessible, safe plugs at local homes, shops, and cafes.
        </p>
      </div>

      {/* Problem & Solution Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-navy-900/80 border border-rose-500/20 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>The Infrastructure Gap</span>
          </div>
          <h3 className="text-xl font-bold text-white">Why Public Fast Chargers Fall Short</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            While EV two-wheeler adoption has exploded, public commercial fast-charging networks are expensive, sparse, and primarily designed for electric four-wheelers. Electric bike and scooter riders often find themselves stranded in residential neighborhoods or busy suburbs without an accessible plug.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-navy-900/80 border border-brand-500/20 space-y-4">
          <div className="flex items-center gap-2 text-brand-400 font-bold text-sm uppercase tracking-wider">
            <Zap className="w-4 h-4" />
            <span>The ChargeNear Solution</span>
          </div>
          <h3 className="text-xl font-bold text-white">Every Plug Can Power a Ride</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            By activating existing heavy-duty 16A power connections in homes, cafes, retail shops, and offices, we transform thousands of everyday power outlets into a distributed charging network. Hosts earn recurring income, and riders gain zero-anxiety mobility.
          </p>
        </div>
      </div>

      {/* The Two-Wheeler Electrical Safety Charter (Crucial Section 11) */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-navy-900 to-navy-950 border border-emerald-500/30 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-5 h-5" />
            <span>Electrical Safety Standards & Compliance</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Our Strict Safety Commitments
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Electric two-wheelers have specific onboard charger requirements. ChargeNear enforces clear electrical distinctions and verification:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Tested Earth Grounding (&lt; 3 Ohms)</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Portable two-wheeler chargers require active earth grounding. Hosts must verify copper earth rod resistance to prevent vehicle chassis shock hazards or charging cutoffs.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ordinary Socket vs Dedicated EVSE</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              We never falsely label a standard 16A household power socket as a fast commercial charger. All listings clearly declare whether they offer portable charger plug-in or Level 2 EVSE wallbox.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Independent MCB & Surge Protection</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              Every host station must be protected by a dedicated C-curve miniature circuit breaker (MCB) and 30mA residual current circuit breaker (RCCB) to isolate heavy continuous loads.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Admin Verification Gate</span>
            </h4>
            <p className="text-slate-400 leading-relaxed text-xs">
              No charging point goes live on the ChargeNear map until our operations team audits electrical specifications and confirms photos of the breaker and enclosure.
            </p>
          </div>
        </div>
      </div>

      {/* Environmental Impact Counter */}
      <div className="p-8 rounded-3xl bg-navy-900/80 border border-slate-800 text-center space-y-6">
        <div className="max-w-xl mx-auto space-y-2">
          <Leaf className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-2xl font-extrabold text-white">Sustainable Mobility by the Numbers</h3>
          <p className="text-xs text-slate-400">Projected impact of the Chennai pilot network</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-3xl font-black text-white">{stats.totalPlugs}</span>
            <span className="block text-xs font-semibold text-slate-300 mt-1">Verified EV Sockets</span>
          </div>
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-3xl font-black text-brand-400">{stats.cleanKmPowered}+</span>
            <span className="block text-xs font-semibold text-slate-300 mt-1">Clean Kilometers Powered</span>
          </div>
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-3xl font-black text-emerald-400">{stats.carbonSavedKg} kg</span>
            <span className="block text-xs font-semibold text-slate-300 mt-1">CO₂ Tailpipe Avoided</span>
          </div>
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800">
            <span className="text-3xl font-black text-electric">95%</span>
            <span className="block text-xs font-semibold text-slate-300 mt-1">Direct Host Payout</span>
          </div>
        </div>
      </div>

      {/* CTA Bottom */}
      <div className="text-center pt-4">
        <Link
          to="/chargers"
          className="inline-flex items-center gap-2 py-3.5 px-8 rounded-2xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm transition-all shadow-glow"
        >
          <span>Find a Charge Point Near You</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
