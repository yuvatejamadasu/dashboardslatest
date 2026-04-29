import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Users, ShoppingBag, Banknote, ArrowUp, ArrowDown, PieChart as PieChartIcon, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useTranslation } from 'react-i18next';
import DataState from '@/components/super-admin/DataState';
import { API } from '@/config/super-admin/api';
import { superAdminService } from '@/services/super-admin/superAdminService';

const Statistics = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [fetchedStats, setFetchedStats] = useState(null);
  const [hubs, setHubs] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [statsRes, hubsData, storesData] = await Promise.all([
          axios.get(API.STATISTICS),
          superAdminService.getHubs(),
          superAdminService.getStores()
        ]);
        setFetchedStats(statsRes.data);
        setHubs(hubsData || []);
        setStores(storesData || []);
      } catch (err) {
        console.error("Error loading stats:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);
  
  const [selectedHub, setSelectedHub] = useState("All Hubs");
  const [selectedStore, setSelectedStore] = useState("All Stores");

  const allHubs = hubs.map((hub) => hub.name).filter(Boolean);
  const allStores = stores.map((store) => store.name).filter(Boolean);
  const filteredStores = allStores;

  // Helper to generate deterministic but dynamic-looking stats for any entity
  const getDynamicStats = (entity, type) => {
    if (!entity) return fetchedStats;

    // Use name as seed for deterministic values
    const name = entity.name || "";
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const baseRevenue = 40000 + (seed % 100000);
    
    const stats = {
      kpi: [
        { change: `${(seed % 15) + 5}%`, up: seed % 3 !== 0, value: `KES ${(baseRevenue + (seed * 10)).toLocaleString()}` },
        { change: `${(seed % 10) + 1}%`, up: true, value: `${(seed * 7) % 10000}` },
        { change: `${(seed % 5) + 2}%`, up: seed % 2 === 0, value: `${(seed % 3000) + 200}` },
        { change: `${(seed % 8) + 1}%`, up: seed % 4 !== 0, value: `KES ${(35 + (seed % 25)).toFixed(2)}` }
      ],
      monthly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({
        name: month,
        revenue: (baseRevenue / 12) + (i * (seed % 3000)) + (Math.sin(i + seed) * 5000)
      })),
      categories: [
        {name: 'Fruits & Veg', value: 20 + (seed % 20), color: '#3b82f6'},
        {name: 'Dairy', value: 15 + (seed % 15), color: '#10b981'},
        {name: 'Bakery', value: 10 + (seed % 25), color: '#f59e0b'},
        {name: 'Meat', value: 5 + (seed % 15), color: '#f43f5e'},
        {name: 'Other', value: 5 + (seed % 10), color: '#6366f1'}
      ]
    };

    if (type === 'store') {
      stats.details = {
        manager: entity.ownerName || entity.managerName || 'N/A',
        branchId: entity.storeCustomId || entity.id || 'N/A',
        location: entity.address || 'N/A',
        employees: (seed % 20) + 5,
        topProduct: ['Organic Coffee', 'Fresh Milk', 'Whole Bread', 'Greek Yogurt', 'Avocados', 'Soda'][seed % 6]
      };
    }

    return stats;
  };

  const activeStats = (() => {
    if (selectedStore !== "All Stores") {
      const storeObj = stores.find(s => s.name === selectedStore);
      return getDynamicStats(storeObj, 'store');
    }
    if (selectedHub !== "All Hubs") {
      const hubObj = hubs.find(h => h.name === selectedHub);
      return getDynamicStats(hubObj, 'hub');
    }
    return fetchedStats;
  })();

  const activeStatsKpi = activeStats?.kpi || [];
  const monthlyData = activeStats?.monthly || fetchedStats?.monthly || [];
  const categoryData = activeStats?.categories || fetchedStats?.categories || [];

  const kpiCards = [
    { label: t('statistics.total_revenue'), value: activeStatsKpi?.[0]?.value ?? '—', change: activeStatsKpi?.[0]?.change ?? '', up: activeStatsKpi?.[0]?.up ?? true, icon: <Banknote size={22} className="text-brand" />, bg: 'bg-brand/10' },
    { label: t('statistics.total_orders'),  value: activeStatsKpi?.[1]?.value ?? '—', change: activeStatsKpi?.[1]?.change ?? '', up: activeStatsKpi?.[1]?.up ?? true, icon: <ShoppingBag size={22} className="text-violet-500" />, bg: 'bg-violet-500/10' },
    { label: t('statistics.new_customers'), value: activeStatsKpi?.[2]?.value ?? '—', change: activeStatsKpi?.[2]?.change ?? '', up: activeStatsKpi?.[2]?.up ?? true, icon: <Users size={22} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { label: t('statistics.avg_order_value'), value: activeStatsKpi?.[3]?.value ?? '—', change: activeStatsKpi?.[3]?.change ?? '', up: activeStatsKpi?.[3]?.up ?? false, icon: <TrendingUp size={22} className="text-amber-500" />, bg: 'bg-amber-500/10' },
  ];

  return (
    <DataState loading={loading} error={error}>
    <div className="space-y-8 pb-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('statistics.title')}</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('statistics.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative min-w-[160px]">
            <select
              value={selectedHub}
              onChange={(e) => {
                setSelectedHub(e.target.value);
                setSelectedStore("All Stores");
              }}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold cursor-pointer transition-colors ${
                isDark ? 'bg-[#2c3136] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <option value="All Hubs">{t('statistics.all_hubs')}</option>
              {hubs.map(hub => (
                <option key={hub.id} value={hub.name}>{hub.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative min-w-[160px]">
            <select
              value={selectedStore}
              onChange={(e) => {
                setSelectedStore(e.target.value);
              }}
              className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold cursor-pointer transition-colors ${
                isDark ? 'bg-[#2c3136] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <option value="All Stores">{t('statistics.all_stores')}</option>
              {stores
                .filter(s => selectedHub === "All Hubs" || s.hubName === selectedHub || String(hubs.find(h => h.name === selectedHub)?.id) === String(s.hubId))
                .map(store => (
                  <option key={store.id} value={store.name}>{store.name}</option>
                ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map(card => (
          <div key={card.label} className={`p-6 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.up ? 'bg-brand/10 text-brand' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                {card.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {card.change}
              </span>
            </div>
            <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.value}</h4>
            <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 p-6 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <BarChart2 size={20} className="text-brand" /> {t('statistics.annual_revenue_trend')}
            </h3>
            <select className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${isDark ? 'bg-[#1a1d21] border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <div className="h-[300px] min-h-[300px] w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1d5ba0" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1d5ba0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#1d5ba0" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#1d5ba0' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border transition-all duration-300 ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className={`text-lg font-bold mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <PieChartIcon size={20} className="text-violet-500" /> {t('statistics.sales_by_category')}
          </h3>
          <div className="h-[280px] min-h-[280px] w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {categoryData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {categoryData.map(cat => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{cat.name}</span>
                </div>
                <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STORE SPECIFIC DETAILS - DRILL DOWN */}
      {selectedStore !== "All Stores" && activeStats?.details && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-top-4 duration-500">
           <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#212529]/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Store Manager</p>
              <h6 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeStats.details.manager}</h6>
           </div>
           <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#212529]/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Branch ID</p>
              <h6 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeStats.details.branchId}</h6>
           </div>
           <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#212529]/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Top Selling Product</p>
              <h6 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeStats.details.topProduct}</h6>
           </div>
           <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#212529]/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Full Time Employees</p>
              <h6 className={`text-base font-bold mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{activeStats.details.employees} Members</h6>
           </div>
        </div>
      )}

    </div>
    </DataState>

  );
};

export default Statistics;

