import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  DollarSign,
  Calendar,
  Zap,
  Clock,
  PlusCircle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building2,
  ShieldCheck,
  Star,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function HostDashboardPage() {
  const [stats, setStats] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHostDashboard();
  }, []);

  const loadHostDashboard = async () => {
    setLoading(true);
    try {
      const [analyticsRes, bookingsRes] = await Promise.all([
        api.getHostAnalytics(),
        api.getHostBookings()
      ]);

      if (analyticsRes.success) {
        setStats(analyticsRes.stats);
        setMonthlyEarnings(analyticsRes.monthlyEarnings || []);
      }

      if (bookingsRes.success && bookingsRes.bookings) {
        setPendingBookings(bookingsRes.bookings.filter((b) => b.status === 'PENDING'));
      }
    } catch (err) {
      console.error('Failed to load host dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      if (res.success) {
        toast.success(`Booking ${status.toLowerCase()} successfully.`);
        loadHostDashboard();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update booking status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-950 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
            Host Partner Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Host Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor charging sessions, accept rider bookings, and view earnings.
          </p>
        </div>

        <Link
          to="/host/add-charger"
          className="py-3 px-5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-extrabold text-xs transition-all shadow-glow flex items-center gap-2 self-start sm:self-auto shrink-0"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Add Charging Point</span>
        </Link>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold text-[10px]">Total Host Revenue</span>
            <DollarSign className="w-4 h-4 text-brand-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-brand-400 mt-2 block">
            ₹{stats?.totalEarnings || 0}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">95% net payout to your UPI</span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold text-[10px]">Total Bookings</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white mt-2 block">
            {stats?.totalBookings || 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Sessions hosted</span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold text-[10px]">Active Plugs</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white mt-2 block">
            {stats?.activeListings || 0}
          </span>
          <span className="text-[10px] text-brand-300 mt-1 block">Verified & live on map</span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="uppercase font-semibold text-[10px]">Host Rating</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-2 block">
            {stats?.rating?.toFixed(1) || '4.9'}★
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">From verified EV riders</span>
        </div>
      </div>

      {/* Monthly Earnings Visualizer */}
      <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            <span>Monthly Earnings Trend (₹)</span>
          </h2>
          <span className="text-xs text-slate-400">Past 6 Months</span>
        </div>

        <div className="pt-4 grid grid-cols-6 gap-3 items-end h-44 border-b border-slate-800 pb-2">
          {monthlyEarnings.map((m, idx) => {
            const maxVal = 6000;
            const heightPercent = Math.min(100, Math.round((m.earnings / maxVal) * 100));
            return (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[10px] font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{m.earnings}
                </span>
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-brand-600 to-electric group-hover:brightness-125 transition-all"
                />
                <span className="text-xs font-semibold text-slate-400">{m.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Booking Requests Action Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>Pending Booking Requests ({pendingBookings.length})</span>
            </h2>
            <p className="text-xs text-slate-400">Accept or decline upcoming rider reservations.</p>
          </div>
          <Link to="/host/listings" className="text-xs font-bold text-brand-400 hover:text-brand-300">
            Manage All Listings
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="p-8 rounded-3xl bg-navy-900/60 border border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-bold text-white">No pending requests right now</p>
            <p className="text-[11px] text-slate-400">All current requests have been processed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-navy-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={b.rider.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={b.rider.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-700"
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-bold text-white block">{b.rider.name}</span>
                    <span className="text-xs text-brand-300 font-medium">
                      {b.rider.vehicleModel || 'Electric Two-Wheeler'}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {b.bookingDate} • {b.startTime} - {b.endTime} ({b.durationHours} hrs)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                  <div className="text-right mr-2">
                    <span className="text-sm font-black text-brand-400 block">₹{b.hostEarnings}</span>
                    <span className="text-[10px] text-slate-400">Your Net Earnings</span>
                  </div>

                  <button
                    onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                    className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-glow"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>

                  <button
                    onClick={() => handleUpdateBookingStatus(b.id, 'REJECTED')}
                    className="py-2 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

