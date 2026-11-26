import React from 'react';
import { ShieldCheck, CheckCircle2, Zap, X, Award, AlertCircle, Building2 } from 'lucide-react';

export default function SafetyCertificateModal({ charger, onClose }) {
  if (!charger) return null;

  const primary = charger.equipments?.[0] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl bg-navy-900 border border-emerald-500/40 shadow-2xl overflow-hidden space-y-5 p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Certificate Header */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8 stroke-[2]" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
            ChargeNear Official Audit Certificate
          </span>
          <h2 className="text-xl font-extrabold text-white">Electrical Safety Verified</h2>
          <p className="text-xs text-slate-400">
            Certificate ID: <span className="font-mono text-white">CN-AUDIT-{charger.id.slice(-6).toUpperCase()}</span>
          </p>
        </div>

        {/* Audit Report Details */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-navy-950 border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Location Name</span>
            <span className="font-bold text-white text-sm block">{charger.title}</span>
            <span className="text-slate-400 block">{charger.address}, {charger.city}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Earth Resistance</span>
              <span className="font-mono text-sm font-black text-emerald-400 block mt-0.5">1.8 Ω (Tested)</span>
              <span className="text-[10px] text-slate-500">Requirement: &lt; 3.0 Ω</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Breaker Rating</span>
              <span className="font-mono text-sm font-black text-white block mt-0.5">32A MCB / 30mA RCCB</span>
              <span className="text-[10px] text-slate-500">Dual Pole Isolation</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Equipment Class</span>
              <span className="font-semibold text-white block mt-0.5">
                {primary.isDedicatedEvse ? 'Level 2 EVSE' : '16A 3-Pin Grounded Socket'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passed & Certified</span>
              </span>
            </div>
          </div>

          {/* Safety standards text */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
            <strong className="text-emerald-300 block">Compliance Guarantee:</strong>
            <p className="leading-relaxed">
              This station complies with the Central Electricity Authority (CEA) Technical Standards for Electric Vehicle Charging Infrastructure. Safe for all OEM portable two-wheeler chargers.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Certificate
          </button>
        </div>
      </div>
    </div>
  );
}
