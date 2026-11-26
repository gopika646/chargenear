import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      toast.success('Your message has been sent to the ChargeNear Support Team!');
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
          Support & Assistance
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Contact ChargeNear
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Need help with a charging slot, host onboarding, or technical verification? Our team in Chennai is here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Contact Info & Emergency Hotline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency EV Helpline Card */}
          <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>24/7 Rider Roadside Helpline</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Stranded with low battery or unable to access your booked host plug? Contact our Chennai emergency dispatch team.
            </p>
            <div className="text-xl font-black text-amber-400 font-mono">
              +91 98400 11223
            </div>
          </div>

          {/* Contact Details */}
          <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-5 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block text-sm">Chennai Pilot Headquarters</strong>
                <p className="text-slate-400 mt-0.5">
                  ChargeNear Technologies India Pvt Ltd<br />
                  Level 4, CyberNova Tech Hub, Rajiv Gandhi Salai (OMR),<br />
                  Kandanchavadi, Chennai - 600096
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <Mail className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <strong className="text-white block">Email Support</strong>
                <span className="text-slate-400 font-mono">support@chargenear.com</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
              <MessageSquare className="w-5 h-5 text-brand-400 shrink-0" />
              <div>
                <strong className="text-white block">Host Verification Desk</strong>
                <span className="text-slate-400 font-mono">hosts@chargenear.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-navy-900/90 border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-lg font-bold text-white">Send Us a Message</h2>

          {sent ? (
            <div className="p-8 rounded-2xl bg-navy-950 border border-brand-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-brand-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Inquiry Submitted!</h3>
              <p className="text-xs text-slate-300">
                Thank you for contacting ChargeNear. A support coordinator will follow up with you within 2 business hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:text-white"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Arun Prakash"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="arun@example.com"
                    className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject *</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Host safety inspection inquiry / Booking assistance"
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Message / Inquiry Details *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your question, host location details, or issue..."
                  className="w-full p-3 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-bold text-xs transition-all shadow-glow flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

