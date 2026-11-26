import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Heart, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-slate-800/80 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-electric flex items-center justify-center">
                <Zap className="w-4 h-4 text-navy-950 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Charge<span className="text-brand-400">Near</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every Plug Can Power a Ride. Connecting electric two-wheeler riders with verified residential, shop, and cafe charging hosts across Chennai.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Earth Tested Plugs</span>
            </div>
          </div>

          {/* Col 2: For EV Riders */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">For EV Riders</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/chargers" className="hover:text-brand-300 transition-colors">
                  Find Nearby Plugs
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-brand-300 transition-colors">
                  Interactive Live Map
                </Link>
              </li>
              <li>
                <Link to="/rider/dashboard" className="hover:text-brand-300 transition-colors">
                  Rider Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">
                  Compatibility Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Charging Hosts */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">For Charging Hosts</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/host/add-charger" className="hover:text-brand-300 transition-colors">
                  List Your Charger
                </Link>
              </li>
              <li>
                <Link to="/host/dashboard" className="hover:text-brand-300 transition-colors">
                  Host Earnings Hub
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-300 transition-colors">
                  Electrical Safety Standards
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-300 transition-colors">
                  Host Verification Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Pilot Hub & City */}
          <div className="space-y-2 text-xs">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Pilot Hub</h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <span>Chennai, Tamil Nadu (T. Nagar, Adyar, Velachery, OMR, Anna Nagar)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-brand-400 shrink-0" />
              <span>support@chargenear.com</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-brand-400 shrink-0" />
              <span>+91 98400 11223</span>
            </div>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-slate-500 text-center sm:text-left">
            © 2026 ChargeNear Technologies. Built for electric two-wheeler riders. Every plug can power a ride.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/about" className="hover:text-brand-400">Safety Policy</Link>
            <Link to="/contact" className="hover:text-brand-400">Terms of Service</Link>
            <Link to="/contact" className="hover:text-brand-400">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

