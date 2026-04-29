import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, 
  Bar, Legend 
} from 'recharts';
import { 
  ArrowLeft, TrendingUp, TrendingDown, Banknote, 
  ShoppingBag, Users, Calendar, Filter, Download,
  MoreVertical, Store
} from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import useFetch from '@/hooks/hub-admin/useFetch';
import DataState from '@/components/hub-admin/DataState';
import { API } from '@/config/hub-admin/api';

const TIME_RANGES = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Last 6 Months', value: '6months' },
  { label: 'Yearly', value: 'yearly' },
];

const getDynamicAnalytics = (baseAnalytics, range) => {
  if (!baseAnalytics || !baseAnalytics.monthly) return baseAnalytics;
  
  // Simulated data generation for premium feel
  const multipliers = {
    daily: 0.1,
    weekly: 0.4,
    monthly: 1.0,
    '6months': 1.0,
    yearly: 1.8
  };
  
  const mult = multipliers[range] || 1;
  const labels = {
    daily: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    weekly: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    monthly: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    '6months': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    yearly: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  const currentLabels = labels[range] || labels['6months'];
  
  const newsMonthly = currentLabels.map((name, i) => ({
    name,
    revenue: Math.floor((baseAnalytics.monthly[i % baseAnalytics.monthly.length]?.revenue || 1500) * mult * (0.8 + Math.random() * 0.4)),
    orders: Math.floor((baseAnalytics.monthly[i % baseAnalytics.monthly.length]?.orders || 100) * mult * (0.8 + Math.random() * 0.4))
  }));

  // Update KPI cards based on range
  const newKpi = baseAnalytics.kpi.map(item => ({
    ...item,
    value: item.label.includes('Growth') ? (range === 'yearly' ? '+24.5%' : (range === 'daily' ? '+2.1%' : item.value)) : item.value
  }));

  return { ...baseAnalytics, monthly: newsMonthly, kpi: newKpi };
};

const SellerAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = React.useState('6months');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const { data: sellersData, loading, error } = useFetch(API.SELLERS, '/data/sellers.json');
  const allSellers = Array.isArray(sellersData) ? sellersData : (sellersData?.sellers ?? sellersData?.Sellers ?? []);
  const seller = allSellers.find(s => String(s.id) === String(id));

  const cardClass = `p-6 rounded-2xl border transition-all duration-300 ${
    isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
  }`;

  if (!loading && !seller && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <Store size={64} className="text-slate-300" />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Seller Not Found</h3>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>We couldn't find the analytics data for this seller.</p>
        <button 
          onClick={() => navigate('/hub-dashboard/sellers')}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand text-white font-bold transition-all hover:bg-brand-hover mt-4"
        >
          <ArrowLeft size={18} /> Back to Sellers
        </button>
      </div>
    );
  }

  const baseAnalytics = seller?.analytics || { kpi: [], monthly: [], categories: [] };
  const analytics = React.useMemo(() => getDynamicAnalytics(baseAnalytics, timeRange), [baseAnalytics, timeRange]);

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-10 animate-fade-in px-2">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/hub-dashboard/sellers/${id}`)}
              className={`p-2.5 rounded-xl transition-all active:scale-90 ${
                isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{seller?.name} Analytics</h2>
                <span className="px-2 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider">Internal Preview</span>
              </div>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Performance metrics and sales breakdown for 2024
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                  isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar size={14} /> {TIME_RANGES.find(r => r.value === timeRange)?.label}
              </button>
              
              {showDropdown && (
                <div className={`absolute top-full right-0 mt-2 w-48 rounded-xl shadow-2xl border z-50 overflow-hidden animate-scale-in ${
                  isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  {TIME_RANGES.map(range => (
                    <button
                      key={range.value}
                      onClick={() => { setTimeRange(range.value); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors ${
                        timeRange === range.value 
                          ? 'bg-brand text-white' 
                          : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={() => {
                if (!seller || !analytics) return;
                const lines = [];
                lines.push(`Seller Analytics Report - ${seller.name}`);
                lines.push(`Time Range: ${TIME_RANGES.find(r => r.value === timeRange)?.label}`);
                lines.push(`Generated: ${new Date().toLocaleString()}`);
                lines.push('');
                lines.push('--- KPI Summary ---');
                lines.push('Metric,Value,Change,Trend');
                analytics.kpi.forEach(k => {
                  lines.push(`"${k.label}","${k.value}","${k.change}",${k.up ? 'Up' : 'Down'}`);
                });
                lines.push('');
                lines.push('--- Monthly Performance ---');
                lines.push('Period,Revenue,Orders');
                analytics.monthly.forEach(m => {
                  lines.push(`${m.name},${m.revenue},${m.orders}`);
                });
                if (analytics.categories?.length) {
                  lines.push('');
                  lines.push('--- Sales by Category ---');
                  lines.push('Category,Percentage');
                  analytics.categories.forEach(c => {
                    lines.push(`"${c.name}",${c.value}%`);
                  });
                }
                const csvContent = lines.join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${seller.name.replace(/\s+/g, '_')}_analytics_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-brand-light"
            >
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {analytics.kpi.map((item, idx) => (
            <div key={idx} className={cardClass}>
              <div className="flex items-center justify-between mb-4">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {item.label}
                </p>
                <div className={`p-1.5 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                  <MoreVertical size={14} className="text-slate-400" />
                </div>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.value}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    {item.up ? (
                      <TrendingUp size={14} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={14} className="text-rose-500" />
                    )}
                    <span className={`text-xs font-bold ${item.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.change}
                    </span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>from last month</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Monthly Trend */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Monthly Performance</h4>
              <p className={`text-xs font-bold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Revenue vs Orders throughout the year</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-brand" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 ml-4">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Orders</span>
              </div>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.monthly}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1e293b' : '#fff', 
                    border: 'none', 
                    borderRadius: '12px', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Breakdown & Volume */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <div className={cardClass}>
            <h4 className={`text-lg font-black mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Sales by Category</h4>
            <div className="h-[300px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {analytics.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#fff', 
                      border: 'none', 
                      borderRadius: '12px',
                    }} 
                  />
                  <Legend 
                    verticalAlign="middle" 
                    align="right" 
                    layout="vertical"
                    iconType="circle"
                    formatter={(value, entry, index) => (
                      <span className={`text-xs font-bold ml-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {value} ({analytics.categories[index].value}%)
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Orders Bar Chart */}
          <div className={cardClass}>
            <h4 className={`text-lg font-black mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Monthly Orders Volume</h4>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? '#94a3b8' : '#64748b' }}
                  />
                  <Tooltip 
                    cursor={{fill: isDark ? '#334155' : '#f1f5f9', opacity: 0.4}}
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1e293b' : '#fff', 
                      border: 'none', 
                      borderRadius: '12px',
                    }} 
                  />
                  <Bar 
                    dataKey="orders" 
                    fill="#3b82f6" 
                    radius={[10, 10, 0, 0]} 
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DataState>
  );
};

export default SellerAnalytics;

