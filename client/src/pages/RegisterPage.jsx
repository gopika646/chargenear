import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, User, Building2, Lock, Mail, Phone, Bike, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'HOST' ? 'HOST' : 'RIDER';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleModel: '',
    vehicleNumber: '',
    batteryCapacityKwh: '',
    businessName: '',
    bio: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    payoutUpiId: ''
  });
  const [agreedSafety, setAgreedSafety] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreedSafety) {
      toast.error('Please accept the ChargeNear electrical safety guidelines to proceed.');
      return;
    }

    setLoading(true);
    const res = await register({
      ...formData,
      role
    });
    setLoading(false);

    if (res.success) {
      if (role === 'HOST') navigate('/host/dashboard');
      else navigate('/rider/dashboard');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl p-8 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-electric text-navy-950 shadow-glow mb-2">
            <Zap className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">Join ChargeNear</h1>
          <p className="text-xs text-slate-400">
            Create an account to discover verified plugs or start earning as a charging host.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-navy-950 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setRole('RIDER')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'RIDER'
                ? 'bg-brand-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>I am an EV Rider</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('HOST')}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              role === 'HOST'
                ? 'bg-brand-500 text-navy-950 shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>I want to Host Plugs</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Common Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Arun Prakash"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="arun@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98400 12345"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* RIDER-SPECIFIC FIELDS */}
          {role === 'RIDER' && (
            <div className="pt-3 border-t border-slate-800/80 space-y-4">
              <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block">
                Two-Wheeler Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">EV Model</label>
                  <select
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      let kwh = '3.5';
                      if (val.includes('Ather 450X')) kwh = '3.7';
                      else if (val.includes('Ola S1')) kwh = '4.0';
                      else if (val.includes('TVS iQube')) kwh = '3.04';
                      else if (val.includes('Chetak')) kwh = '3.2';
                      else if (val.includes('Vida')) kwh = '3.94';
                      setFormData({ ...formData, vehicleModel: val, batteryCapacityKwh: kwh });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
                  >
                    <option value="">-- Select Your EV Two-Wheeler --</option>
                    <option value="Ather 450X Gen 3">Ather 450X Gen 3</option>
                    <option value="Ola S1 Pro Gen 2">Ola S1 Pro Gen 2</option>
                    <option value="TVS iQube S">TVS iQube S</option>
                    <option value="Bajaj Chetak Premium">Bajaj Chetak Premium</option>
                    <option value="Hero Vida V1 Pro">Hero Vida V1 Pro</option>
                    <option value="Ather Rizta Z">Ather Rizta Z</option>
                    <option value="Other 2-Wheeler EV">Other 2-Wheeler EV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registration Number</label>
                  <input
                    type="text"
                    name="vehicleNumber"
                    value={formData.vehicleNumber}
                    onChange={handleChange}
                    placeholder="TN-01-AB-1234"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* HOST-SPECIFIC FIELDS */}
          {role === 'HOST' && (
            <div className="pt-3 border-t border-slate-800/80 space-y-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                Host Property & Payout Setup
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Property / Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. GreenHaven Residence Porch"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payout UPI ID</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="payoutUpiId"
                      value={formData.payoutUpiId}
                      onChange={handleChange}
                      placeholder="yourname@okhdfcbank"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Property Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street address, area (e.g. 15 Gandhi Nagar, Adyar)"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Safety Guidelines Consent */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={agreedSafety}
                onChange={(e) => setAgreedSafety(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-navy-950"
              />
              <span>
                I agree to the <strong>ChargeNear Electrical Safety Charter</strong>. I understand that only verified 16A grounded sockets or certified EVSE units can be used for EV charging.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-extrabold text-sm transition-all shadow-glow flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Create {role === 'HOST' ? 'Host' : 'Rider'} Account</span>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 font-semibold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}

