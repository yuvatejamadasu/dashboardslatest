import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Banknote, ShoppingBag, Users, TrendingUp,
  ArrowUp, ArrowDown, ArrowLeft, Store, Package, Globe, RefreshCcw
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { useAuth } from '@/context/AuthContext';

const StoreAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { userData } = useAuth();
  
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStores, setTotalStores] = useState(0);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [storeData, allHubStores] = await Promise.all([
        hubAdminService.getStoreById(id),
        hubAdminService.getStoresByHub(userData?.hubId || userData?.entityId)
      ]);
      
      if (!storeData) throw new Error('Store not found');
      
      setStore(storeData);
      setTotalStores(allHubStores.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Store analytics could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCcw size={40} className="animate-spin text-brand mb-4" />
        <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading Analytics...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Store size={64} className="text-slate-300 mb-4 opacity-50" />
        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Store not found.</h3>
        <button onClick={() => navigate('/hub-dashboard/stores')} className="px-6 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-all">
          Back to Stores
        </button>
      </div>
    );
  }

  // Mock data for charts - in real app this would come from store.analytics or service
  const saleStats = [
    { name: 'Jan', sales: 26 }, { name: 'Feb', sales: 7 }, { name: 'Mar', sales: 28 },
    { name: 'Apr', sales: 15 }, { name: 'May', sales: 29 }, { name: 'Jun', sales: 6 },
    { name: 'Jul', sales: 28 }, { name: 'Aug', sales: 22 }, { name: 'Sep', sales: 14 },
    { name: 'Oct', sales: 28 }, { name: 'Nov', sales: 22 }, { name: 'Dec', sales: 24 },
  ];

  const areaData = [
    { name: '900', Africa: 480, Asian: 350, Europe: 620, US: 250 },
    { name: '1200', Africa: 380, Asian: 520, Europe: 480, US: 240 },
    { name: '1400', Africa: 320, Asian: 230, Europe: 290, US: 180 },
    { name: '1600', Africa: 850, Asian: 380, Europe: 450, US: 140 },
  ];

  const cardStyle = `p-5 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`;

  return (
    <div className="space-y-6 pb-8 animate-fade-in px-2">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/hub-dashboard/stores')}
          className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${isDark ? 'bg-[#2c3136] border-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Store Analytics - {store.name}</h2>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Revenue */}
        <div className={cardStyle}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
              <Banknote size={24} className="text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Revenue</p>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>KES {store.revenue || '13,456.5'}</h4>
              <p className="text-[9px] font-medium text-slate-400">Shipping fees are not included</p>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className={cardStyle}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
              <ShoppingBag size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Orders</p>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.ordersCount || '53,668'}</h4>
              <p className="text-[9px] font-medium text-slate-400">Excluding orders in transit</p>
            </div>
          </div>
        </div>

        {/* Total Stores (Hub wide context) */}
        <div className={cardStyle}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
              <Store size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">TOTAL STORES</p>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{totalStores}</h4>
              <p className="text-[9px] font-medium text-slate-400">Assigned to this hub</p>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className={cardStyle}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-orange-50'}`}>
              <Package size={24} className="text-orange-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Products</p>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>9,856</h4>
              <p className="text-[9px] font-medium text-slate-400">In 19 Categories</p>
            </div>
          </div>
        </div>

        {/* Monthly Earning */}
        <div className={cardStyle}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800/50' : 'bg-cyan-50'}`}>
              <Banknote size={24} className="text-cyan-500" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Monthly Earning</p>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>KES 6,982</h4>
              <p className="text-[9px] font-medium text-slate-400">Based in your local time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sale Statistics Chart (2/3 width) */}
        <div className={`lg:col-span-2 ${cardStyle}`}>
          <div className="flex items-center justify-between mb-8">
            <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sale statistics</h5>
            <div className="flex items-center gap-3">
              <select className={`px-3 py-1.5 rounded-lg border text-xs font-bold focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                <option>Default Sales</option>
              </select>
              <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                <RefreshCcw size={16} />
              </button>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={saleStats}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Area Bar Chart (1/3 width) */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between mb-8">
            <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Revenue by Area</h5>
            <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
              <RefreshCcw size={16} />
            </button>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle" 
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'black' }}
                />
                <Bar dataKey="Africa" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={6} />
                <Bar dataKey="Asian" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={6} />
                <Bar dataKey="Europe" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={6} />
                <Bar dataKey="US" fill="#c084fc" radius={[4, 4, 0, 0]} barSize={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreAnalytics;
