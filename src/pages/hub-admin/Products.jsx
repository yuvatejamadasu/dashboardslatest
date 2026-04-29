import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Download,
  Upload,
  Calendar,
  ArrowUp,
  ArrowDown,
  X,
  ShoppingBag,
  Trash2,
  LayoutGrid,
  List,
  PlusCircle,
  Edit2,
  Check
} from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import DatePicker from "@/components/common/DatePicker";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Pagination from '@/components/common/Pagination';

import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { useAuth } from '@/context/AuthContext';

// ─── Store names no longer needed as data comes from JSON ────────────────────

// ─── Shared Date Picker used here ──────────────────────────────────────────────

// ─── Product Detail Modal (Transaction-style) ─────────────────────────────────
const ProductDetailModal = ({ product, onClose, isDark }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Card */}
      <div className={`relative rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col border transition-all ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'
      }`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between transition-all ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-brand'}`}>
            <ShoppingBag size={18} /> Product Details
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Product image + name banner */}
        <div className={`px-6 py-5 flex items-center gap-4 border-b transition-all ${
          isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/60 border-slate-100'
        }`}>
          <div className={`w-16 h-16 rounded-xl border shadow-sm flex items-center justify-center p-2 shrink-0 transition-all ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
          }`}>
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
            />
          </div>
          <div>
            <p className={`text-sm font-black leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}>{product.name}</p>
            <p className={`text-xs font-bold mt-1 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>{product.netWeight || "N/A"}</p>
          </div>
        </div>

        {/* Body */}
        <div className={`p-6 space-y-4 transition-all ${isDark ? 'bg-[#2c3136]' : 'bg-slate-50/30'}`}>
          {[
            ['Product ID', `#PRD-${String(product.id).padStart(4, '0')}`],
            ['Net Weight', product.netWeight || "N/A"],
            ['Price', `KES ${product.price.toFixed(2)}`],
            ['Quantity', product.quantity],
            ['Date Listed', product.date],
          ].map(([label, value]) => (
            <div key={label} className={`flex justify-between items-center pb-4 border-b transition-all ${
              isDark ? 'border-slate-700/50' : 'border-slate-200/60'
            }`}>
              <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
              <span className={`text-sm font-bold ${
                label === 'Product ID' 
                  ? (isDark ? 'text-brand-lightdark bg-brand/10 px-3 py-1 rounded-md' : 'text-brand bg-brand-light px-3 py-1 rounded-md')
                  : (isDark ? 'text-slate-200' : 'text-slate-800')
              }`}>
                {value}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center pt-1">
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
            <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase shadow-sm border ${
              product.status === 'Active' 
                ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-emerald-100 text-emerald-600') 
                : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500')
            }`}>
              {product.status}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t transition-all flex justify-end ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-100'
        }`}>
          <button
            onClick={onClose}
            className="bg-brand hover:bg-brand-hover text-white text-[11px] uppercase font-bold tracking-wider px-6 py-2.5 rounded-lg transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Products Page ────────────────────────────────────────────────────────────
const Products = () => {
  console.log('Products component mounting...');
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('hubProductsViewMode') || 'grid');
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStock, setTempStock] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('hubProductsViewMode', mode);
  };

  useEffect(() => {
    const getProducts = async () => {
      const hubId = userData?.hubId || userData?.entityId;
      if (!hubId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        const list = await hubAdminService.getProducts(hubId);
        
        const mappedList = list.map(item => ({
          id: item.id,
          name: item.name || 'Unnamed Product',
          price: item.price || 0,
          category: item.category || 'Uncategorized',
          quantity: item.stock || 0,
          image: item.image || '',
          status: item.status || 'Active',
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
          netWeight: item.weight || "N/A",
          storeName: item.storeName || 'Hub',
          storeId: item.storeId || null
        }));

        setProducts(mappedList);
      } catch (err) {
        setFetchError(err.message || 'Failed to load products from database');
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, [userData]);

  const handleRemoveProduct = async (e, product) => {
    e.stopPropagation();
    const hubId = userData?.hubId || userData?.entityId;
    if (!hubId) return;

    if (window.confirm("Are you sure you want to remove this product?")) {
      try {
        await hubAdminService.deleteProduct(product.id, hubId, product.storeId);
        setProducts(prev => prev.filter(p => p.id !== product.id));
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product.");
      }
    }
  };

  const handleUpdateStock = async (e, productId, currentStoreId) => {
    e.stopPropagation();
    const hubId = userData?.hubId || userData?.entityId;
    if (!hubId) return;

    const newStock = parseInt(tempStock);
    if (isNaN(newStock) || newStock < 0) {
      alert("Please enter a valid stock number.");
      return;
    }

    try {
      await hubAdminService.updateProductStock(productId, newStock, hubId, currentStoreId);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, quantity: newStock } : p));
      setEditingStockId(null);
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock.");
    }
  };

  const [selectedCategory, setSelectedCategory] = useState('All category');
  const [selectedStatus, setSelectedStatus] = useState('Status');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.storeName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All category' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Status' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedStatus]);

  const handleExport = () => {
    if (filteredProducts.length === 0) return;

    // Define CSV headers
    const headers = ["Product Name", "Net Weight", "Quantity", "Price", "Status", "Date"];
    
    // Format rows
    const rows = filteredProducts.map(p => [
      `"${p.name?.replace(/"/g, '""')}"`,
      `"${(p.netWeight || "N/A").replace(/"/g, '""')}"`,
      p.quantity || 0,
      p.price.toFixed(2),
      p.status,
      p.date
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-[var(--primary-color)] rounded-full animate-spin" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading products…</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`flex flex-col items-center gap-3 p-8 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Failed to load products</p>
          <p className="text-xs text-slate-400 text-center max-w-xs">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isDark={isDark}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('nav.products')}</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold mt-1`}>
            {t('common.more_details')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExport}
            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 active:scale-95 ${
            isDark ? 'border-slate-700 text-slate-300 hover:bg-brand hover:text-white hover:border-brand' : 'border-slate-200 text-slate-600 bg-white hover:bg-brand hover:text-white hover:border-brand shadow-sm'
          }`}>
            <Download size={14} /> EXPORT
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className={`rounded-xl border transition-all duration-500 hover:shadow-lg overflow-hidden ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder={t('common.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
              }`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
            <button
              onClick={() => navigate('/hub-dashboard/add-product')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand text-white text-xs font-bold hover:bg-brand-hover transition-all shadow-md shadow-brand/20"
            >
              <PlusCircle size={14} />
              {t('add_product.add_product')}
            </button>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
              isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <option>All category</option>
              {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
            <DatePicker isDark={isDark} />
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
              isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <option>Status</option>
              <option>Active</option>
              <option>Hidden</option>
            </select>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider w-12 text-center">
                    <input type="checkbox" className="rounded-sm accent-brand" />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">{t('nav.products')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">{t('common.weight')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">{t('common.quantity')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">{t('common.price')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">{t('common.status')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">{t('common.date')}</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {currentProducts.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`group/row transition-all duration-200 cursor-pointer ${
                      isDark ? 'hover:bg-slate-800/80' : 'hover:bg-brand-light/40'
                    }`}
                  >
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" className="rounded-sm accent-brand" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl p-1.5 flex items-center justify-center transition-transform group-hover/row:scale-110 border ${
                          isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-sm'
                        }`}>
                          <img
                            src={p.image}
                            alt={p.name}
                            className={`w-full h-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold leading-tight max-w-[200px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {p.name}
                          </span>
                          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Store: {p.storeName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-brand'}`}>
                      {p.netWeight || "N/A"}
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {editingStockId === p.id ? (
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <input 
                            type="number" 
                            value={tempStock}
                            onChange={e => setTempStock(e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-xs dark:bg-slate-800 dark:border-slate-600 font-black"
                            autoFocus
                          />
                          <button onClick={e => handleUpdateStock(e, p.id, p.storeId)} className="p-1 text-emerald-500 hover:bg-emerald-50 rounded shadow-sm border border-emerald-100"><Check size={14} /></button>
                          <button onClick={e => setEditingStockId(null)} className="p-1 text-slate-400 hover:bg-slate-100 rounded shadow-sm border border-slate-100"><X size={14} /></button>
                        </div>
                      ) : (
                        <span className="font-black">{p.quantity || 0}</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      KES {p.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tighter transition-all ${
                        p.status === 'Active' 
                          ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-600') 
                          : (isDark ? 'bg-slate-700/50 text-slate-400 border border-slate-600' : 'bg-slate-100 text-slate-500')
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-[11px] font-bold text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {p.date}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'Active' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingStockId(p.id); setTempStock(p.quantity); }}
                            className="bg-brand/10 text-brand hover:bg-brand hover:text-white text-[10px] uppercase font-black tracking-wider px-3 py-2 rounded-lg transition-all active:scale-95 border border-brand/20"
                          >
                            Update Stock
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); }}
                          className="bg-slate-100 dark:bg-slate-700 hover:bg-brand text-slate-600 dark:text-slate-300 hover:text-white text-[10px] uppercase font-black tracking-wider px-3 py-2 rounded-lg transition-all active:scale-95 border border-slate-200 dark:border-slate-600"
                        >
                          Details
                        </button>
                        <button
                          onClick={(e) => handleRemoveProduct(e, p)}
                          className="bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white text-[11px] p-2 rounded-lg transition-all active:scale-95 shadow-sm border border-rose-100"
                          title="Remove Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {currentProducts.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('common.no_data')}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      ) : (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {currentProducts.map((p) => (
              <div 
                key={p.id} 
                onClick={() => setSelectedProduct(p)}
                className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`shrink-0 px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase border ${
                    p.status === 'Active' 
                      ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-600 border-emerald-200') 
                      : (isDark ? 'bg-slate-700/50 text-slate-400 border-slate-600' : 'bg-slate-100 text-slate-500 border-slate-200')
                  }`}>
                    {p.status}
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <button 
                      onClick={e => { e.stopPropagation(); setEditingStockId(p.id); setTempStock(p.quantity); }}
                      className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-brand text-white text-[9px] font-black uppercase tracking-tighter hover:bg-brand-hover shadow-sm transition-all"
                    >
                      Update Stock
                    </button>
                    <button
                      onClick={(e) => handleRemoveProduct(e, p)}
                      className="shrink-0 p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm"
                      title="Remove Product"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className={`h-40 w-full rounded-xl mb-4 p-4 flex items-center justify-center border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50/50 border-slate-100'}`}>
                  <img
                    src={p.image}
                    alt={p.name}
                    className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 ${isDark ? '' : 'mix-blend-multiply'}`}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
                  />
                </div>

                <div className="flex-1">
                  <h3 className={`font-bold text-sm leading-tight line-clamp-2 mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{p.category}</p>
                    <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                      {p.storeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('common.price')}</p>
                    <p className={`text-lg font-black text-brand`}>KES {p.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t('common.stock')}</p>
                    {editingStockId === p.id ? (
                      <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                        <input 
                          type="number" 
                          value={tempStock}
                          onChange={e => setTempStock(e.target.value)}
                          className="w-14 px-1 py-0.5 border rounded text-[10px] font-black dark:bg-slate-800 dark:border-slate-600"
                          autoFocus
                        />
                        <button onClick={e => handleUpdateStock(e, p.id, p.storeId)} className="p-0.5 text-emerald-500 hover:bg-emerald-50 rounded shadow-sm border border-emerald-100"><Check size={12} /></button>
                      </div>
                    ) : (
                      <p className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{p.quantity || 0}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {currentProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-slate-500 text-sm font-medium">
                {t('common.no_data')}
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            isDark={isDark}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default Products;
