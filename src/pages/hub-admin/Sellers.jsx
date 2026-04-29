import React from 'react';
import { Users, Store, MapPin, Star, ArrowRight, Search, LayoutGrid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import useFetch from "@/hooks/hub-admin/useFetch";
import DataState from '@/components/hub-admin/DataState';
import { API } from "@/config/hub-admin/api";
import { superAdminService } from "@/services/super-admin/superAdminService";
import { useAuth } from '@/context/AuthContext';



const Sellers = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState(localStorage.getItem('hubStoresViewMode') || 'grid');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('hubStoresViewMode', mode);
  };

  const { data: sellersData, loading, error } = useFetch(API.SELLERS, '/data/sellers.json');
  const [localStores, setLocalStores] = React.useState([]);

  React.useEffect(() => {
    const fetchStores = async () => {
      const currentHubId = userData?.hubId || userData?.entityId;
      if (!currentHubId) return;

      try {
        const stores = await superAdminService.getStores();
        // Filter stores assigned to this hub
        const hubStores = stores.filter(s => String(s.hubId) === String(currentHubId) || String(s.hub_id) === String(currentHubId));
        
        const mappedStores = hubStores.map((s, i) => ({
          ...s,
          category: s.category || 'Retail',
          location: s.address || s.location || 'Unknown location',
          products: s.products || Math.floor(Math.random() * 500) + 50,
          revenue: s.revenue || `KES ${Math.floor(Math.random() * 100) + 10},000`,
          rating: s.rating || (Math.random() * (5 - 3) + 3).toFixed(1),
          initials: s.initials || s.name.substring(0, 2).toUpperCase(),
          color: s.color || ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500'][i % 5]
        }));
        
        setLocalStores(mappedStores);
      } catch (err) {
        console.error("Failed to load stores", err);
      }
    };
    fetchStores();
  }, [userData]);

  const fetchedSellers = Array.isArray(sellersData) ? sellersData : (sellersData?.sellers ?? sellersData?.Sellers ?? []);
  
  // Combine superAdmin stores and any fetched static sellers
  // In a real app we'd just use superAdmin stores
  const allSellers = [...localStores];
  const filtered = allSellers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Stores</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage all vendors and partner stores</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            onClick={() => navigate('/hub-dashboard/create-admin')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap"
          >
            + New Admin
          </button>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Stores', value: allSellers.length, icon: <Store size={18} className="text-brand" /> },
            { label: 'Total Products', value: allSellers.reduce((a, s) => a + s.products, 0), icon: <Users size={18} className="text-violet-500" /> },
            { label: 'Avg. Rating', value: allSellers.length > 0 ? (allSellers.reduce((a, s) => a + (parseFloat(s.rating) || 0), 0) / allSellers.length).toFixed(1) : '0.0', icon: <Star size={18} className="text-amber-500" /> },
          ].map(s => (
            <div key={s.label} className={`p-5 rounded-xl border text-center ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex justify-center mb-2">{s.icon}</div>
              <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</h4>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table / Grid */}
        <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search stores..." value={search} onChange={e => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'}`}
              />
            </div>
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/60'}>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Store</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Location</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Products</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Revenue</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Rating</th>
                    <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                  {filtered.length > 0 ? filtered.map(seller => (
                    <tr key={seller.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${seller.color || 'bg-brand'} flex items-center justify-center text-white font-black text-xs shadow-md`}>
                            {seller.initials || <Store size={20} />}
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{seller.name}</p>
                            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{seller.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          <MapPin size={14} className="text-slate-400" /> {seller.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{seller.products}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold text-emerald-500`}>{seller.revenue}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-400 fill-amber-400" />
                          <span className="text-sm font-bold text-amber-500">{seller.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/hub-dashboard/sellers/${seller.id}`)}
                          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all active:scale-95 shadow-md"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-16 text-center">
                        <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No stores found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(seller => (
              <div key={seller.id} className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl ${seller.color || 'bg-brand'} flex items-center justify-center text-white font-black text-sm shadow-lg`}>
                    {seller.initials || <Store size={24} />}
                  </div>
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
                  onClick={() => navigate(`/hub-dashboard/sellers/${seller.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-brand-light"
                >
                  View Profile <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </DataState>
  );
};

export default Sellers;
