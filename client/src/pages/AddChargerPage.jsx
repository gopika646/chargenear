import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import {
  Zap,
  Building2,
  MapPin,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Compass
} from 'lucide-react';
import toast from 'react-hot-toast';

function LocationPicker({ lat, lng, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });

  const customPin = L.divIcon({
    className: 'custom-charger-pin',
    html: `
      <div style="background:#10b981;color:#0b132b;font-weight:800;font-size:11px;padding:4px 8px;border-radius:9999px;border:2px solid #fff;display:flex;align-items:center;gap:3px;box-shadow:0 4px 12px rgba(0,0,0,0.5);transform:translate(-50%,-100%);">
        <span>⚡ Station Here</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [0, 0]
  });

  return lat && lng ? <Marker position={[lat, lng]} icon={customPin} /> : null;
}

export default function AddChargerPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'RESIDENTIAL',
    description: '',
    address: '',
    landmark: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    latitude: '13.0418',
    longitude: '80.2341',
    pricePerHour: '35',
    availableFrom: '06:00',
    availableTo: '23:00',
    // Equipment
    equipmentName: '16A Smart Grounded Socket',
    equipmentType: 'SOCKET_16A',
    connectorType: 'PIN_3_16A',
    powerKw: '3.3',
    voltageV: '230',
    currentA: '16',
    isDedicatedEvse: false,
    hasEarthProtection: true,
    photoUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80'
  });

  // Selected vehicle compatibility tags
  const [supportedVehicles, setSupportedVehicles] = useState([
    'Ather 450X',
    'Ola S1 Pro',
    'TVS iQube',
    'Bajaj Chetak',
    'Hero Vida',
    'Generic 16A 3-Pin'
  ]);

  // Selected safety features
  const [safetyFeatures, setSafetyFeatures] = useState([
    'Dedicated Copper Earth Rod (<3 Ohm)',
    '30mA RCCB / RCBO Protection',
    'Double-Pole MCB C-Curve',
    'Weatherproof IP65 Housing'
  ]);

  // Amenities
  const [amenities, setAmenities] = useState([
    'Covered Bay',
    'CCTV Monitored',
    'Restroom Access'
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleItem = (list, setList, item) => {
    if (list.includes(item)) {
      setList(list.filter((x) => x !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.address) {
      toast.error('Title and full address are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        powerKw: parseFloat(formData.powerKw),
        voltageV: parseInt(formData.voltageV),
        currentA: parseInt(formData.currentA),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        images: [formData.photoUrl],
        supportedVehicles,
        safetyFeatures,
        amenities
      };

      const res = await api.createCharger(payload);
      if (res.success) {
        toast.success('Charging point listed! Submitted for Admin Safety Verification.');
        navigate('/host/listings');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to list charging location');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link to="/host/dashboard" className="hover:text-brand-300">← Back to Host Hub</Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          List a New Charging Point
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Provide accurate electrical and location details. All listings require admin verification for rider safety.
        </p>
      </div>

      {/* Mandatory Admin Verification Notice */}
      <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-white block uppercase tracking-wider text-[11px]">
            Safety Compliance Notice
          </span>
          <p className="text-slate-300">
            To prevent battery damage and electrical hazards, ChargeNear verifies all listings before they appear on the public map. Never list an unverified ordinary household socket without tested copper grounding.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Location Details */}
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>1. Location & Property Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Listing Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Adyar Solar Porch EV Point"
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              >
                <option value="RESIDENTIAL">Residential (Home / Porch / Driveway)</option>
                <option value="CAFE">Cafe / Restaurant</option>
                <option value="SHOP">Retail Store / Mart</option>
                <option value="OFFICE">Office / Tech Park</option>
                <option value="PARKING">Commercial Parking Bay</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Street Address *</label>
            <input
              type="text"
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. 14/2 Gandhi Nagar 3rd Main Rd, Adyar"
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Near Cancer Institute"
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="600020"
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Coordinates & Interactive Map Dropper */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300">
                GPS Coordinates (Click on Map to Pin Your Exact Plug Location)
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Quick presets:</span>
                {[
                  { name: 'T. Nagar', lat: 13.0418, lng: 80.2341 },
                  { name: 'Adyar', lat: 13.0067, lng: 80.2573 },
                  { name: 'Velachery', lat: 12.9784, lng: 80.2185 },
                  { name: 'OMR', lat: 12.9644, lng: 80.2443 }
                ].map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, latitude: p.lat.toFixed(4), longitude: p.lng.toFixed(4) }))}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-navy-950 border border-slate-700 text-slate-300 hover:text-brand-300"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Leaflet Picker Map */}
            <div className="h-56 w-full rounded-2xl overflow-hidden border border-slate-800 relative shadow-inner">
              <MapContainer
                center={[parseFloat(formData.latitude) || 13.0418, parseFloat(formData.longitude) || 80.2341]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', backgroundColor: '#0b132b' }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <LocationPicker
                  lat={parseFloat(formData.latitude) || 13.0418}
                  lng={parseFloat(formData.longitude) || 80.2341}
                  onSelect={(lat, lng) => {
                    setFormData((prev) => ({ ...prev, latitude: lat.toFixed(4), longitude: lng.toFixed(4) }));
                    toast.success(`Coordinates updated: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                  }}
                />
              </MapContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Latitude</label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Longitude</label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea
              name="description"
              rows="2"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe access instructions, parking space, surroundings..."
              className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Section 2: Electrical Specifications & Equipment */}
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-brand-400" />
            <span>2. Electrical Equipment & Safety Classification</span>
          </h2>

          {/* Critical distinction: Dedicated EVSE vs Socket */}
          <div className="p-4 rounded-2xl bg-navy-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Equipment Classification:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                onClick={() => setFormData((p) => ({ ...p, isDedicatedEvse: false, equipmentType: 'SOCKET_16A', connectorType: 'PIN_3_16A' }))}
                className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                  !formData.isDedicatedEvse ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800'
                }`}
              >
                <span className="font-bold text-xs text-white block">🔌 Heavy-Duty 16A 3-Pin Socket</span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Ordinary power socket tested with grounding rod. Riders plug their portable EV charger.
                </span>
              </label>

              <label
                onClick={() => setFormData((p) => ({ ...p, isDedicatedEvse: true, equipmentType: 'WALLBOX_TYPE2', connectorType: 'TYPE_2', powerKw: '7.4' }))}
                className={`p-3 rounded-xl border cursor-pointer block transition-all ${
                  formData.isDedicatedEvse ? 'border-brand-500 bg-brand-500/10' : 'border-slate-800'
                }`}
              >
                <span className="font-bold text-xs text-white block">⚡ Dedicated Level 2 AC Wallbox</span>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Certified permanent EVSE charging unit with built-in Type 2 connector and auto cutoff.
                </span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Power Capacity (kW)</label>
              <input
                type="number"
                step="0.1"
                name="powerKw"
                value={formData.powerKw}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Voltage (V)</label>
              <input
                type="number"
                name="voltageV"
                value={formData.voltageV}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current (Amps)</label>
              <input
                type="number"
                name="currentA"
                value={formData.currentA}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono"
              />
            </div>
          </div>

          {/* Vehicle Compatibility Multi-Select */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300">Supported EV Two-Wheelers</label>
            <div className="flex flex-wrap gap-2">
              {['Ather 450X', 'Ola S1 Pro', 'TVS iQube', 'Bajaj Chetak', 'Hero Vida', 'Simple One', 'Generic 16A 3-Pin'].map((veh) => (
                <button
                  key={veh}
                  type="button"
                  onClick={() => toggleItem(supportedVehicles, setSupportedVehicles, veh)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    supportedVehicles.includes(veh)
                      ? 'bg-brand-500 text-navy-950 border-brand-400 font-bold'
                      : 'bg-navy-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {supportedVehicles.includes(veh) ? '✓ ' : '+ '}
                  {veh}
                </button>
              ))}
            </div>
          </div>

          {/* Installed Safety Protection */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-300">Installed Safety Protections</label>
            <div className="flex flex-wrap gap-2">
              {[
                'Dedicated Copper Earth Rod (<3 Ohm)',
                '30mA RCCB / RCBO Protection',
                'Double-Pole MCB C-Curve',
                'Weatherproof IP65 Housing',
                'Surge Protection Device (SPD)',
                'CCTV Monitored Bay'
              ].map((feat) => (
                <button
                  key={feat}
                  type="button"
                  onClick={() => toggleItem(safetyFeatures, setSafetyFeatures, feat)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                    safetyFeatures.includes(feat)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-navy-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {safetyFeatures.includes(feat) ? '✓ ' : '+ '}
                  {feat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Pricing, Hours, Photos */}
        <div className="p-6 rounded-3xl bg-navy-900/80 border border-slate-800 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-brand-400" />
            <span>3. Pricing & Availability</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price Per Hour (₹) *</label>
              <input
                type="number"
                name="pricePerHour"
                required
                value={formData.pricePerHour}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs font-mono font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Recommended: ₹30 - ₹45/hr</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Opens At</label>
              <input
                type="time"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Closes At</label>
              <input
                type="time"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Photo URL</label>
            <input
              type="url"
              name="photoUrl"
              value={formData.photoUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl bg-navy-950 border border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-navy-950 font-black text-sm transition-all shadow-glow flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Charging Point for Verification</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

