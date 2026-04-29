import React from 'react';
import { Users, Store, MapPin, Star, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/store-admin/ThemeContext';
import useFetch from '@/hooks/store-admin/useFetch';
import DataState from '@/components/store-admin/DataState';
import { API } from '@/config/store-admin/api';



const Sellers = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = React.useState('');

  const { data: sellersData, loading, error } = useFetch(API.SELLERS, '/data/sellers.json');
  const allSellers = Array.isArray(sellersData) ? sellersData : (sellersData?.sellers ?? sellersData?.Sellers ?? []);
  const filtered = allSellers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stores</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage all vendors and partner stores</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-xs font-semibold border outline-none ${isDark ? 'bg-[#2c3136] border-slate-600 text-slate-200 focus:border-brand' : 'bg-white border-slate-200 text-slate-800 focus:border-brand'}`}
            />
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Stores', value: allSellers.length, icon: <Store size={18} className="text-brand" /> },
            { label: 'Total Products', value: allSellers.reduce((a, s) => a + s.products, 0), icon: <Users size={18} className="text-violet-500" /> },
            { label: 'Avg. Rating', value: allSellers.length > 0 ? (allSellers.reduce((a, s) => a + s.rating, 0) / allSellers.length).toFixed(1) : '0.0', icon: <Star size={18} className="text-amber-500" /> },
          ].map(s => (
            <div key={s.label} className={`p-5 rounded-xl border text-center ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-center mb-2">{s.icon}</div>
              <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</h4>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sellers grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(seller => (
            <div key={seller.id} className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-start gap-4 mb-5">
                <div className={`w-12 h-12 rounded-xl ${seller.color} flex items-center justify-center text-white font-black text-sm shadow-lg`}>{seller.initials}</div>
                <div className="flex-1 min-w-0">
                  <h5 className={`font-black text-sm truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{seller.name}</h5>
                  <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{seller.category}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-black text-amber-500">{seller.rating}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[{ label: 'Products', value: seller.products }, { label: 'Revenue', value: seller.revenue }].map(info => (
                  <div key={info.label} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{info.label}</p>
                    <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{info.value}</p>
                  </div>
                ))}
              </div>
              <div className={`flex items-center gap-2 text-xs font-semibold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <MapPin size={12} /> {seller.location}
              </div>
              <button
                onClick={() => navigate(`/sellers/${seller.id}`)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-brand-light"
              >
                View Profile <ArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </DataState>
  );
};

export default Sellers;
