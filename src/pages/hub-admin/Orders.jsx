import React, { useState } from 'react';
import {
  ShoppingCart, Search, ChevronLeft, ChevronRight,
  Eye, Download, Package, Clock, CheckCircle, XCircle, Truck, LayoutGrid, List
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import Button from '@/components/hub-admin/ui/Button';
import useFetch from "@/hooks/hub-admin/useFetch";
import DataState from '@/components/hub-admin/DataState';
import { API } from "@/config/hub-admin/api";
import { useTranslation } from 'react-i18next';



const statusConfig = {
  Delivered:   { color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle size={13} /> },
  Processing:  { color: 'text-brand bg-brand-light', icon: <Truck size={13} /> },
  Pending:     { color: 'text-amber-600 bg-amber-50', icon: <Clock size={13} /> },
  Cancelled:   { color: 'text-rose-600 bg-rose-50', icon: <XCircle size={13} /> },
};

const ORDERS_PER_PAGE = 8;

const Orders = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState(localStorage.getItem('hubOrdersViewMode') || 'grid');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('hubOrdersViewMode', mode);
  };

  const { data: ordersData, loading, error } = useFetch(API.ORDERS, '/data/orders.json');
  const fetchedOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders ?? ordersData?.Orders ?? []);

  const [allOrders, setAllOrders] = React.useState([]);

  React.useEffect(() => {
    try {
      const localStr = localStorage.getItem('hub_orders');
      let localOrders = localStr ? JSON.parse(localStr) : [];
      if (!Array.isArray(localOrders)) localOrders = [];
      setAllOrders([...localOrders, ...fetchedOrders]);
    } catch (e) {
      setAllOrders(fetchedOrders);
    }
  }, [fetchedOrders]);

  const statuses = ['All', 'Delivered', 'Processing', 'Pending', 'Cancelled'];

  const filtered = allOrders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.storeName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const current = filtered.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  const stats = [
    { label: t('orders.total_orders'), value: allOrders.length, icon: <Package size={20} className="text-brand" />, bg: 'bg-brand-light dark:bg-brand/10' },
    { label: t('orders.delivered'), value: allOrders.filter(o => o.status === 'Delivered').length, icon: <CheckCircle size={20} className="text-emerald-500" />, bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: t('orders.processing'), value: allOrders.filter(o => o.status === 'Processing').length, icon: <Truck size={20} className="text-brand-lightdark" />, bg: 'bg-sky-50 dark:bg-sky-500/10' },
    { label: t('orders.pending'), value: allOrders.filter(o => o.status === 'Pending').length, icon: <Clock size={20} className="text-amber-500" />, bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <DataState loading={loading} error={error}>
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('orders.title')}</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('orders.subtitle')}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`p-5 rounded-xl border transition-all hover:scale-[1.02] hover:shadow-lg ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.label}</p>
                <h4 className={`text-xl font-black mt-0.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>{s.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        {/* Filter bar */}
        <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text" placeholder={t('orders.search_placeholder')} value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-xs font-semibold border outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'}`}
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {statuses.map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-brand text-white shadow-md shadow-brand-light' : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}`}
              >
                {s}
              </button>
            ))}
            <div className={`ml-2 flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title={t('common.list_view')}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title={t('common.grid_view')}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Table / Grid */}
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/60'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center"><input type="checkbox" className="accent-blue-600" /></th>
                  {[t('orders.order_id'), t('orders.customer'), t('orders.date'), t('orders.items'), t('orders.total'), t('common.status'), t('orders.action')].map(h => (
                    <th key={h} className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'} ${h === t('orders.action') ? 'text-right pr-8' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {current.length > 0 ? current.map(order => {
                  const sc = statusConfig[order.status] || { color: 'text-slate-500 bg-slate-100', icon: null };
                  return (
                    <tr key={order.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4 text-center"><input type="checkbox" className="accent-blue-600" /></td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-brand'}`}>{order.id}</td>
                      <td className="px-6 py-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity" 
                          onClick={() => navigate(`/hub-dashboard/orders/${order.id.replace('#', '')}`)}
                        >
                          <div className="w-8 h-8 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-[11px]">{order.avatar}</div>
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} hover:text-brand transition-colors`}>{order.storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-semibold ${isDark ? 'text-white' : 'text-slate-600'}`}>{order.date}</span>
                          <span className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{order.time}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-slate-600'}`}>{order.items} item{order.items > 1 ? 's' : ''}</td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {order.total || 'KES 0.00'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${sc.color}`}>
                          {sc.icon} {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <Button variant="primary" size="sm" onClick={() => navigate(`/hub-dashboard/orders/${order.id.replace('#', '')}`)} className="ml-auto">
                          <Eye size={13} /> {t('orders.details')}
                        </Button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan="9" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart size={40} className="text-slate-300" />
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('orders.no_orders')}</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {current.length > 0 ? current.map(order => {
              const sc = statusConfig[order.status] || { color: 'text-slate-500 bg-slate-100', icon: null };
              return (
                <div key={order.id} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Package size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                      <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-brand'}`}>{order.id}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.color}`}>
                      {sc.icon} {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate(`/hub-dashboard/orders/${order.id.replace('#', '')}`)}>
                    <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-xs">{order.avatar}</div>
                    <div>
                      <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.storeName}</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.date} at {order.time}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('orders.items')}</p>
                      <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.items}</p>
                    </div>
                    <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('orders.total')}</p>
                      <p className={`text-sm font-black text-emerald-500`}>{order.total || 'KES 0.00'}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <Button variant="primary" className="w-full justify-center" onClick={() => navigate(`/hub-dashboard/orders/${order.id.replace('#', '')}`)}>
                      <Eye size={14} className="mr-2" /> View Details
                    </Button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <ShoppingCart size={40} className="text-slate-300" />
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('orders.no_orders')}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-between px-6 py-4 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1} to {Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><ChevronLeft size={16} /></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setCurrentPage(n)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === n ? 'bg-brand text-white shadow-lg shadow-brand-light' : (isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}`}>{n}</button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40 ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
    </DataState>
  );
};

export default Orders;
