import React, { useState, useEffect } from 'react';
import { 
  Truck, LayoutGrid, MapPin, Plus, Search, Star, Phone, 
  CheckCircle, Loader2, List, X, Mail, Shield, AlertCircle
} from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import DataState from '@/components/hub-admin/DataState';

const AddPartnerModal = ({ isOpen, onClose, onAdd, isDark }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    zone: '',
    status: 'Active'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd(formData);
      onClose();
      setFormData({ name: '', contact: '', email: '', zone: '', status: 'Active' });
    } catch (error) {
      console.error("Error adding partner:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in border ${
        isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Add New Partner</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                  isDark ? 'bg-[#212529] border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contact Number</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="text" 
                  value={formData.contact}
                  onChange={e => setFormData({...formData, contact: e.target.value})}
                  placeholder="+254 7XX XXXXXX"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                    isDark ? 'bg-[#212529] border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
                  }`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Operational Zone</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  required
                  type="text" 
                  value={formData.zone}
                  onChange={e => setFormData({...formData, zone: e.target.value})}
                  placeholder="Nairobi Central"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                    isDark ? 'bg-[#212529] border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email Address</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="john@example.com"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                  isDark ? 'bg-[#212529] border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
                }`}
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="bg-brand hover:bg-brand-hover text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeliveryPartners = () => {
  const { isDark } = useTheme();
  const { userData } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPartners = async () => {
    if (!userData?.hubId) return;
    setLoading(true);
    try {
      const data = await hubAdminService.getDeliveryPartners(userData.hubId);
      setPartners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [userData?.hubId]);

  const handleAddPartner = async (partnerData) => {
    const newPartner = {
      ...partnerData,
      id: `PART-${Math.floor(Math.random() * 10000)}`,
      avatar: partnerData.name.charAt(0).toUpperCase(),
      delivered: 0,
      pending: 0,
      failed: 0,
      earnings: 'KES 0',
      rating: 5.0,
      status: 'Active'
    };
    await hubAdminService.addDeliveryPartner(userData.hubId, newPartner);
    await fetchPartners();
  };

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kpis = [
    { label: 'Total Partners', value: partners.length, icon: <Users size={20} className="text-brand" />, color: 'bg-brand/10' },
    { label: 'Active Now', value: partners.filter(p => p.status === 'Active').length, icon: <CheckCircle size={20} className="text-emerald-500" />, color: 'bg-emerald-500/10' },
    { label: 'Avg Rating', value: partners.length > 0 ? (partners.reduce((a, b) => a + (parseFloat(b.rating) || 0), 0) / partners.length).toFixed(1) : '0.0', icon: <Star size={20} className="text-amber-500" />, color: 'bg-amber-500/10' },
    { label: 'Compliance', value: '98%', icon: <Shield size={20} className="text-violet-500" />, color: 'bg-violet-500/10' },
  ];

  return (
    <DataState loading={loading} error={error}>
      <div className="p-8 space-y-8 animate-fade-in pb-20">
        <AddPartnerModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddPartner}
          isDark={isDark}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Delivery Partners</h2>
            <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage and monitor logistics personnel across your hub.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-brand/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            New Partner
          </button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map(kpi => (
            <div key={kpi.label} className={`p-6 rounded-2xl border transition-all hover:scale-[1.02] ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.color}`}>{kpi.icon}</div>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.label}</p>
                  <h4 className={`text-xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters and List */}
        <div className={`rounded-2xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800/50">
            <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>All Delivery Partners</h3>
            <div className="flex items-center gap-4">
              <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-brand shadow-sm') : 'text-slate-400'}`}><List size={14} /></button>
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-brand shadow-sm') : 'text-slate-400'}`}><LayoutGrid size={14} /></button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" placeholder="Search partners..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className={`pl-9 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all w-full md:w-64 ${
                    isDark ? 'bg-[#212529] border-slate-700 text-white focus:border-brand shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
                  }`}
                />
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Zone</th>
                    <th className="px-6 py-4 text-center">Stats (D/P/F)</th>
                    <th className="px-6 py-4 text-center">Rating</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                  {filteredPartners.map(p => (
                    <tr key={p.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 group">
                      <td className="px-6 py-4 text-xs font-black text-brand">{p.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center font-black text-brand text-xs">{p.avatar}</div>
                          <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.name}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.contact}</td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-1.5"><MapPin size={12} className="text-brand opacity-60" /> {p.zone}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3 text-xs font-black">
                          <span className="text-emerald-500">{p.delivered}</span>
                          <span className="text-amber-500">{p.pending}</span>
                          <span className="text-rose-500">{p.failed}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-amber-400">
                          <Star size={12} fill="currentColor" />
                          <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{p.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                          p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="px-5 py-1.5 rounded-lg text-[11px] font-black bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand/20 transition-all active:scale-95">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPartners.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-6 py-20 text-center text-sm font-bold text-slate-400">No partners found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPartners.map(p => (
                <div key={p.id} className={`p-5 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${p.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'}`}>{p.status}</span>
                    <span className="text-[10px] font-black text-brand opacity-60">{p.id}</span>
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center font-black text-brand text-sm shadow-inner">{p.avatar}</div>
                    <div>
                      <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name}</h4>
                      <p className={`text-[10px] font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{p.contact}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Rating</p>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={10} fill="currentColor" />
                        <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.rating}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Earnings</p>
                      <p className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{p.earnings}</p>
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-[11px] font-black bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all">View Profile</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DataState>
  );
};

export default DeliveryPartners;
