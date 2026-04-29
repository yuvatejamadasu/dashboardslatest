import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Banknote, ShoppingBag, Users, TrendingUp,
  ArrowUp, ArrowDown, ArrowLeft, MapPin, Phone, User,
  Star, Store, Activity
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '@/context/store-admin/ThemeContext';
import useFetch from '@/hooks/store-admin/useFetch';
import DataState from '@/components/store-admin/DataState';
import { API } from '@/config/store-admin/api';

const kpiIcons = [
  <Banknote size={22} className="text-brand" />,
  <ShoppingBag size={22} className="text-violet-500" />,
  <Users size={22} className="text-emerald-500" />,
  <TrendingUp size={22} className="text-amber-500" />,
];
const kpiBgs = ['bg-brand/10', 'bg-violet-500/10', 'bg-emerald-500/10', 'bg-amber-500/10'];

const StoreAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: storesData, loading, error } = useFetch(API.STORES, '/data/stores.json');
  const allStores = Array.isArray(storesData) ? storesData : [];
  const store = allStores.find(s => String(s.id) === String(id));

  const cardBase = `rounded-2xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`;

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8 pb-8 animate-fade-in">

        {/* Back button + Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/stores')}
              className={`p-2.5 rounded-xl border transition-all hover:scale-105 ${isDark ? 'bg-[#2c3136] border-slate-700 text-slate-300 hover:text-white hover:border-slate-500' : 'bg-white border-slate-200 text-slate-600 hover:text-brand hover:border-brand/30 shadow-sm'}`}
            >
              <ArrowLeft size={18} />
            </button>
            {store ? (
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl ${store.color} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                  {store.initials}
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.name}</h2>
                  <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Store Analytics Dashboard</p>
                </div>
              </div>
            ) : (
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Store Analytics</h2>
            )}
          </div>

          {store && (
            <span className={`self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
              store.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {store.status}
            </span>
          )}
        </div>

        {!store ? (
          <div className={`text-center py-24 rounded-3xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <Store size={52} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg">Store not found.</p>
            <button onClick={() => navigate('/stores')} className="mt-4 px-6 py-2 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-hover transition-all">
              Back to Stores
            </button>
          </div>
        ) : (
          <>
            {/* Store Info Row */}
            <div className={`${cardBase} p-6`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <MapPin size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Location</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <User size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Manager</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.manager}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Phone size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Contact</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{store.contact}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Star size={16} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rating</p>
                    <p className={`text-sm font-bold text-amber-500`}>{store.rating} / 5.0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {store.analytics.kpi.map((kpi, idx) => (
                <div key={kpi.label} className={`${cardBase} p-6 hover:scale-[1.02] hover:shadow-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpiBgs[idx]}`}>
                      {kpiIcons[idx]}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                      kpi.up ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                    }`}>
                      {kpi.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      {kpi.change}
                    </span>
                  </div>
                  <h4 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{kpi.value}</h4>
                  <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Revenue Area Chart (2/3 width) */}
              <div className={`lg:col-span-2 ${cardBase} p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <h5 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Monthly Revenue Trend</h5>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                    Annual
                  </span>
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={store.analytics.monthly}>
                      <defs>
                        <linearGradient id={`grad-${store.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `KES ${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={v => [`KES ${v.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fill={`url(#grad-${store.id})`} dot={{ r: 3, fill: '#3b82f6' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Pie Chart (1/3 width) */}
              <div className={`${cardBase} p-6`}>
                <h5 className={`text-base font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Sales by Category</h5>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={store.analytics.categories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {store.analytics.categories.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={v => [`${v}%`, 'Share']}
                        contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {store.analytics.categories.map(cat => (
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

            {/* Orders Bar Chart */}
            <div className={`${cardBase} p-6`}>
              <h5 className={`text-base font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Monthly Orders Volume</h5>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={store.analytics.monthly} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#f1f5f9'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDark ? '#212529' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}
                    />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </DataState>
  );
};

export default StoreAnalytics;

