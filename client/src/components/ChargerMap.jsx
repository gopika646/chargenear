import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Zap, MapPin, Star, ArrowRight, ShieldCheck } from 'lucide-react';

// Custom SVG Icon creator for Leaflet
function createCustomPin(price, isDedicated) {
  return L.divIcon({
    className: 'custom-charger-pin',
    html: `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: translate(-50%, -100%);
      ">
        <div style="
          background: ${isDedicated ? '#10b981' : '#0ea5e9'};
          color: #0b132b;
          font-weight: 800;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 9999px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          white-space: nowrap;
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          gap: 3px;
        ">
          <span>⚡ ₹${price}</span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${isDedicated ? '#10b981' : '#0ea5e9'};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [0, 0]
  });
}

// User location marker
function createUserPin() {
  return L.divIcon({
    className: 'custom-user-pin',
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: #38bdf8;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 15px #38bdf8;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

export default function ChargerMap({
  chargers = [],
  center = [13.0418, 80.2341],
  zoom = 12,
  userLocation = null,
  selectedCharger = null,
  height = '500px'
}) {
  return (
    <div style={{ height }} className="w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', backgroundColor: '#0b132b' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater center={center} zoom={zoom} />

        {/* User location pin */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createUserPin()}>
            <Popup>
              <div className="p-2 text-xs">
                <span className="font-bold text-white block">📍 Your Location</span>
                <span className="text-slate-400">Rider reference point</span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Charger Markers */}
        {chargers.map((charger) => {
          if (!charger.latitude || !charger.longitude) return null;
          const isDedicated = charger.equipments?.[0]?.isDedicatedEvse;
          const price = charger.pricePerHour || 35;
          const img = charger.images?.[0] || 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=400&q=80';

          return (
            <Marker
              key={charger.id}
              position={[charger.latitude, charger.longitude]}
              icon={createCustomPin(price, isDedicated)}
            >
              <Popup>
                <div className="w-64 p-3 space-y-2 bg-navy-900 text-slate-100 rounded-xl">
                  <div className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-950">
                    <img src={img} alt={charger.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-navy-950/80 px-2 py-0.5 rounded text-[10px] text-brand-300 font-bold border border-brand-500/20">
                      <Zap className="w-3 h-3 text-brand-400" />
                      <span>₹{price}/hr</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs leading-snug line-clamp-1">{charger.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{charger.landmark || charger.city}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{charger.rating?.toFixed(1) || '4.9'}</span>
                    </div>
                    <span className="text-slate-400">
                      {isDedicated ? 'Level 2 Wallbox' : '16A 3-Pin Socket'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      to={`/chargers/${charger.id}`}
                      className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold text-center rounded-lg"
                    >
                      Details
                    </Link>
                    <Link
                      to={`/booking/${charger.id}`}
                      className="flex-1 py-1.5 px-2 bg-brand-500 hover:bg-brand-400 text-navy-950 text-[11px] font-bold text-center rounded-lg shadow-sm"
                    >
                      Book Slot
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

