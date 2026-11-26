import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HostEarningsPage() {
  const [stats, setStats] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [hostProfile, setHostProfile] = useState(null);
  const [payoutUpi, setPayoutUpi] = useState('');
  const [savingUpi, setSavingUpi] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        api.getHostAnalytics(),
        api.getHostBookings()
      ]);

      if (analyticsRes.success) {
        setStats(analyticsRes.stats);
        setMonthlyEarnings(analyticsRes.monthlyEarnings || []);
        setHostProfile(analyticsRes.hostProfile);
        setPayoutUpi(analyticsRes.hostProfile?.payoutUpiId || '');
      }

      if (bookingsRes.success && bookingsRes.bookings) {
        setBookings(bookingsRes.bookings);
      }
    } catch (err) {
      toast.error('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUpi = async (e) => {
    e.preventDefault();
    setSavingUpi(true);
    try {
      const res = await api.updateProfile({ payoutUpiId: payoutUpi });
      if (res.success) {
        toast.success('Payout UPI ID updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update UPI ID');
    } finally {
      setSavingUpi(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-brand-400" />
          <span>Host Earnings & Payouts</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review your gross earnings, platform commission breakdowns, and automated payouts.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Net Earned</span>
          <span className="text-3xl font-black text-brand-400 block">₹{stats?.totalEarnings || 0}</span>
          <span className="text-[10px] text-emerald-400">Disbursed directly to your UPI</span>
        </div>

        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Pending Settlement</span>
          <span className="text-3xl font-black text-amber-300 block">₹0.00</span>
          <span className="text-[10px] text-slate-400">Next cycle scheduled every Monday</span>
        </div>

        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase text-slate-400">Platform Commission</span>
          <span className="text-3xl font-black text-slate-300 block">5%</span>
          <span className="text-[10px] text-slate-400">Covers insurance, map listing, & customer service</span>
        </div>
      </div>

      {/* Payout Settings Card */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <CreditCard className="w-5 h-5 text-brand-400" />
          <span>Automated Payout Destination</span>
        </div>
        <p className="text-xs text-slate-300">
          Enter your UPI ID (Google Pay, PhonePe, Paytm, or BHIM) to receive automatic weekly payouts.
        </p>

        <form onSubmit={handleSaveUpi} className="flex flex-col sm:flex-row items-center gap-3 max-w-lg">
          <input
            type="text"
            required
            value={payoutUpi}
            onChange={(e) => setPayoutUpi(e.target.value)}
            placeholder="e.g. yourname@okhdfcbank"
            className="w-full px-4 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={savingUpi}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow shrink-0"
          >
            {savingUpi ? 'Saving...' : 'Update UPI ID'}
          </button>
        </form>
      </div>

      {/* Transaction History Ledger */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>Earnings Breakdown by Booking</span>
        </h2>

        {bookings.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No completed bookings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Booking #</th>
                  <th className="p-3">Rider</th>
                  <th className="p-3">Date & Slot</th>
                  <th className="p-3">Gross Total</th>
                  <th className="p-3">Fee (5%)</th>
                  <th className="p-3 text-right rounded-r-xl">Net Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/20 text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">#{b.bookingNumber}</td>
                    <td className="p-3 font-semibold text-white">{b.rider?.name || 'Rider'}</td>
                    <td className="p-3 text-slate-400">{b.bookingDate} ({b.startTime} - {b.endTime})</td>
                    <td className="p-3">₹{b.totalAmount}</td>
                    <td className="p-3 text-slate-400">₹{b.platformFee}</td>
                    <td className="p-3 text-right font-extrabold text-brand-400">₹{b.hostEarnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

