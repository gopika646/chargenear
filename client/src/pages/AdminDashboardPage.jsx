import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Shield,
  Users,
  Building2,
  Zap,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Check,
  Star,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [queue, setQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'users' | 'bookings' | 'complaints' | 'reviews'
  const [loading, setLoading] = useState(true);

  // Verification dialog state
  const [selectedCharger, setSelectedCharger] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    loadAllAdminData();
  }, [activeTab]);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const metricsRes = await api.getAdminMetrics();
      if (metricsRes.success) setMetrics(metricsRes.metrics);

      if (activeTab === 'queue') {
        const qRes = await api.getAdminQueue('ALL');
        if (qRes.success) setQueue(qRes.queue);
      } else if (activeTab === 'users') {
        const uRes = await api.getAdminUsers();
        if (uRes.success) setUsers(uRes.users);
      } else if (activeTab === 'bookings') {
        const bRes = await api.getAdminBookings();
        if (bRes.success) setBookings(bRes.bookings);
      } else if (activeTab === 'complaints') {
        const cRes = await api.getAdminComplaints();
        if (cRes.success) setComplaints(cRes.complaints);
      } else if (activeTab === 'reviews') {
        const rRes = await api.getReviews();
        if (rRes.success) setReviews(rRes.reviews);
      }
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      const res = await api.deleteReview(id);
      if (res.success) {
        toast.success('Review deleted.');
        loadAllAdminData();
      }
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleVerify = async (id, status) => {
    setActionInProgress(true);
    try {
      const res = await api.verifyCharger(id, status, verificationNotes);
      if (res.success) {
        toast.success(`Charger marked as ${status}!`);
        setSelectedCharger(null);
        setVerificationNotes('');
        loadAllAdminData();
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleResolveComplaint = async (id) => {
    try {
      const res = await api.updateComplaint(id, {
        status: 'RESOLVED',
        resolution: 'Verified by safety team. Host verified grounding inspection.'
      });
      if (res.success) {
        toast.success('Complaint resolved.');
        loadAllAdminData();
      }
    } catch (err) {
      toast.error('Failed to update complaint');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-navy-900 to-navy-950 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Platform Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Shield className="w-7 h-7 text-amber-400" />
            <span>Admin Operations Center</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Audit electrical safety compliance, approve host stations, and monitor platform transactions.
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Users</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            {metrics?.totalUsers || 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {metrics?.totalRiders || 0} Riders • {metrics?.totalHosts || 0} Hosts
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Plugs</span>
          <span className="text-2xl sm:text-3xl font-black text-brand-400 mt-1 block">
            {metrics?.totalChargers || 0}
          </span>
          <span className="text-[10px] text-emerald-400 mt-1 block">
            {metrics?.approvedChargers || 0} Verified • {metrics?.pendingChargers || 0} Pending
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Gross Bookings GMV</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
            ₹{metrics?.totalGmv || 0}
          </span>
          <span className="text-[10px] text-brand-400 mt-1 block">
            ₹{metrics?.platformCommission || 0} Commission (5%)
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-navy-900/80 border border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block">Pending Queue</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-300 mt-1 block">
            {metrics?.pendingChargers || 0}
          </span>
          <span className="text-[10px] text-amber-400 mt-1 block">Awaiting safety inspection</span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('queue')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-brand-500 text-navy-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Verification Queue ({queue.filter((q) => q.verificationStatus === 'PENDING').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-brand-500 text-navy-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-brand-500 text-navy-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>All Bookings & Transactions</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'complaints'
              ? 'bg-brand-500 text-navy-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Safety Inquiries ({complaints.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-brand-500 text-navy-950 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Star className="w-4 h-4" />
          <span>Review Moderation ({reviews.length})</span>
        </button>
      </div>

      {/* TAB 1: Verification Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Submitted Charging Points for Audit</h2>
            <span className="text-xs text-slate-400">Total {queue.length} in registry</span>
          </div>

          <div className="space-y-4">
            {queue.map((loc) => {
              const primary = loc.equipments?.[0] || {};
              const isApproved = loc.verificationStatus === 'APPROVED';
              const isPending = loc.verificationStatus === 'PENDING';

              return (
                <div
                  key={loc.id}
                  className="p-6 rounded-3xl bg-navy-900/90 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={loc.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=200&q=80'}
                        alt={loc.title}
                        className="w-14 h-14 rounded-2xl object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-white">{loc.title}</h3>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isApproved
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isPending
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {loc.verificationStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{loc.address}, {loc.city} • Host: {loc.host?.user?.name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(loc.id, 'APPROVED')}
                        className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve & Verify</span>
                      </button>

                      <button
                        onClick={() => handleVerify(loc.id, 'REJECTED')}
                        className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Listing</span>
                      </button>
                    </div>
                  </div>

                  {/* Electrical audit specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Type</span>
                      <span className="font-bold text-white block mt-0.5">
                        {primary.isDedicatedEvse ? 'Dedicated Level 2 EVSE' : '16A Power Socket'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Power Rating</span>
                      <span className="font-bold text-brand-400 block mt-0.5">
                        {primary.powerKw || 3.3} kW ({primary.currentA || 16}A)
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Earth Grounding</span>
                      <span className="font-bold text-emerald-400 block mt-0.5">
                        {primary.hasEarthProtection ? '✓ Copper Rod Confirmed' : '⚠ Needs Check'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Price Set By Host</span>
                      <span className="font-bold text-white block mt-0.5">
                        ₹{loc.slots?.[0]?.pricePerHour || 35} / hr
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Registered Platform Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Vehicle / Property</th>
                  <th className="p-3 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/20 text-slate-300">
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3 font-mono text-slate-400">{u.email}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : u.role === 'HOST'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">
                      {u.vehicleModel || u.hostProfile?.businessName || 'EV Two-Wheeler'}
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-emerald-400 font-semibold">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Platform Bookings Monitor */}
      {activeTab === 'bookings' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Platform Bookings Stream</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-xl">Booking #</th>
                  <th className="p-3">Rider</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Gross Total</th>
                  <th className="p-3 text-right rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/20 text-slate-300">
                    <td className="p-3 font-mono font-bold text-white">#{b.bookingNumber}</td>
                    <td className="p-3 font-semibold text-white">{b.rider?.name || 'Rider'}</td>
                    <td className="p-3 text-slate-400">{b.location?.title}</td>
                    <td className="p-3 text-slate-400">{b.bookingDate}</td>
                    <td className="p-3 font-bold text-brand-400">₹{b.totalAmount}</td>
                    <td className="p-3 text-right font-bold text-slate-300">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Safety Inquiries & Complaints */}
      {activeTab === 'complaints' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white">Safety Inquiries & Host Clarifications</h2>
          <div className="space-y-3">
            {complaints.map((c) => (
              <div key={c.id} className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{c.subject}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === 'RESOLVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{c.description}</p>
                {c.adminNotes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Admin note: {c.adminNotes}
                  </p>
                )}
                {c.status === 'OPEN' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-navy-950 text-xs font-bold"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Review Moderation */}
      {activeTab === 'reviews' && (
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Platform Reviews & Ratings Moderation</h2>
            <span className="text-xs text-slate-400">Total {reviews.length} reviews</span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No reviews submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{rev.rider?.name || 'EV Rider'}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-xs text-brand-400 font-medium">{rev.location?.title}</span>
                      <span className="text-slate-500">•</span>
                      <div className="flex items-center text-amber-400 text-xs">
                        {[...Array(rev.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                    {rev.hostReply && (
                      <p className="text-[11px] text-slate-400">
                        Host Reply: <span className="text-slate-300">{rev.hostReply}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                    title="Remove Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

