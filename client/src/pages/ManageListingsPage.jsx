import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  PlusCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  DollarSign,
  Power
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ManageListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyListings();
      if (res.success && res.listings) {
        setListings(res.listings);
      }
    } catch (err) {
      toast.error('Failed to load your listings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await api.updateCharger(id, { isActive: !currentStatus });
      if (res.success) {
        toast.success(`Listing ${!currentStatus ? 'activated' : 'paused'}.`);
        loadListings();
      }
    } catch (err) {
      toast.error('Failed to update listing status');
    }
  };

  const handleDeleteListing = async (id) => {
    if (!confirm('Are you sure you want to delete this charging point listing?')) return;
    try {
      const res = await api.deleteCharger(id);
      if (res.success) {
        toast.success('Listing deleted.');
        loadListings();
      }
    } catch (err) {
      toast.error('Failed to delete listing');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-brand-400" />
            <span>Manage My Charging Points</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View verification status, control plug availability, and monitor performance.
          </p>
        </div>

        <Link
          to="/host/add-charger"
          className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Add Another Plug</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-40 rounded-3xl bg-navy-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900/60 border border-slate-800 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No charging points listed yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't listed any charging locations yet. Add your porch, driveway, cafe, or store plug to begin earning.
          </p>
          <Link
            to="/host/add-charger"
            className="inline-block py-2 px-4 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs"
          >
            Add Your First Plug
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((loc) => {
            const isApproved = loc.verificationStatus === 'APPROVED';
            const isPending = loc.verificationStatus === 'PENDING';
            const isRejected = loc.verificationStatus === 'REJECTED';

            return (
              <div
                key={loc.id}
                className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={loc.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=200&q=80'}
                    alt={loc.title}
                    className="w-20 h-20 rounded-2xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-navy-950 border border-white/10 text-slate-300 uppercase">
                        {loc.category}
                      </span>

                      {/* Verification Status Badge */}
                      {isApproved && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified & Live on Map
                        </span>
                      )}
                      {isPending && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5" /> Pending Admin Inspection
                        </span>
                      )}
                      {isRejected && (
                        <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" /> Needs Safety Revisions
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white hover:text-brand-300">
                      <Link to={`/chargers/${loc.id}`}>{loc.title}</Link>
                    </h3>
                    <p className="text-xs text-slate-400">{loc.address}, {loc.city}</p>

                    {/* Stats */}
                    <div className="pt-1 flex items-center gap-4 text-xs text-slate-300 font-medium">
                      <span>Rate: <strong className="text-white">₹{loc.slots?.[0]?.pricePerHour || 35}/hr</strong></span>
                      <span>• Bookings: <strong className="text-white">{loc.totalBookings || 0}</strong></span>
                      <span>• Earned: <strong className="text-brand-400">₹{loc.totalEarnings || 0}</strong></span>
                    </div>

                    {loc.verificationNotes && (
                      <p className="text-[11px] text-slate-400 italic pt-1">
                        Admin Note: {loc.verificationNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <button
                    onClick={() => handleToggleActive(loc.id, loc.isActive)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      loc.isActive
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{loc.isActive ? 'Active' : 'Paused'}</span>
                  </button>

                  <Link
                    to={`/chargers/${loc.id}`}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Preview Public Page"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeleteListing(loc.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

