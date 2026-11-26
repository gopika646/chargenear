import React, { useState } from 'react';
import { BatteryCharging, DollarSign, Leaf, Zap, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const POPULAR_VEHICLES = [
  { name: 'Ather 450X Gen 3', battery: 3.7, rangeKm: 105 },
  { name: 'Ola S1 Pro Gen 2', battery: 4.0, rangeKm: 130 },
  { name: 'TVS iQube S', battery: 3.4, rangeKm: 100 },
  { name: 'Bajaj Chetak Premium', battery: 3.2, rangeKm: 90 },
  { name: 'Hero Vida V1 Pro', battery: 3.9, rangeKm: 110 },
  { name: 'Ultraviolette F77', battery: 10.3, rangeKm: 200 }
];

export default function EvSavingsCalculator({ initialVehicle = 'Ather 450X Gen 3', hostRatePerHour = 35 }) {
  const [selectedVehicle, setSelectedVehicle] = useState(
    POPULAR_VEHICLES.find(v => v.name === initialVehicle) || POPULAR_VEHICLES[0]
  );
  const [startSoc, setStartSoc] = useState(20);
  const [targetSoc, setTargetSoc] = useState(80);
  const [chargerPowerKw, setChargerPowerKw] = useState(3.3);

  // Calculations
  const deltaSoc = Math.max(0, targetSoc - startSoc);
  const energyKwh = Math.round(((selectedVehicle.battery * deltaSoc) / 100) * 10) / 10;
  
  // Charging time estimate (hours)
  const estChargingHours = Math.round((energyKwh / chargerPowerKw) * 10) / 10;
  
  // Cost on ChargeNear
  const evChargingCost = Math.round(estChargingHours * hostRatePerHour * 100) / 100;
  
  // Range added
  const kmAdded = Math.round((selectedVehicle.rangeKm * deltaSoc) / 100);
  
  // Equivalent petrol cost in Chennai (Petrol = ₹102.63/L, Scooter mileage = 40 km/L => ₹2.56 / km)
  const petrolCost = Math.round(kmAdded * 2.56 * 100) / 100;
  
  // Savings
  const netSavings = Math.max(0, Math.round((petrolCost - evChargingCost) * 100) / 100);
  
  // CO2 prevented (~0.055 kg CO2 per km for petrol scooter)
  const co2SavedKg = Math.round(kmAdded * 0.055 * 10) / 10;

  return (
    <div className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 text-white font-extrabold text-base">
          <Zap className="w-5 h-5 text-brand-400" />
          <span>EV Charging & Petrol Savings Calculator</span>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Chennai Rates: ₹102.6/L Petrol
        </span>
      </div>

      {/* Vehicle Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">Select Your EV Two-Wheeler</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {POPULAR_VEHICLES.map((v) => (
            <button
              key={v.name}
              type="button"
              onClick={() => setSelectedVehicle(v)}
              className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                selectedVehicle.name === v.name
                  ? 'border-brand-500 bg-brand-500/10 text-white font-bold shadow-sm'
                  : 'border-slate-800 bg-navy-950 text-slate-400 hover:text-white'
              }`}
            >
              <span className="block truncate text-white">{v.name}</span>
              <span className="text-[10px] text-brand-300 font-normal">{v.battery} kWh Pack</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sliders: Current SoC vs Target SoC */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <div className="space-y-1.5 p-3 rounded-2xl bg-navy-950 border border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Current Battery:</span>
            <span className="font-bold text-amber-400">{startSoc}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="70"
            step="5"
            value={startSoc}
            onChange={(e) => setStartSoc(parseInt(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="space-y-1.5 p-3 rounded-2xl bg-navy-950 border border-slate-800">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Target Goal:</span>
            <span className="font-bold text-brand-400">{targetSoc}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={targetSoc}
            onChange={(e) => setTargetSoc(parseInt(e.target.value))}
            className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* Results Dashboard Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-navy-950 to-navy-950 border border-emerald-500/30 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-2 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Energy Needed</span>
            <span className="text-sm font-black text-white mt-0.5 block">{energyKwh} kWh</span>
          </div>
          <div className="p-2 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Estimated Time</span>
            <span className="text-sm font-black text-brand-400 mt-0.5 block">~{estChargingHours} hrs</span>
          </div>
          <div className="p-2 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">ChargeNear Cost</span>
            <span className="text-sm font-black text-white mt-0.5 block">₹{evChargingCost}</span>
          </div>
          <div className="p-2 rounded-xl bg-navy-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Petrol Equivalent</span>
            <span className="text-sm font-black text-rose-400 mt-0.5 block">₹{petrolCost}</span>
          </div>
        </div>

        {/* Highlight Banner */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>You save ₹{netSavings} vs petrol on this charge!</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prevents <strong>{co2SavedKg} kg</strong> CO₂ emissions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
