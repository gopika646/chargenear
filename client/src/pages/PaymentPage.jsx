import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Zap,
  ArrowRight,
  AlertCircle,
  Clock,
  MapPin,
  Lock,
  Download,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY_TEST');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(1); // 1: Select, 2: Simulating processing, 3: Completed
  const [paymentResult, setPaymentResult] = useState(null);

  useEffect(() => {
    async function loadBooking() {
      try {
        const res = await api.getMyBookings();
        if (res.success && res.bookings) {
          const found = res.bookings.find((b) => b.id === id);
          if (found) {
            setBooking(found);
            if (found.payment && found.payment.status === 'PAID') {
              setProcessStep(3);
              setPaymentResult(found.payment);
            }
          } else {
            toast.error('Booking not found in your account.');
          }
        }
      } catch (err) {
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    }
    loadBooking();
  }, [id]);

  const handleSimulatePayment = async () => {
    setIsProcessing(true);
    setProcessStep(2);

    // Simulate authentic checkout delay
    setTimeout(async () => {
      try {
        const res = await api.payBooking(id, {
          paymentMethod,
          paymentId: `pay_test_${Math.random().toString(36).substring(2, 10)}`,
          orderId: `order_test_${Math.random().toString(36).substring(2, 10)}`
        });

        if (res.success) {
          setPaymentResult(res.payment);
          setBooking(res.booking);
          setProcessStep(3);
          toast.success('Simulated payment authorized! Booking confirmed.');
        }
      } catch (err) {
        toast.error(err.message || 'Payment simulation failed');
        setProcessStep(1);
      } finally {
        setIsProcessing(false);
      }
    }, 1800);
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 animate-pulse space-y-4">
        <div className="h-64 rounded-3xl bg-navy-900 border border-slate-800" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <Link to="/rider/dashboard" className="text-brand-400 text-xs">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Simulation Notice Disclaimer */}
      <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Simulated Payment Mode:</strong> This sandbox demonstrates Razorpay test mode. No actual financial charge will occur.
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 text-amber-300 shrink-0">
          Razorpay Test Mode
        </span>
      </div>

      {processStep === 3 ? (
        /* Step 3: Confirmed Receipt Pass */
        <div className="p-8 rounded-3xl bg-navy-900/90 border border-brand-500/40 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/40 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Payment Authorized</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Booking Confirmed!</h1>
            <p className="text-xs text-slate-300">
              Your plug at <strong className="text-white">{booking.location.title}</strong> is reserved.
            </p>
          </div>

          {/* Digital Pass Card */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-navy-950 border border-slate-800 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Booking Pass #</span>
              <span className="font-bold text-brand-400">{booking.bookingNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Date & Slot</span>
              <span className="text-white">{booking.bookingDate} ({booking.startTime} - {booking.endTime})</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Simulated Txn ID</span>
              <span className="text-white truncate max-w-[180px]">{paymentResult?.transactionId || 'TXN_TEST_MODE'}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm font-sans font-bold">
              <span className="text-slate-300">Total Paid (Simulated)</span>
              <span className="text-emerald-400">₹{booking.totalAmount}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/rider/bookings"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow"
            >
              View My Bookings
            </Link>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-brand-400" />
              <span>Print / Save Pass</span>
            </button>
            <Link
              to="/map"
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
            >
              Directions on Map
            </Link>
          </div>
        </div>
      ) : (
        /* Steps 1 & 2: Review Booking & Select Payment Method */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Payment Method Selection */}
          <div className="md:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-400" />
                <span>Select Simulated Payment Method</span>
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('RAZORPAY_TEST')}
                  className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                    paymentMethod === 'RAZORPAY_TEST'
                      ? 'bg-navy-950 border-brand-500 shadow-glow'
                      : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs">
                        Rzp
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Razorpay Test Checkout</span>
                        <span className="text-[10px] text-slate-400">Simulates standard Razorpay UPI / Netbanking / Card flow</span>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'RAZORPAY_TEST' ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'RAZORPAY_TEST' && <span className="w-1.5 h-1.5 rounded-full bg-navy-950" />}
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setPaymentMethod('UPI_SIMULATED')}
                  className={`p-4 rounded-2xl border cursor-pointer block transition-all ${
                    paymentMethod === 'UPI_SIMULATED'
                      ? 'bg-navy-950 border-brand-500 shadow-glow'
                      : 'bg-navy-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/30 flex items-center justify-center font-bold text-brand-400 text-xs">
                        UPI
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Instant UPI Simulation</span>
                        <span className="text-[10px] text-slate-400">Google Pay / PhonePe / Paytm test mode</span>
                      </div>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === 'UPI_SIMULATED' ? 'border-brand-500 bg-brand-500' : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'UPI_SIMULATED' && <span className="w-1.5 h-1.5 rounded-full bg-navy-950" />}
                    </span>
                  </div>
                </label>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full mt-4 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-navy-950 font-black text-sm transition-all shadow-glow flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Test Payment...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Test Payment of ₹{booking.totalAmount}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Itemized Summary */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-navy-900/95 border border-slate-800 shadow-xl space-y-4">
              <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">
                Order Summary
              </h3>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
                <p className="text-xs font-bold text-white line-clamp-1">{booking.location.title}</p>
                <p className="text-[11px] text-slate-400">{booking.location.address}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Date</span>
                  <p className="font-semibold text-slate-200">{booking.bookingDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Slot</span>
                  <p className="font-semibold text-slate-200">{booking.startTime} - {booking.endTime}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Duration ({booking.durationHours} hrs × ₹{booking.ratePerHour}):</span>
                  <span>₹{booking.subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Fee (5%):</span>
                  <span>₹{booking.platformFee}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>Total Due:</span>
                  <span className="text-brand-400">₹{booking.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Test Mode Popup Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-[#09152b] border border-[#2b6cb0] shadow-2xl overflow-hidden">
            <div className="bg-[#122b54] p-4 text-white flex items-center justify-between border-b border-[#2b6cb0]/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2b6cb0] flex items-center justify-center font-extrabold text-white text-xs">
                  Rzp
                </div>
                <div>
                  <span className="text-xs font-bold block">Razorpay Test Checkout</span>
                  <span className="text-[10px] text-blue-200 font-mono">Order: #{booking.bookingNumber}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white block">₹{booking.totalAmount}</span>
                <span className="text-[10px] text-emerald-300 uppercase font-bold">Simulated</span>
              </div>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <div>
                <span className="text-sm font-bold text-white block">Simulating Test Mode Authorization...</span>
                <p className="text-xs text-slate-400 mt-1">Connecting to simulated payment network & securing your slot.</p>
              </div>
              <div className="pt-2 text-[11px] text-brand-300 bg-brand-500/10 p-2.5 rounded-xl border border-brand-500/20">
                ✓ Razorpay Test Mode Active • No actual money is debited
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

