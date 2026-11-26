import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Bike,
  Building2,
  CreditCard,
  Save,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, isRider, isHost, isAdmin } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    vehicleModel: user?.vehicleModel || '',
    vehicleNumber: user?.vehicleNumber || '',
    batteryCapacityKwh: user?.batteryCapacityKwh || '',
    businessName: user?.hostProfile?.businessName || '',
    bio: user?.hostProfile?.bio || '',
    payoutUpiId: user?.hostProfile?.payoutUpiId || ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        vehicleModel: user.vehicleModel || '',
        vehicleNumber: user.vehicleNumber || '',
        batteryCapacityKwh: user.batteryCapacityKwh || '',
        businessName: user.hostProfile?.businessName || '',
        bio: user.hostProfile?.bio || '',
        payoutUpiId: user.hostProfile?.payoutUpiId || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile(formData);
      if (res.success && res.user) {
        updateUser(res.user);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
          alt={user?.name}
          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-500/40"
        />
        <div>
          <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
          <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
              Role: {user?.role}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Account Verified
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            <span>Personal Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98400 12345"
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* RIDER-SPECIFIC: Vehicle Settings */}
        {isRider && (
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bike className="w-4 h-4 text-brand-400" />
              <span>EV Two-Wheeler Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  placeholder="e.g. Ather 450X Gen 3"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="TN-01-BK-8842"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Battery Capacity (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  name="batteryCapacityKwh"
                  value={formData.batteryCapacityKwh}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* HOST-SPECIFIC: Business & Payout Settings */}
        {isHost && (
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-400" />
              <span>Host Property & Payout Configuration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Business / Property Name</label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="e.g. Karthik Solar EV Hub"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payout UPI ID</label>
                <input
                  type="text"
                  name="payoutUpiId"
                  value={formData.payoutUpiId}
                  onChange={handleChange}
                  placeholder="yourname@upi"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Host Bio</label>
              <textarea
                name="bio"
                rows="2"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Share a short bio for riders..."
                className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="py-3 px-8 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow flex items-center gap-2"
        >
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}

