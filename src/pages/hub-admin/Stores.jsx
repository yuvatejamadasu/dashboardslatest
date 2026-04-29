import React, { useState, useEffect } from 'react';
import { Store, MapPin, Star, ArrowRight, Search, Phone, User, Activity, Edit2, Trash2, X, Crosshair, Map as MapIcon, Loader2, Eye, Globe } from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import useFetch from '@/hooks/hub-admin/useFetch';
import DataState from '@/components/hub-admin/DataState';
import { API } from '@/config/hub-admin/api';
import { useTranslation } from 'react-i18next';
import MapLocationPicker from '@/components/common/MapLocationPicker';
import { fetchAddressFromCoordinates } from '@/utils/geocode';

import { useAuth } from '@/context/AuthContext';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';

const Stores = () => {
  console.log('Stores component mounting...');
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const fetchedAddress = await fetchAddressFromCoordinates(lat, lng);
        
        setEditingStore(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          ...(fetchedAddress ? { location: fetchedAddress, address: fetchedAddress } : {})
        }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert('Unable to retrieve your location');
      }
    );
  };

  const { userData } = useAuth();
  const [localStores, setLocalStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingStore, setEditingStore] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchStores = async () => {
      const hubId = userData?.hubId || userData?.entityId;
      if (!hubId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await hubAdminService.getStoresByHub(hubId);
        setLocalStores(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [userData]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        // For now, hub admins can't permanently delete from Firebase via this service 
        // unless we add deleteStore to hubAdminService.
        // We'll use status 'Deleted' or similar if needed, or just let them delete.
        // But the requirement says "store all information", so maybe move to trash?
        // For simplicity, we'll just remove from list if we had a delete method.
        alert("Deletion restricted to Super Admin or implementation pending.");
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleEdit = (store) => {
    setEditingStore({ ...store });
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await hubAdminService.updateStore(editingStore.id, editingStore);
      setLocalStores(localStores.map(s => s.id === updated.id ? updated : s));
      setEditingStore(null);
    } catch (err) {
      alert('Error updating store: ' + err.message);
    }
  };
  
  const handleStatusChange = async (id, newStatus) => {
    try {
      await hubAdminService.updateStoreStatus(id, newStatus);
      setLocalStores(localStores.map(store => store.id === id ? { ...store, status: newStatus } : store));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const allStores = localStores;
  
  const filtered = allStores.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (s.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.location || s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: t('hub_stores.total_stores'), value: allStores.length, icon: <Store size={18} className="text-brand" /> },
    { label: t('hub_stores.active_locations'), value: allStores.filter(s => s.status === 'Active').length, icon: <Activity size={18} className="text-emerald-500" /> },
    { label: t('hub_stores.avg_rating'), value: allStores.length > 0 ? (allStores.reduce((a, s) => a + (parseFloat(s.rating) || 0), 0) / allStores.length).toFixed(1) : '0.0', icon: <Star size={18} className="text-amber-500" /> },
  ];

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('hub_stores.title')}</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('hub_stores.subtitle')}</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" 
                placeholder={t('hub_stores.search_placeholder')}
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#2c3136] border-slate-600 text-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-brand focus:ring-4 focus:ring-brand/5 shadow-sm'
                }`}
              />
            </div>
            <button
              onClick={() => navigate('/hub-dashboard/stores/create')}
              className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isDark ? 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20' : 'bg-brand text-white hover:bg-brand-hover shadow-md'
              }`}
            >
              Add Store
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(s => (
            <div key={s.label} className={`p-6 rounded-2xl border flex items-center gap-4 transition-all hover:translate-y-[-2px] ${
              isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-xl' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                {s.icon}
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{s.label}</p>
                <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(store => (
            <div key={store.id} className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-orange-500' : 'bg-orange-500/10 text-orange-600'}`}>
                    <Store size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.name}</h3>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-brand/10 text-brand`}>
                        {store.storeCustomId || 'N/A'}
                      </span>
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      store.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : store.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {store.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-amber-600">{store.rating || '0.0'}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.ownerName || store.manager || 'No manager assigned'}</p>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.address || store.location || 'No address provided'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-400 shrink-0" />
                  <p className={`text-sm font-bold ${isDark ? 'text-brand' : 'text-brand'}`}>
                    {userData?.hubName || userData?.fullName || 'Your Hub'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col gap-2 border-slate-100 dark:border-slate-700/50">
                <button 
                  onClick={() => navigate(`/hub-dashboard/stores/${store.id}/analytics`)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all ${
                    isDark ? 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20' : 'bg-brand text-white hover:bg-brand-hover shadow-md'
                  }`}
                >
                  Store Analytics <ArrowRight size={16} />
                </button>
                <button 
                  onClick={() => navigate(`/hub-dashboard/stores/${store.id}`)}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all border ${
                    isDark ? 'bg-[#2c3136] border-slate-700 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'
                  }`}
                >
                  View Details <Activity size={16} />
                </button>
                <div className="flex gap-2">
                  {store.status !== 'Active' && (
                    <button 
                      onClick={() => handleStatusChange(store.id, 'Active')}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors flex justify-center items-center"
                    >
                      Set Active
                    </button>
                  )}
                  {store.status !== 'Inactive' && (
                    <button 
                      onClick={() => handleStatusChange(store.id, 'Inactive')}
                      className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex justify-center items-center"
                    >
                      Set Inactive
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(store)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors flex justify-center items-center gap-1"
                  >
                    <Edit2 size={12} /> {t('common.edit')}
                  </button>
                  <button 
                    onClick={() => handleDelete(store.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex justify-center items-center gap-1"
                  >
                    <Trash2 size={12} /> {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{t('stores_list.no_stores')}</p>
          </div>
        )}

        {/* Edit Modal */}
        {editingStore && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-[#2c3136] text-white' : 'bg-white text-slate-800'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Edit Store</h3>
                <button onClick={() => setEditingStore(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                  <X size={20} />
                </button>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Store Name</label>
                <input 
                  type="text" 
                  value={editingStore.name} 
                  onChange={e => setEditingStore({...editingStore, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Manager / Owner</label>
                  <input 
                    type="text" 
                    value={editingStore.manager || editingStore.ownerName || ''} 
                    onChange={e => setEditingStore({...editingStore, manager: e.target.value, ownerName: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mobile</label>
                  <input 
                    type="tel" 
                    value={editingStore.mobile || ''} 
                    onChange={e => setEditingStore({...editingStore, mobile: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email</label>
                <input 
                  type="email" 
                  value={editingStore.email || ''} 
                  onChange={e => setEditingStore({...editingStore, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Location / Address</label>
                <input 
                  type="text" 
                  value={editingStore.location || editingStore.address || ''} 
                  onChange={e => setEditingStore({...editingStore, location: e.target.value, address: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>
              {/*
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Latitude</label>
                  <input 
                    type="text" 
                    value={editingStore.latitude || ''} 
                    onChange={e => setEditingStore({...editingStore, latitude: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Longitude</label>
                  <input 
                    type="text" 
                    value={editingStore.longitude || ''} 
                    onChange={e => setEditingStore({...editingStore, longitude: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
              </div>
              */}
            
              {/* Get Location Buttons */}
              <div className="flex justify-end mt-2 gap-4">
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
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setEditingStore(null)}
                  className={`flex-1 py-2.5 rounded-xl font-bold transition-colors ${isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl font-bold bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        <MapLocationPicker 
          isOpen={isMapOpen} 
          onClose={() => setIsMapOpen(false)} 
          onSelect={async (pos) => {
            const lat = pos.lat.toFixed(6);
            const lng = pos.lng.toFixed(6);
            const fetchedAddress = await fetchAddressFromCoordinates(lat, lng);
            setEditingStore(prev => ({ 
              ...prev, 
              latitude: lat, 
              longitude: lng,
              ...(fetchedAddress ? { location: fetchedAddress, address: fetchedAddress } : {})
            }));
          }} 
          initialPosition={editingStore?.latitude && editingStore?.longitude ? { lat: parseFloat(editingStore.latitude), lng: parseFloat(editingStore.longitude) } : null}
        />
      </div>
    </DataState>
  );
};

export default Stores;
