import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SafetyNoticeBanner from '../components/SafetyNoticeBanner';
import {
  Calendar as CalendarIcon,
  Clock,
  Zap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  BatteryCharging,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form selections
  const todayStr = new Date().toISOString().split('T')[0];
  const [bookingDate, setBookingDate] = useState(todayStr);
  const [startTime, setStartTime] = useState('10:00');
  const [durationHours, setDurationHours] = useState(2);
  const [vehicleModel, setVehicleModel] = useState(user?.vehicleModel || 'Ather 450X Gen 3');
  const [currentCharge, setCurrentCharge] = useState(20);
  const [targetCharge, setTargetCharge] = useState(80);
  const [notes, setNotes] = useState('');
  const [safetyCheckConfirmed, setSafetyCheckConfirmed] = useState(false);

  // Cost estimate calculation
  const [costBreakdown, setCostBreakdown] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [isSlotAvailable, setIsSlotAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  // Recalculate cost & check availability when date, time, duration changes
  useEffect(() => {
    if (!charger) return;

    // Calculate end time string from startTime + durationHours
    const [startH, startM] = startTime.split(':').map(Number);
    const endH = startH + parseInt(durationHours);
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    async function checkAndEstimate() {
      setCheckingAvailability(true);
      try {
        const [availRes, estRes] = await Promise.all([
          api.checkAvailability({
            locationId: charger.id,
            bookingDate,
            startTime,
            endTime: endTimeStr
          }),
          api.estimateCost({
            locationId: charger.id,
            durationHours,
            batteryCapacityKwh: user?.batteryCapacityKwh || 3.7,
            currentChargePercent: currentCharge,
            targetChargePercent: targetCharge
          })
        ]);

        if (availRes.success) {
          setIsSlotAvailable(availRes.isAvailable);
        }

        if (estRes.success && estRes.breakdown) {
          setCostBreakdown({
            ...estRes.breakdown,
            endTime: endTimeStr,
            energyEstimate: estRes.energyEstimate
          });
        }
      } catch (err) {
        console.error('Error checking availability:', err);
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkAndEstimate();
  }, [charger, bookingDate, startTime, durationHours, currentCharge, targetCharge]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to book a charging slot.');
      navigate('/login');
      return;
    }

    if (!isSlotAvailable) {
      toast.error('The selected time slot is already booked. Please choose a different time.');
      return;
    }

    if (!safetyCheckConfirmed) {
      toast.error('Please confirm the electrical safety checklist before proceeding.');
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const endH = startH + parseInt(durationHours);
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

    setSubmitting(true);
    try {
      const res = await api.createBooking({
        locationId: charger.id,
        equipmentId: charger.equipments?.[0]?.id,
        bookingDate,
        startTime,
        endTime: endTimeStr,
        durationHours: parseInt(durationHours),
        vehicleModel,
        notes
      });

      if (res.success && res.booking) {
        toast.success('Slot reserved! Proceeding to test payment...');
        navigate(`/payment/${res.booking.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-64 rounded-3xl bg-navy-900 border border-slate-800" />
      </div>
    );
  }

  if (!charger) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Location unavailable</h2>
        <Link to="/chargers" className="text-brand-400 hover:underline text-xs">Browse all chargers</Link>
      </div>
    );
  }

  const primaryEquipment = charger.equipments?.[0] || {};

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link to={`/chargers/${charger.id}`} className="hover:text-brand-300">← Back to {charger.title}</Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Reserve Charging Slot
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Select your desired date and duration. Real-time conflict engine ensures your slot is secured.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Date, Time, Vehicle, Safety */}
        <form onSubmit={handleBookingSubmit} className="lg:col-span-7 space-y-6">
          {/* Charger summary badge */}
          <div className="p-4 rounded-2xl bg-navy-900/90 border border-slate-800 flex items-center gap-4">
            <img
              src={charger.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=200&q=80'}
              alt={charger.title}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Target Plug</span>
              <h3 className="font-bold text-white text-sm line-clamp-1">{charger.title}</h3>
              <p className="text-xs text-slate-400">{charger.address}, {charger.city}</p>
            </div>
          </div>

          {/* Slot Selection Card */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-brand-400" />
              <span>Step 1: Choose Date & Time</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Booking Date</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Start Time</label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                >
                  <option value="07:00">07:00 AM</option>
                  <option value="08:00">08:00 AM</option>
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                  <option value="19:00">07:00 PM</option>
                  <option value="20:00">08:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Duration (Hours)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => setDurationHours(hrs)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      durationHours === hrs
                        ? 'bg-brand-500 text-navy-950 border-brand-400 shadow-glow'
                        : 'bg-navy-950 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {hrs} {hrs === 1 ? 'Hour' : 'Hours'}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability feedback */}
            <div className="pt-2">
              {checkingAvailability ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-3.5 h-3.5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  <span>Checking slot availability in real time...</span>
                </div>
              ) : isSlotAvailable ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Slot is available! ({startTime} - {costBreakdown?.endTime || '12:00'})</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Slot conflict detected! This time is already booked by another rider.</span>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle & Battery Estimator */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-brand-400" />
              <span>Step 2: EV Battery Estimator (Optional)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">EV Model</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Ather 450X, Ola S1 Pro"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Charge Goal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="40"
                    max="100"
                    step="10"
                    value={targetCharge}
                    onChange={(e) => setTargetCharge(parseInt(e.target.value))}
                    className="w-full accent-brand-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                  <span className="text-xs font-bold text-brand-400 shrink-0">{targetCharge}%</span>
                </div>
              </div>
            </div>

            {costBreakdown?.energyEstimate && (
              <div className="p-3 rounded-xl bg-navy-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-white block">
                  Estimated energy needed: ~{costBreakdown.energyEstimate.neededKwh} kWh
                </span>
                <p className="text-slate-400 leading-relaxed">
                  {costBreakdown.energyEstimate.disclaimer}
                </p>
              </div>
            )}
          </div>

          {/* Mandatory Safety Confirmation */}
          <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Electrical Safety Checklist</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Before plugging in, verify your official portable charger cable is in good condition with undamaged pins. Never bypass ground/earthing pins.
            </p>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                required
                checked={safetyCheckConfirmed}
                onChange={(e) => setSafetyCheckConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-navy-950"
              />
              <span>
                I confirm that I will use my vehicle manufacturer's certified portable charger and follow the host's parking and electrical guidelines.
              </span>
            </label>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={submitting || !isSlotAvailable || checkingAvailability}
            className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-navy-950 font-black text-sm transition-all shadow-glow flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Reserve Slot & Proceed to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Column: Transparent Cost Breakdown */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="p-6 rounded-3xl bg-navy-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">
              Booking Invoice Estimate
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Charging Rate:</span>
                <span className="font-medium text-white">₹{costBreakdown?.ratePerHour || 35} / hr</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Reserved Duration:</span>
                <span className="font-medium text-white">{durationHours} {durationHours === 1 ? 'Hour' : 'Hours'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Subtotal:</span>
                <span className="font-bold text-white">₹{costBreakdown?.subtotal || (35 * durationHours)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    Platform Fee (5%)
                    <Info className="w-3 h-3 text-slate-500" />
                  </span>
                  <span>₹{costBreakdown?.platformFee || 3.5}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18% on platform fee):</span>
                  <span>₹{costBreakdown?.gstOnPlatformFee || 0.63}</span>
                </div>
              </div>

              {/* Total Final Amount */}
              <div className="pt-3 border-t border-slate-700/80 flex items-baseline justify-between text-base">
                <span className="font-extrabold text-white">Total Estimated Cost:</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-brand-400">
                    ₹{costBreakdown?.totalAmount || Math.round((35 * durationHours + 4.13) * 100) / 100}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-normal">All taxes included</span>
                </div>
              </div>
            </div>

            {/* Simulated Payment Tag */}
            <div className="p-3 rounded-xl bg-navy-950 border border-brand-500/20 text-center">
              <span className="text-[10px] font-bold text-brand-300 uppercase tracking-wider block">
                Razorpay Test Mode / Simulated
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                No real bank or card charges will occur
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

