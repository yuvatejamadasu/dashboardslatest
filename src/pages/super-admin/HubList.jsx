import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Eye, Search, Loader2, LayoutGrid, List, Edit2, Trash2, X, Crosshair, Map as MapIcon, ChevronDown, Store } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { superAdminService, validateKenyaMobile } from "@/services/super-admin/superAdminService";
import { useTranslation } from 'react-i18next';
import MapLocationPicker from '@/components/common/MapLocationPicker';
import { fetchAddressFromCoordinates } from '@/utils/geocode';
import Pagination from '@/components/common/Pagination';

const HubList = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [hubs, setHubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('hubListMode') || 'grid');
  const [editingHub, setEditingHub] = useState(null);
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
        
        setEditingHub(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          ...(fetchedAddress ? { address: fetchedAddress, location: fetchedAddress } : {})
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
    if (window.confirm('Are you sure you want to delete this hub?')) {
      try {
        await superAdminService.deleteHub(id);
        setHubs(hubs.filter(h => h.id !== id));
      } catch (err) {
        alert('Error deleting hub: ' + err.message);
      }
    }
  };

  const handleEdit = (hub) => {
    setEditingHub({ ...hub });
  };

  const handleSaveEdit = async () => {
    if (editingHub.mobile && !validateKenyaMobile(editingHub.mobile)) {
      alert(editingHub.mobile.length < 9 ? "Enter valid mobile number" : "Kenya mobile number must be exactly 9 digits.");
      return;
    }
    try {
      const updated = await superAdminService.updateHub(editingHub.id, editingHub);
      setHubs(hubs.map(h => h.id === updated.id ? updated : h));
      setEditingHub(null);
    } catch (err) {
      alert('Error updating hub: ' + err.message);
    }
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('hubListMode', mode);
  };

  useEffect(() => {
    const fetchHubs = async () => {
      try {
        setLoading(true);
        const data = await superAdminService.getHubs();
        setHubs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hubs:', err);
        setError('Failed to load hubs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHubs();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await superAdminService.updateHubStatus(id, newStatus);
      setHubs(hubs.map(hub => hub.id === id ? { ...hub, status: newStatus } : hub));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredHubs = hubs.filter(hub => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = (
      (hub.name || '').toLowerCase().includes(q) ||
      (hub.location || hub.address || '').toLowerCase().includes(q) ||
      (hub.manager || hub.managerName || '').toLowerCase().includes(q) ||
      (hub.hubCustomId || '').toLowerCase().includes(q)
    );
    const matchesStatus = selectedStatus === 'all' || hub.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredHubs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentHubs = filteredHubs.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('hubs_list.title')}</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('hubs_list.subtitle')}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/create-hub')}
            className="px-4 py-2.5 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover transition-colors whitespace-nowrap shadow-lg shadow-brand/20"
          >
            {t('hubs_list.add_hub')}
          </button>
          
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
          <p className="font-medium">Loading hubs architecture...</p>
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
                placeholder={t('hubs_list.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-sm'
                }`}
              />
            </div>
            <div className={`flex rounded-xl p-1 border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}
                title={t('common.list_view')}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-400 hover:text-slate-600'}`}
                title={t('common.grid_view')}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="p-0">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-[#1d5ba0] text-white'} text-xs font-bold uppercase tracking-wider`}>
                  <th className="px-6 py-4 font-bold rounded-tl-lg">S.No</th>
                  <th className="px-6 py-4 font-bold">Hub ID</th>
                  <th className="px-6 py-4 font-bold">{t('common.name')}</th>
                  <th className="px-6 py-4 font-bold">{t('hubs_list.location')}</th>
                  <th className="px-6 py-4 font-bold">{t('common.status')}</th>
                  <th className="px-6 py-4 font-bold text-center rounded-tr-lg">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                {currentHubs.map((hub, index) => (
                  <tr key={hub.id} className={`group transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#1d5ba0]/10'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-400">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className={`px-6 py-4 text-xs font-black ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>
                      {hub.hubCustomId || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#1d5ba0]/10 text-[#1d5ba0]'}`}>
                          <Warehouse size={16} />
                        </div>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{hub.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate max-w-[200px]">{hub.address || hub.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        hub.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : hub.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {hub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {hub.status !== 'Active' && (
                          <button 
                            onClick={() => handleStatusChange(hub.id, 'Active')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20`}
                          >
                            Set Active
                          </button>
                        )}
                        {hub.status !== 'Inactive' && (
                          <button 
                            onClick={() => handleStatusChange(hub.id, 'Inactive')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20`}
                          >
                            Set Inactive
                          </button>
                        )}
                        <button 
                          onClick={() => navigate(`/hub/${hub.id}`)}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                            isDark 
                              ? 'bg-brand/20 text-brand hover:bg-brand hover:text-white' 
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white'
                          }`}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => handleEdit(hub)}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(hub.id)}
                          className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredHubs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic text-sm">{t('hubs_list.no_hubs')}</td>
                  </tr>
                )}
              </tbody>
            </table>
              </div>
            ) : (
              <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                {currentHubs.length > 0 ? currentHubs.map(hub => (
                  <div key={hub.id} className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand/10 text-[#1d5ba0]'}`}>
                          <Warehouse size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{hub.name}</h3>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded bg-brand/10 text-brand`}>
                              {hub.hubCustomId || 'N/A'}
                            </span>
                          </div>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            hub.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : hub.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {hub.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{hub.address || hub.location}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-2 border-slate-100 dark:border-slate-700/50">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate(`/hub/${hub.id}`)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                            isDark ? 'bg-slate-800 text-white hover:bg-brand' : 'bg-slate-100 text-slate-700 hover:bg-[#1d5ba0] hover:text-white'
                          }`}
                        >
                          <Eye size={16} /> Details
                        </button>
                        <button 
                          onClick={() => navigate(`/stores?hubId=${hub.id}`)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-colors ${
                            isDark ? 'bg-slate-800 text-white hover:bg-orange-500' : 'bg-orange-50/50 text-orange-600 hover:bg-orange-500 hover:text-white'
                          }`}
                        >
                          <Store size={16} /> Stores
                        </button>
                      </div>
                      <div className="flex gap-2">
                        {hub.status !== 'Active' && (
                          <button 
                            onClick={() => handleStatusChange(hub.id, 'Active')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors flex justify-center items-center"
                          >
                            Set Active
                          </button>
                        )}
                        {hub.status !== 'Inactive' && (
                          <button 
                            onClick={() => handleStatusChange(hub.id, 'Inactive')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex justify-center items-center"
                          >
                            Set Inactive
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(hub)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors flex justify-center items-center gap-1"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(hub.id)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors flex justify-center items-center gap-1"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center text-gray-400 italic text-sm">
                    No hubs found matching your search.
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
      {editingHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-[#2c3136] text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Edit Hub</h3>
              <button onClick={() => setEditingHub(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Hub Name</label>
                <input 
                  type="text" 
                  value={editingHub.name} 
                  onChange={e => setEditingHub({...editingHub, name: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Manager / Owner Name</label>
                  <input 
                    type="text" 
                    value={editingHub.managerName || editingHub.ownerName || ''} 
                    onChange={e => setEditingHub({...editingHub, managerName: e.target.value, ownerName: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-2 border-slate-300">
                      <span className="text-sm font-bold text-slate-500">+254</span>
                    </div>
                    <input 
                      type="tel" 
                      value={editingHub.mobile || ''} 
                      onChange={e => {
                        if (e.target.value.length > 9) alert("Kenya mobile number must be exactly 9 digits.");
                        setEditingHub({...editingHub, mobile: e.target.value});
                      }}
                      className={`w-full pl-16 pr-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                      placeholder="+254 7XX XXXXXX"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editingHub.email || ''} 
                  onChange={e => setEditingHub({...editingHub, email: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Hub Address</label>
                <input 
                  type="text" 
                  value={editingHub.location || editingHub.address || ''} 
                  onChange={e => setEditingHub({...editingHub, location: e.target.value, address: e.target.value})}
                  className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                />
              </div>
              {/*
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Latitude</label>
                  <input 
                    type="text" 
                    value={editingHub.latitude || ''} 
                    onChange={e => setEditingHub({...editingHub, latitude: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Longitude</label>
                  <input 
                    type="text" 
                    value={editingHub.longitude || ''} 
                    onChange={e => setEditingHub({...editingHub, longitude: e.target.value})}
                    className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-brand/50' : 'bg-slate-50 border-slate-200 focus:ring-brand/50'}`}
                  />
                </div>
              </div>
              */}
            </div>
            
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
                onClick={() => setEditingHub(null)}
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
          setEditingHub(prev => ({ 
            ...prev, 
            latitude: lat, 
            longitude: lng,
            ...(fetchedAddress ? { address: fetchedAddress, location: fetchedAddress } : {})
          }));
        }} 
        initialPosition={editingHub?.latitude && editingHub?.longitude ? { lat: parseFloat(editingHub.latitude), lng: parseFloat(editingHub.longitude) } : null}
      />
    </div>
  );
};

export default HubList;
