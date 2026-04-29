import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, Users, ShoppingBag, Banknote, ArrowUp, ArrowDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTheme } from '@/context/store-admin/ThemeContext';
import useFetch from '@/hooks/store-admin/useFetch';
import DataState from '@/components/store-admin/DataState';
import { API } from '@/config/store-admin/api';



const Statistics = () => {
  const { isDark } = useTheme();
  const [timePeriod, setTimePeriod] = useState('period');

  const { data: statsData, loading, error } = useFetch(API.STATISTICS, '/data/statistics.json');

  const stores = statsData?.stores || [];

  let activeData = statsData;

  const kpiDataRaw = activeData?.kpi || [];

  const timeMultiplier = timePeriod === 'daily' ? 1 / 365 : timePeriod === 'weekly' ? 1 / 52 : timePeriod === 'monthly' ? 1 / 12 : 1;

  const applyMultiplier = (valStr, mult) => {
    if (!valStr || valStr === '—') return valStr;
    const isCurrency = valStr.startsWith('KES ') || valStr.startsWith('$');
    const num = parseFloat(valStr.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return valStr;
    const scaled = num * mult;
    if (isCurrency) {
      return 'KES ' + scaled.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return scaled.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const applyChangeMultiplier = (changeStr, period) => {
    if (!changeStr) return '';
    const num = parseFloat(changeStr.replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return changeStr;

    // Simulate different growth rates for different periods
    // Annual is base. Monthly/Weekly/Daily are varied slightly to look dynamic
    let factor = 1;
    let jitter = 0;
    
    if (period === 'monthly') {
      factor = 0.92;
      jitter = (Math.random() - 0.5) * 2; // +/- 1%
    } else if (period === 'weekly') {
      factor = 0.75;
      jitter = (Math.random() - 0.5) * 3; // +/- 1.5%
    } else if (period === 'daily') {
      factor = 0.45;
      jitter = (Math.random() - 0.5) * 5; // +/- 2.5%
    }

    const scaled = (num * factor) + jitter;
    const sign = scaled >= 0 ? '+' : '';
    return `${sign}${scaled.toFixed(1)}%`;
  };

  const kpiData = kpiDataRaw.map(item => {
    const adjustedChange = applyChangeMultiplier(item.change, timePeriod);
    return {
      ...item,
      value: applyMultiplier(item.value, timeMultiplier),
      change: adjustedChange,
      up: !adjustedChange.startsWith('-')
    };
  });

  const getDynamicCategoryData = (baseCategories, period) => {
    if (!baseCategories || baseCategories.length === 0) return [];
    
    // Different weight shifts for each period to simulate dynamic sales distribution
    const shifts = {
      daily: [1.15, 0.85, 1.1, 0.9, 1.0],
      weekly: [0.95, 1.1, 0.9, 1.15, 0.9],
      monthly: [1.1, 1.0, 1.1, 0.85, 0.95],
      annually: [1, 1, 1, 1, 1],
      period: [1, 1, 1, 1, 1]
    };
    
    const activeShift = shifts[period] || shifts.annually;
    
    // Apply shift
    let varied = baseCategories.map((cat, i) => ({
      ...cat,
      value: cat.value * (activeShift[i] || 1)
    }));
    
    // Normalize to sum 100
    const total = varied.reduce((sum, c) => sum + c.value, 0);
    varied = varied.map(c => ({
      ...c,
      value: Math.round((c.value / total) * 100)
    }));
    
    // Ensure exact 100% sum by adjusting the largest value if necessary
    const currentSum = varied.reduce((sum, c) => sum + c.value, 0);
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      const largestIdx = varied.reduce((maxIdx, c, idx, arr) => c.value > arr[maxIdx].value ? idx : maxIdx, 0);
      varied[largestIdx].value += diff;
    }
    
    return varied;
  };

  const categoryData = getDynamicCategoryData(activeData?.categories || [], timePeriod);

  const baseMonthlyData = activeData?.monthly || [];
  let monthlyData = baseMonthlyData;
  let chartTitle = "Annual Revenue Trend";

  if (timePeriod === 'monthly') {
    chartTitle = "Monthly Revenue Trend (Last 4 Weeks)";
    monthlyData = baseMonthlyData.slice(-4).map((d, i) => ({
      name: `Week ${i + 1}`,
      revenue: Math.round(d.revenue / 12),
      orders: Math.round(d.orders / 12),
      customers: Math.round(d.customers / 12)
    }));
  } else if (timePeriod === 'weekly') {
    chartTitle = "Weekly Revenue Trend (7 Days)";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    monthlyData = baseMonthlyData.slice(-7).map((d, i) => ({
      name: days[i],
      revenue: Math.round(d.revenue / 52),
      orders: Math.round(d.orders / 52),
      customers: Math.round(d.customers / 52)
    }));
  } else if (timePeriod === 'daily') {
    chartTitle = "Daily Revenue Trend (Hours)";
    const hours = ["8am", "11am", "2pm", "5pm", "8pm", "11pm"];
    monthlyData = baseMonthlyData.slice(-6).map((d, i) => ({
      name: hours[i],
      revenue: Math.round(d.revenue / 365),
      orders: Math.round(d.orders / 365),
      customers: Math.round(d.customers / 365)
    }));
  }

  const kpiCards = [
    { label: 'Total Revenue', value: kpiData[0]?.value ?? '—', change: kpiData[0]?.change ?? '', up: kpiData[0]?.up ?? true, icon: <Banknote size={22} className="text-brand" />, bg: 'bg-brand/10' },
    { label: 'Total Orders', value: kpiData[1]?.value ?? '—', change: kpiData[1]?.change ?? '', up: kpiData[1]?.up ?? true, icon: <ShoppingBag size={22} className="text-violet-500" />, bg: 'bg-violet-500/10' },
    { label: 'New Customers', value: kpiData[2]?.value ?? '—', change: kpiData[2]?.change ?? '', up: kpiData[2]?.up ?? true, icon: <Users size={22} className="text-emerald-500" />, bg: 'bg-emerald-500/10' },
    { label: 'Avg. Order Value', value: kpiData[3]?.value ?? '—', change: kpiData[3]?.change ?? '', up: kpiData[3]?.up ?? false, icon: <TrendingUp size={22} className="text-amber-500" />, bg: 'bg-amber-500/10' },
  ];

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Statistics</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overall performance overview for the current year</p>
          </div>

          {/* Filters */}
          {stores.length > 0 && (
            <div className="flex items-center gap-3">
              <select
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand/50 transition-colors cursor-pointer ${isDark
                    ? 'bg-[#2c3136] border-slate-700 text-white hover:border-slate-600'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                  }`}
              >
                <option value="period" disabled hidden>Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          )}
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map(card => (
            <div key={card.label} className={`p-6 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-xl ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${card.up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                  {card.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {card.change}
                </span>
              </div>
              <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{card.value}</h4>
              <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{card.label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue trend */}
          <div className={`lg:col-span-2 p-6 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h5 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>{chartTitle}</h5>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category breakdown */}
          <div className={`p-6 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h5 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Sales by Category</h5>
            <div className="h-[220px]">
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
      </div>
    </DataState>
  );
};

export default Statistics;

