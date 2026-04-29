import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Store, User, MapPin, Eye, Search, Loader2, LayoutGrid, List, Edit2, Trash2, X, Crosshair, Map as MapIcon, ChevronDown, Globe } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { superAdminService, validateKenyaMobile } from "@/services/super-admin/superAdminService";
import { useTranslation } from 'react-i18next';
import MapLocationPicker from '@/components/common/MapLocationPicker';
import { fetchAddressFromCoordinates } from '@/utils/geocode';
import Pagination from '@/components/common/Pagination';

const StoreList = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [stores, setStores] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [selectedHub, setSelectedHub] = useState(searchParams.get('hubId') || 'all');
  const [selectedStore, setSelectedStore] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('storeListMode') || 'grid');
  const [editingStore, setEditingStore] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          ...(fetchedAddress ? { address: fetchedAddress } : {})
        }));
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        alert('Unable to retrieve your location');
      }
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this store?')) {
      try {
        await superAdminService.deleteStore(id);
        setStores(stores.filter(s => s.id !== id));
      } catch (err) {
        alert('Error deleting store: ' + err.message);
      }
    }
  };

  const handleEdit = (store) => {
    setEditingStore({ ...store });
  };

  const handleSaveEdit = async () => {
    if (editingStore.mobile && !validateKenyaMobile(editingStore.mobile)) {
      alert(editingStore.mobile.length < 9 ? "Enter valid mobile number" : "Kenya mobile number must be exactly 9 digits.");
      return;
    }
    try {
      const updated = await superAdminService.updateStore(editingStore.id, editingStore);
      setStores(stores.map(s => s.id === updated.id ? updated : s));
      setEditingStore(null);
    } catch (err) {
      alert('Error updating store: ' + err.message);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('storeListMode', mode);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [storesData, hubsData] = await Promise.all([
          superAdminService.getStores(),
          superAdminService.getHubs()
        ]);
        setStores(storesData);
        setHubs(hubsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load stores or hubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await superAdminService.updateStoreStatus(id, newStatus);
      setStores(stores.map(store => store.id === id ? { ...store, status: newStatus } : store));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredStores = stores.filter(store => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (store.name || '').toLowerCase().includes(q) ||
      (store.ownerName || store.owner_name || '').toLowerCase().includes(q) ||
      (store.address || store.location || '').toLowerCase().includes(q) ||
      (store.storeCustomId || '').toLowerCase().includes(q)
    );

    const matchesHub = selectedHub === 'all' || 
                       String(store.hubId) === String(selectedHub) || 
                       String(store.hub_id) === String(selectedHub);
    
    const matchesStore = selectedStore === 'all' || String(store.id) === String(selectedStore);
    
    const matchesStatus = selectedStatus === 'all' || store.status === selectedStatus;

    return matchesSearch && matchesHub && matchesStore && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStores = filteredStores.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedHub, selectedStore, selectedStatus]);

  const storesInSelectedHub = selectedHub === 'all' 
    ? stores 
    : stores.filter(s => String(s.hubId) === String(selectedHub) || String(s.hub_id) === String(selectedHub));

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>{t('stores_list.title')}</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('stores_list.subtitle')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Hub Filter */}
          <div className="relative min-w-[160px]">
            <select
              value={selectedHub}
              onChange={(e) => {
                setSelectedHub(e.target.value);
                setSelectedStore('all');
              }}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#2c3136] border-slate-700 text-white focus:border-brand' 
                  : 'bg-white border-slate-200 text-slate-700 focus:border-[#1d5ba0] shadow-sm'
              }`}
            >
              <option value="all">All Hubs</option>
              {hubs.map(hub => (
                <option key={hub.id} value={hub.id}>{hub.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Store Filter */}
          <div className="relative min-w-[160px] transition-all duration-300">
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#2c3136] border-slate-700 text-white focus:border-brand' 
                  : 'bg-white border-slate-200 text-slate-700 focus:border-[#1d5ba0] shadow-sm'
              }`}
            >
              <option value="all">All Stores</option>
              {storesInSelectedHub.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold border outline-none transition-all cursor-pointer ${
                isDark 
                  ? 'bg-[#2c3136] border-slate-700 text-white focus:border-brand' 
                  : 'bg-white border-slate-200 text-slate-700 focus:border-[#1d5ba0] shadow-sm'
              }`}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 size={40} className="animate-spin text-[#1d5ba0] mb-4" />
          <p className="font-medium">Fetching registered stores...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder={t('stores_list.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#1d5ba0]'
                }`}
              />
            </div>
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title={t('common.list_view')}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title={t('common.grid_view')}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          <div className="p-0">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-[#1d5ba0] text-white'} text-xs font-bold uppercase tracking-wider`}>
                      <th className="px-6 py-4 rounded-tl-lg">S.No</th>
                      <th className="px-6 py-4">Store ID</th>
                      <th className="px-6 py-4">{t('common.name')}</th>
                      <th className="px-6 py-4">{t('stores_list.owner')}</th>
                      <th className="px-6 py-4">{t('common.address')}</th>
                      <th className="px-6 py-4">Hub</th>
                      <th className="px-6 py-4">{t('common.status')}</th>
                      <th className="px-6 py-4 text-right rounded-tr-lg">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                    {currentStores.map((store, index) => (
                      <tr key={store.id} className={`group transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#1d5ba0]/10'}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-400">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td className={`px-6 py-4 text-xs font-black ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>
                          {store.storeCustomId || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#1d5ba0]/10 text-[#1d5ba0]'}`}>
                              <Store size={16} />
                            </div>
                            <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{store.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <User size={14} className="shrink-0" />
                            <span className="font-medium">{store.ownerName || store.owner_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <MapPin size={14} className="shrink-0" />
                            <span className="truncate max-w-[180px]">{store.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-brand">
                          {hubs.find(h => String(h.id) === String(store.hubId) || String(h.id) === String(store.hub_id))?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            store.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : store.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {store.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => navigate(`/store/${store.id}`)}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                                isDark 
                                  ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500 hover:text-white' 
                                  : 'bg-[#1d5ba0] text-white hover:bg-white hover:text-[#1d5ba0] border border-[#1d5ba0]'
                              }`}
                            >
                              <Eye size={14} />
                              View
                            </button>
                            {store.status !== 'Active' && (
                              <button 
                                onClick={() => handleStatusChange(store.id, 'Active')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20`}
                              >
                                Set Active
                              </button>
                            )}
                            {store.status !== 'Inactive' && (
                              <button 
                                onClick={() => handleStatusChange(store.id, 'Inactive')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20`}
                              >
                                Set Inactive
                              </button>
                            )}
                            <button 
                              onClick={() => handleEdit(store)}
                              className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-500/20`}
                              title={t('common.edit')}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(store.id)}
                              className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20`}
                              title={t('common.delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredStores.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic text-sm">{t('stores_list.no_stores')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                {currentStores.length > 0 ? currentStores.map(store => (
                  <div key={store.id} className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    {/* ... inner card code ... */}
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
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-slate-400 shrink-0" />
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.ownerName || store.owner_name}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-slate-400 shrink-0" />
                        <p className={`text-sm font-bold ${isDark ? 'text-brand' : 'text-[#1d5ba0]'}`}>
                          {hubs.find(h => String(h.id) === String(store.hubId) || String(h.id) === String(store.hub_id))?.name || 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-2 border-slate-100 dark:border-slate-700/50">
                      <button 
                        onClick={() => navigate(`/store/${store.id}`)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                          isDark ? 'bg-slate-800 text-white hover:bg-orange-500' : 'bg-slate-100 text-slate-700 hover:bg-[#1d5ba0] hover:text-white'
                        }`}
                      >
                        <Eye size={16} /> View Details
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
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(store.id)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex justify-center items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center text-gray-400 italic text-sm">
                    {t('stores_list.no_stores')}
                  </div>
                )}
              </div>
            )}

            {/* Pagination Controls */}
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              isDark={isDark}
            />
          </div>
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
            <div className="space-y-4">
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
                  <label className="block text-sm font-bold mb-1">Owner Name</label>
                  <input 
                    type="text" 
                    value={editingStore.ownerName || editingStore.owner_name || ''} 
                    onChange={e => setEditingStore({...editingStore, ownerName: e.target.value, owner_name: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mobile</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-2 border-slate-300">
                      <span className="text-sm font-bold text-slate-500">+254</span>
                    </div>
                    <input 
                      type="tel" 
                      value={editingStore.mobile || ''} 
                      onChange={e => {
                        if (e.target.value.length > 9) alert("Kenya mobile number must be exactly 9 digits.");
                        setEditingStore({...editingStore, mobile: e.target.value});
                      }}
                      className={`w-full pl-16 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                      placeholder="+254 7XX XXXXXX"
                    />
                  </div>
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
                  value={editingStore.address || ''} 
                  onChange={e => setEditingStore({...editingStore, address: e.target.value})}
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
            ...(fetchedAddress ? { address: fetchedAddress } : {})
          }));
        }} 
        initialPosition={editingStore?.latitude && editingStore?.longitude ? { lat: parseFloat(editingStore.latitude), lng: parseFloat(editingStore.longitude) } : null}
      />
    </div>
  );
};

export default StoreList;
