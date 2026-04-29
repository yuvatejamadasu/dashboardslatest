import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { X, Check } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

function MapController({ center }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (center) map.flyTo(center, 12);
  }, [center, map]);
  return null;
}

const MapLocationPicker = ({ isOpen, onClose, onSelect, initialPosition }) => {
  const CITIES = {
    Nairobi: { lat: -1.2921, lng: 36.8219 },
    Mombasa: { lat: -4.0435, lng: 39.6682 }
  };
  const [selectedCity, setSelectedCity] = useState('Nairobi');
  const [position, setPosition] = useState(initialPosition || CITIES.Nairobi);

  useEffect(() => {
    if (isOpen && initialPosition && initialPosition.lat && initialPosition.lng) {
      setPosition(initialPosition);
      // Try to determine city from initial position roughly
      if (initialPosition.lat > -2 && initialPosition.lat < 0) setSelectedCity('Nairobi');
      else if (initialPosition.lat < -3) setSelectedCity('Mombasa');
    }
  }, [isOpen, initialPosition]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setPosition(CITIES[city]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white dark:bg-[#212529] rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col animate-slide-up h-[80vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#1a1d21]">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Select Location</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Click anywhere on the map to drop a pin.</p>
            </div>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className="border rounded-lg px-4 py-2 text-sm font-bold outline-none transition-all bg-white border-slate-200 text-slate-700 dark:bg-[#212529] dark:border-slate-600 dark:text-slate-300"
            >
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
            </select>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:text-white dark:hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 relative bg-slate-100 dark:bg-slate-800 z-0">
          <MapContainer 
            center={position} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={CITIES[selectedCity]} />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#212529] flex justify-between items-center">
          <div className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Selected: <span className="text-brand ml-1">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onSelect(position);
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand/30"
          >
            <Check size={16} />
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapLocationPicker;
