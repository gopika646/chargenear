import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [filterStatus]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.getMyBookings(filterStatus);
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await api.updateBookingStatus(bookingId, 'CANCELLED', 'Rider requested cancellation');
      if (res.success) {
        toast.success('Booking cancelled successfully.');
        loadBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter review comments.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.createReview({
        bookingId: selectedBooking.id,
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        toast.success('Thank you! Review submitted successfully.');
        setReviewModalOpen(false);
        loadBookings();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const statusPills = [
    { id: 'ALL', label: 'All Bookings' },
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'PENDING', label: 'Pending Payment' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-brand-400" />
            <span>My Charging Bookings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track past and upcoming EV charging sessions across Chennai.
          </p>
        </div>

        <Link
          to="/chargers"
          className="py-2.5 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Book New Slot</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusPills.map((pill) => (
          <button
            key={pill.id}
            onClick={() => setFilterStatus(pill.id)}
            className={`py-1.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              filterStatus === pill.id
                ? 'bg-brand-500 text-navy-950 border-brand-400 shadow-sm'
                : 'bg-navy-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-3xl bg-navy-900/60 animate-pulse border border-slate-800" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 rounded-3xl bg-navy-900/60 border border-slate-800 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No bookings found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You don't have any {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} bookings.
          </p>
          <Link
            to="/chargers"
            className="inline-block py-2 px-4 rounded-xl bg-brand-500 text-navy-950 font-bold text-xs"
          >
            Find Plugs Now
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-3xl bg-navy-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4">
                <img
                  src={b.location.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=200&q=80'}
                  alt={b.location.title}
                  className="w-16 h-16 rounded-2xl object-cover shrink-0 mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-brand-400">#{b.bookingNumber}</span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-brand-300 transition-colors">
                    <Link to={`/chargers/${b.location.id}`}>{b.location.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{b.location.address}, {b.location.city}</span>
                  </p>

                  <div className="pt-1 flex items-center gap-4 text-xs text-slate-300 font-medium">
                    <span className="flex items-center gap-1 text-white">
                      <Clock className="w-3.5 h-3.5 text-brand-400" />
                      {b.bookingDate} ({b.startTime} - {b.endTime})
                    </span>
                    <span>• {b.durationHours} hrs</span>
                    <span className="font-extrabold text-brand-400">₹{b.totalAmount}</span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                {b.status === 'PENDING' && (
                  <Link
                    to={`/payment/${b.id}`}
                    className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
                  >
                    Pay & Confirm
                  </Link>
                )}

                {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && !b.review && (
                  <button
                    onClick={() => openReviewModal(b)}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-brand-400" />
                    <span>Leave Review</span>
                  </button>
                )}

                {b.review && (
                  <span className="text-xs font-semibold text-amber-300 flex items-center gap-1 px-3 py-1 rounded-xl bg-navy-950 border border-slate-800">
                    ★ Reviewed ({b.review.rating}/5)
                  </span>
                )}

                {(b.status === 'CONFIRMED' || b.status === 'PENDING') && (
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="py-2 px-3.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Leave Review Modal */}
      {reviewModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-navy-900 border border-slate-700 shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Rate Your Charging Experience</h3>
            <p className="text-xs text-slate-300">
              How was your experience at <strong>{selectedBooking.location.title}</strong>?
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-125 ${
                        rating >= star ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-300 ml-2">{rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Feedback / Comments</label>
                <textarea
                  rows="3"
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on socket earthing, charging speed, host hospitality..."
                  className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="py-2 px-4 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

