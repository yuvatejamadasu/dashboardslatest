import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ExternalLink, Globe } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapDisplay = ({ latitude, longitude, isDark }) => {
  // Parse coordinates or fallback to Nairobi
  const lat = parseFloat(latitude) || -1.2921;
  const lng = parseFloat(longitude) || 36.8219;
  const position = [lat, lng];
  
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="mt-6 w-full h-48 rounded-2xl overflow-hidden relative group cursor-pointer border dark:border-slate-700 shadow-inner"
         onClick={() => window.open(googleMapsUrl, '_blank')}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        touchZoom={false}
        doubleClickZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={isDark ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />
        <Marker position={position} />
      </MapContainer>
      
      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 z-[1000]">
        <div className="bg-white dark:bg-slate-800 p-2.5 rounded-full shadow-2xl transform scale-90 group-hover:scale-100 transition-all duration-300">
          <ExternalLink size={20} className="text-brand" />
        </div>
      </div>
      
      {/* Info Badge */}
      <div className="absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 backdrop-blur-md z-[1000] border border-black/5 dark:border-white/5 shadow-xl transition-transform group-hover:scale-105">
        <Globe size={12} className="text-brand" />
        <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>View on Google Maps</span>
      </div>
    </div>
  );
};

export default MapDisplay;
