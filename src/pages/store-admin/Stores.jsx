import React from 'react';
import { Store, MapPin, Star, ArrowRight, Search, Phone, User, Activity } from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import useFetch from '@/hooks/store-admin/useFetch';
import DataState from '@/components/store-admin/DataState';
import { API } from '@/config/store-admin/api';

const Stores = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const { data: storesData, loading, error } = useFetch(API.STORES, '/data/stores.json');
  const allStores = Array.isArray(storesData) ? storesData : [];
  
  const filtered = allStores.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Stores', value: allStores.reduce((acc, s) => acc + s.storesCount, 0), icon: <Store size={18} className="text-brand" /> },
    { label: 'Active Locations', value: allStores.filter(s => s.status === 'Active').length, icon: <Activity size={18} className="text-emerald-500" /> },
    { label: 'Avg. Rating', value: allStores.length > 0 ? (allStores.reduce((a, s) => a + s.rating, 0) / allStores.length).toFixed(1) : '0.0', icon: <Star size={18} className="text-amber-500" /> },
  ];

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stores Module</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Monitor and manage retail locations and performance</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" 
              placeholder="Search by name, category or location..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark 
                  ? 'bg-[#2c3136] border-slate-600 text-slate-200 focus:border-brand focus:ring-4 focus:ring-brand/10' 
                  : 'bg-white border-slate-200 text-slate-800 focus:border-brand focus:ring-4 focus:ring-brand/5 shadow-sm'
              }`}
            />
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

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(store => (
            <div key={store.id} className={`group rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] ${
              isDark ? 'bg-[#2c3136] border-slate-700/50' : 'bg-white border-slate-200'
            }`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl ${store.color} flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10`}>
                      {store.initials}
                    </div>
                    <div>
                      <h5 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.name}</h5>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        store.status === 'Active' 
                          ? 'bg-emerald-500/10 text-emerald-500' 
                          : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-600">{store.rating}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <MapPin size={14} className="text-slate-400" />
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <User size={14} className="text-slate-400" />
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.manager}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                      <Phone size={14} className="text-slate-400" />
                    </div>
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{store.contact}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-700/50">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Outlets</p>
                    <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.storesCount}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Revenue</p>
                    <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.revenue}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => navigate(`/stores/${store.id}/analytics`)}
                className="w-full group/btn flex items-center justify-center gap-2 py-4 bg-brand hover:bg-brand-hover text-white text-xs font-black transition-all"
              >
                Store Analytics
                <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
        
        {filtered.length === 0 && (
          <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">No stores found matching your search.</p>
          </div>
        )}
      </div>
    </DataState>
  );
};

export default Stores;
