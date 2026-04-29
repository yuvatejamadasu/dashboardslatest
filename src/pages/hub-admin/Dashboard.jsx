import React, { useState, useEffect } from 'react';
import {
  Banknote, Truck, Package, RefreshCw, Loader2, ShoppingBag, LayoutGrid
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import StatCard from '@/components/hub-admin/StatCard';
import LatestOrders from '@/components/hub-admin/LatestOrders';
import { fetchSalesData, fetchRevenueData, API_ENDPOINTS } from '@/services/hub-admin/fakeApi';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { Store } from 'lucide-react';

const Dashboard = () => {
  const { isDark } = useTheme();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [storeCount, setStoreCount] = useState(0);
  const [salesData, setSalesData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [salesUrl, setSalesUrl] = useState(API_ENDPOINTS.sales[0].url);
  const [revenueUrl, setRevenueUrl] = useState(API_ENDPOINTS.revenue[0].url);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);

  useEffect(() => {
    setLoadingSales(true);
    fetchSalesData(salesUrl).then(data => { setSalesData(data); setLoadingSales(false); });
  }, [salesUrl]);

  useEffect(() => {
    setLoadingRevenue(true);
    fetchRevenueData(revenueUrl).then(data => { setRevenueData(data); setLoadingRevenue(false); });
  }, [revenueUrl]);

  useEffect(() => {
    const fetchStores = async () => {
      const hubId = userData?.hubId || userData?.entityId;
      if (hubId) {
        try {
          const stores = await hubAdminService.getStoresByHub(hubId);
          setStoreCount(stores.length);
        } catch (err) {
          console.error("Error fetching store count:", err);
        }
      }
    };
    fetchStores();
  }, [userData]);

  return (
    <div className="space-y-8 pb-8 transition-colors duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Hub Admin Dashboard</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium`}>Whole data about your business here</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard icon={<Banknote size={24} className="text-brand" />} label="Revenue" value="KES 13,456.5" subtext="Shipping fees are not included" colorClass="bg-brand/10" className="animate-slide-up animate-stagger-1" />
        <StatCard 
          icon={<Truck size={24} className="text-brand" />} 
          label="Orders" 
          value="53,668" 
          subtext="Excluding orders in transit" 
          colorClass="bg-brand/10" 
          className="animate-slide-up animate-stagger-2"
          onClick={() => navigate('/hub-dashboard/product-requests')}
        />
        <StatCard 
          icon={<Store size={24} className="text-blue-500" />} 
          label="TOTAL STORES" 
          value={storeCount} 
          subtext="Assigned to this hub" 
          colorClass="bg-blue-500/10" 
          className="animate-slide-up animate-stagger-3"
          onClick={() => navigate('/hub-dashboard/stores')}
        />
        <StatCard 
          icon={<LayoutGrid size={24} className="text-orange-500" />} 
          label="Products" 
          value="9,856" 
          subtext="In 19 Categories" 
          colorClass="bg-orange-500/10" 
          className="animate-slide-up animate-stagger-4"
          onClick={() => navigate('/hub-dashboard/products')}
        />
        <StatCard 
          icon={<ShoppingBag size={24} className="text-sky-500" />} 
          label="Monthly Earning" 
          value="KES 6,982" 
          subtext="Based in your local time." 
          colorClass="bg-sky-500/10" 
          className="animate-slide-up animate-stagger-5" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sale Statistics */}
        <div className={`lg:col-span-2 p-6 rounded-xl border animate-fade-in animate-stagger-2 transition-all duration-300 hover:shadow-xl ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Sale statistics</h5>
            <div className="flex items-center gap-2">
              <select value={salesUrl} onChange={e => setSalesUrl(e.target.value)} className={`text-xs p-1.5 rounded-lg border focus:ring-2 focus:ring-blue-500/20 outline-none ${isDark ? 'bg-[#212529] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}>
                {API_ENDPOINTS.sales.map(ep => <option key={ep.url} value={ep.url}>{ep.label}</option>)}
              </select>
              <button onClick={() => setSalesUrl(prev => prev + '?' + Date.now())} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-brand-hover hover:bg-slate-700' : 'text-slate-400 hover:text-brand hover:bg-brand-light'}`}>
                <RefreshCw size={16} className={loadingSales ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          <div className="h-[350px] w-full relative">
            {loadingSales && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-sm"><Loader2 size={28} className="animate-spin text-brand" /></div>}
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} />
                <Legend verticalAlign="top" height={36} iconType="circle" formatter={v => <span className="text-xs font-semibold ml-1 text-slate-500">{v}</span>} />
                <Area type="monotone" dataKey="Sales" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradSales)" dot={{ r: 4, fill: '#6366f1', stroke: isDark ? '#2c3136' : '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Area */}
        <div className={`p-6 rounded-xl border animate-fade-in animate-stagger-3 transition-all duration-300 hover:shadow-xl ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Revenue by Area</h5>
            <button onClick={() => setRevenueUrl(prev => prev + '?' + Date.now())} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <RefreshCw size={14} className={loadingRevenue ? 'animate-spin text-brand' : 'text-slate-400'} />
            </button>
          </div>
          <div className="h-[350px] w-full relative">
            {loadingRevenue && <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/40 dark:bg-black/20 backdrop-blur-sm"><Loader2 size={24} className="animate-spin text-brand" /></div>}
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} barGap={2} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} formatter={v => <span className="text-[11px] font-semibold text-slate-500">{v}</span>} />
                <Bar dataKey="US" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Europe" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Asian" fill="#f97316" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Africa" fill="#c084fc" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Latest Orders */}
      <div className="animate-slide-up animate-stagger-5">
        <LatestOrders isDark={isDark} />
      </div>
    </div>
  );
};

export default Dashboard;

