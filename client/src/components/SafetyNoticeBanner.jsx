import React from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, Zap, Info } from 'lucide-react';

export default function SafetyNoticeBanner({ isDedicatedEvse = false, hasEarthProtection = true }) {
  return (
    <div className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
      isDedicatedEvse
        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
        : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        {isDedicatedEvse ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white uppercase tracking-wider text-xs px-2 py-0.5 rounded bg-black/40">
              {isDedicatedEvse ? 'Dedicated Level 2 EVSE Station' : '16A Household Power Socket (3-Pin)'}
            </span>
            {hasEarthProtection && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Earth Ground Verified
              </span>
            )}
          </div>

          <p className="text-slate-300 text-xs">
            {isDedicatedEvse ? (
              'This location is equipped with a certified commercial Level 2 EVSE with built-in RCD and auto cut-off protection.'
            ) : (
              'Important: This is a heavy-duty 16A power point. EV two-wheeler riders MUST use their official vehicle portable charger with internal surge and ground-fault protection. Never plug an unverified adapter.'
            )}
          </p>

          <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400">
            <span>• Verified Max: 3.3 kW</span>
            <span>• Voltage: 230V Single-Phase</span>
            <span>• Admin Verified Host</span>
          </div>
        </div>
      </div>
    </div>
  );
}

