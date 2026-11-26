import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Zap,
  MapPin,
  Calendar,
  PlusCircle,
  LayoutDashboard,
  Shield,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  DollarSign,
  Compass
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, isRider, isHost, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // ignore silent notification error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-brand-400 bg-navy-850/80 shadow-sm'
        : 'text-slate-300 hover:text-brand-300 hover:bg-slate-800/40'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-navy-950/90 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-electric flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-5 h-5 text-navy-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Charge<span className="text-brand-400">Near</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  P2P
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Every Plug Can Power a Ride</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link to="/chargers" className={navLinkClass('/chargers')}>
              <div className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-brand-400" />
                <span>Find Chargers</span>
              </div>
            </Link>
            <Link to="/map" className={navLinkClass('/map')}>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Interactive Map</span>
              </div>
            </Link>

            {/* Role-specific Nav Items */}
            {isAuthenticated && isRider && (
              <>
                <Link to="/rider/dashboard" className={navLinkClass('/rider/dashboard')}>
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    <span>Rider Hub</span>
                  </div>
                </Link>
                <Link to="/rider/bookings" className={navLinkClass('/rider/bookings')}>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span>My Bookings</span>
                  </div>
                </Link>
              </>
            )}

            {isAuthenticated && isHost && (
              <>
                <Link to="/host/dashboard" className={navLinkClass('/host/dashboard')}>
                  <div className="flex items-center gap-1.5">
                    <LayoutDashboard className="w-4 h-4 text-brand-400" />
                    <span>Host Hub</span>
                  </div>
                </Link>
                <Link to="/host/add-charger" className={navLinkClass('/host/add-charger')}>
                  <div className="flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-brand-400" />
                    <span>Add Plug</span>
                  </div>
                </Link>
                <Link to="/host/listings" className={navLinkClass('/host/listings')}>
                  <span>Listings</span>
                </Link>
                <Link to="/host/earnings" className={navLinkClass('/host/earnings')}>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-brand-400" />
                    <span>Earnings</span>
                  </div>
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link to="/admin/dashboard" className={navLinkClass('/admin/dashboard')}>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-semibold">Admin Center</span>
                  </div>
                </Link>
              </>
            )}

            <Link to="/about" className={navLinkClass('/about')}>
              About
            </Link>
            <Link to="/contact" className={navLinkClass('/contact')}>
              Contact
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications (if authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 relative transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl p-3 z-50">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-semibold text-sm text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-brand-400" /> Notifications
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-brand-400 hover:text-brand-300"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 mt-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 text-xs rounded-lg transition-colors ${
                              n.isRead ? 'text-slate-400' : 'bg-slate-800/50 text-slate-200 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-white text-xs">{n.title}</span>
                              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Account / Profile or Auth Buttons */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user?.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-brand-400/50"
                  />
                  <span className="text-xs font-semibold text-white hidden sm:block max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-navy-900 border border-slate-700 shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      {isRider && (
                        <Link
                          to="/rider/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Rider Dashboard</span>
                        </Link>
                      )}

                      {isHost && (
                        <Link
                          to="/host/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-slate-800"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                          <span>Host Dashboard</span>
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-amber-300 hover:text-amber-200 hover:bg-slate-800"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-navy-950 shadow-glow transition-all font-sans font-bold"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-navy-900 border-b border-slate-800 px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/chargers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Find Chargers
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Interactive Map
          </Link>
          {isAuthenticated && isRider && (
            <>
              <Link
                to="/rider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Rider Dashboard
              </Link>
              <Link
                to="/rider/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                My Bookings
              </Link>
            </>
          )}
          {isAuthenticated && isHost && (
            <>
              <Link
                to="/host/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Host Dashboard
              </Link>
              <Link
                to="/host/add-charger"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Add Charging Point
              </Link>
              <Link
                to="/host/listings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Manage Listings
              </Link>
              <Link
                to="/host/earnings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
              >
                Earnings
              </Link>
            </>
          )}
          {isAuthenticated && isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:bg-slate-800"
            >
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}

