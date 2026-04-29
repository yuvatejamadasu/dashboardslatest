import React, { useState, useEffect } from 'react';
import { Store, User, Phone, Mail, MapPin, CheckCircle2, AlertCircle, X, Crosshair, Loader2, Map as MapIcon } from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useProfile } from '@/context/hub-admin/ProfileContext';
import { useNavigate } from 'react-router-dom';
import MapLocationPicker from '@/components/common/MapLocationPicker';
import { superAdminService } from "@/services/super-admin/superAdminService";
import { fetchAddressFromCoordinates } from '@/utils/geocode';

const CreateAdmin = () => {
  const { isDark } = useTheme();
  const { profile } = useProfile();
  const navigate = useNavigate();
  
  const currentHubName = profile?.fullName || 'Current Hub';
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    mobile: '',
    email: '',
    address: '',
    latitude: '',
    longitude: ''
  });

  const [errors, setErrors] = useState({});
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  // Auto-dismiss popup after 3 seconds
  useEffect(() => {
    if (popup.message) {
      const timer = setTimeout(() => {
        setPopup({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.message]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Store Name is required';
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Owner Name is required';
    
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile Number is required';
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Must be exactly 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    /*
    if (!formData.latitude.trim()) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(formData.latitude)) {
      newErrors.latitude = 'Latitude must be numeric';
    }

    if (!formData.longitude.trim()) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(formData.longitude)) {
      newErrors.longitude = 'Longitude must be numeric';
    }
    */

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setPopup({ message: 'Geolocation is not supported by your browser', type: 'error' });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const fetchedAddress = await fetchAddressFromCoordinates(lat, lng);
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          ...(fetchedAddress ? { address: fetchedAddress } : {})
        }));
        setIsLocating(false);
        setPopup({ message: 'Location detected successfully', type: 'success' });
      },
      (error) => {
        setIsLocating(false);
        setPopup({ message: 'Unable to retrieve your location', type: 'error' });
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Global required check
    const isAnyEmpty = !formData.name.trim() || !formData.ownerName.trim() || !formData.mobile.trim() || 
                       !formData.email.trim() || !formData.address.trim(); 
                       // !formData.latitude.trim() || !formData.longitude.trim();

    if (isAnyEmpty) {
      setPopup({ message: 'Please fill all required fields', type: 'error' });
      validate(); // Trigger inline errors
      return;
    }

    if (!validate()) {
      setPopup({ message: 'Please check the highlighted fields', type: 'error' });
      return;
    }

    // Success logic
    try {
      setIsSubmitting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save the new store via superAdminService so it syncs across all dashboards
      const newStore = {
        name: formData.name,
        category: 'New Store',
        location: formData.address.split(',')[0] || 'Unknown Location',
        address: formData.address,
        hubId: '1',
        products: 0,
        revenue: 'KES 0',
        rating: 0,
        initials: formData.name.substring(0, 2).toUpperCase(),
        color: 'bg-brand',
        ownerName: formData.ownerName,
        mobile: formData.mobile,
        email: formData.email,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      
      await superAdminService.createStore(newStore);

      setPopup({ message: 'Store created successfully', type: 'success' });
      
      // Reset form fields
      setFormData({
        name: '',
        ownerName: '',
        mobile: '',
        email: '',
        address: '',
        latitude: '',
        longitude: ''
      });
      setErrors({});
      setTimeout(() => navigate('/hub-dashboard/sellers'), 1500);
    } catch (error) {
      setPopup({ message: error.message || 'Failed to create store', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const inputClasses = (fieldName) => `
    w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all
    ${errors[fieldName] 
      ? 'border-rose-500 focus:ring-rose-200 bg-rose-50/10' 
      : (isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/20 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-brand/20 text-slate-800 placeholder-slate-400')
    }
  `;

  const labelClasses = `text-sm font-bold mb-2 block ${isDark ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in relative">
      
      {/* Dynamic Popup / Toast */}
      {popup.message && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border transition-all ${
          popup.type === 'success' 
            ? 'bg-emerald-500 text-white border-emerald-400' 
            : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {popup.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold text-sm tracking-wide">{popup.message}</span>
          <button onClick={() => setPopup({ message: '', type: '' })} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create New Store</h2>
        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Register a new retail store to the platform.</p>
      </div>

      <div className={`p-8 rounded-2xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Store Name */}
            <div className="space-y-1">
              <label className={labelClasses}>Store Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Store size={18} />
                </div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClasses('name')} pl-10`}
                  placeholder="e.g. Daily Fresh"
                />
              </div>
              {errors.name && <p className="text-xs font-bold text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Owner Name */}
            <div className="space-y-1">
              <label className={labelClasses}>Owner Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={`${inputClasses('ownerName')} pl-10`}
                  placeholder="e.g. John Smith"
                />
              </div>
              {errors.ownerName && <p className="text-xs font-bold text-rose-500 mt-1">{errors.ownerName}</p>}
            </div>

            {/* Mobile Number */}
            <div className="space-y-1">
              <label className={labelClasses}>Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Phone size={18} />
                </div>
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`${inputClasses('mobile')} pl-10`}
                  placeholder="10-digit number"
                />
              </div>
              {errors.mobile && <p className="text-xs font-bold text-rose-500 mt-1">{errors.mobile}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className={labelClasses}>Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClasses('email')} pl-10`}
                  placeholder="store@example.com"
                />
              </div>
              {errors.email && <p className="text-xs font-bold text-rose-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Assign Hub */}
          <div className="space-y-1">
            <label className={labelClasses}>Assign to Hub</label>
            <div className="relative">
              <input 
                type="text"
                disabled
                value={currentHubName}
                className={`w-full px-4 py-3 rounded-xl border appearance-none transition-colors opacity-70 cursor-not-allowed ${
                  isDark ? 'bg-[#1a1d21] border-slate-700 text-white font-bold' : 'bg-slate-100 border-slate-200 text-slate-800 font-bold'
                }`}
              />
            </div>
          </div>

          {/* Store Address */}
          <div className="space-y-1">
            <label className={labelClasses}>Store Address</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-slate-400">
                <MapPin size={18} />
              </div>
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
                className={`${inputClasses('address')} pl-10 resize-none`}
                placeholder="Full store address"
              />
            </div>
            {errors.address && <p className="text-xs font-bold text-rose-500 mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Latitude 
            <div className="space-y-1">
              <label className={labelClasses}>Latitude</label>
              <input 
                type="text" 
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={inputClasses('latitude')}
                placeholder="e.g. 17.3850"
              />
              {errors.latitude && <p className="text-xs font-bold text-rose-500 mt-1">{errors.latitude}</p>}
            </div>
            */}

            {/* Longitude 
            <div className="space-y-1">
              <label className={labelClasses}>Longitude</label>
              <input 
                type="text" 
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={inputClasses('longitude')}
                placeholder="e.g. 78.4867"
              />
              {errors.longitude && <p className="text-xs font-bold text-rose-500 mt-1">{errors.longitude}</p>}
            </div>
            */}

            {/* Get Location Buttons */}
            <div className="md:col-span-2 flex justify-end mt-2 gap-4">
              <button
                type="button"
                onClick={() => setIsMapOpen(true)}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isDark ? 'text-brand hover:text-brand-hover' : 'text-[#1d5ba0] hover:text-[#154682]'
                }`}
              >
                <MapIcon size={16} />
                Select on Map
              </button>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                  isDark ? 'text-brand hover:text-brand-hover' : 'text-[#1d5ba0] hover:text-[#154682]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLocating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                Get Current Location
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-4">
            <button 
              type="button"
              onClick={handleCancel}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all ${
                isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-brand hover:bg-brand-hover text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Store'}
            </button>
          </div>
        </form>
      </div>

      <MapLocationPicker 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        onSelect={async (pos) => {
          const lat = pos.lat.toFixed(6);
          const lng = pos.lng.toFixed(6);
          const fetchedAddress = await fetchAddressFromCoordinates(lat, lng);
          setFormData(prev => ({ 
            ...prev, 
            latitude: lat, 
            longitude: lng,
            ...(fetchedAddress ? { address: fetchedAddress } : {})
          }));
        }} 
        initialPosition={formData.latitude && formData.longitude ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) } : null}
      />
    </div>
  );
};

export default CreateAdmin;
