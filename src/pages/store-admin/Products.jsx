import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { storeAdminService } from '@/services/store-admin/storeAdminService';
import {
  Search,
  Download,
  Upload,
  Calendar,
  ArrowUp,
  ArrowDown,
  X,
  ShoppingBag,
  LayoutGrid,
  List,
  PlusCircle,
  Loader2
} from 'lucide-react';
import { db } from '@/config/firebase';
import { ref, onValue, off } from 'firebase/database';
import { useTheme } from '@/context/store-admin/ThemeContext';
import { API } from '@/config/store-admin/api';
import DatePicker from "@/components/common/DatePicker";
import { useNavigate } from 'react-router-dom';

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
            <p className={`text-xs font-bold mt-1 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>{product.quantity} in stock</p>
          </div>
        </div>

        {/* Body */}
        <div className={`p-6 space-y-4 transition-all ${isDark ? 'bg-[#2c3136]' : 'bg-slate-50/30'}`}>
          {[
            ['Product ID', `#PRD-${String(product.id).padStart(4, '0')}`],
            ['Net Weight', product.netWeight || '500g'],
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
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All category');
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [products, setProducts] = useState([]);
  const [storeDetails, setStoreDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('storeProductsViewMode') || 'list');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('storeProductsViewMode', mode);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      let storeId = userData?.storeId || userData?.entityId || userData?.id;
      if (storeId) storeId = String(storeId);

      if (!storeId || storeId === 'NaN') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setFetchError(null);

      try {
        // 1. Get Store Details to find Hub ID and Name
        const store = await storeAdminService.getStoreDetails(storeId);
        setStoreDetails(store);

        // 2. Real-time listener for THIS Store's products
        const productsRef = ref(db, `products/${storeId}`);
        const unsubscribe = onValue(productsRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.keys(data).map(key => ({
              ...data[key],
              id: key,
              name: data[key].name || data[key].productName || 'Unnamed Product',
              price: parseFloat(data[key].price || data[key].sellingPrice || 0),
              quantity: parseInt(data[key].quantity || data[key].stock || 0),
              status: data[key].status || 'Active',
              date: data[key].date || data[key].createdAt || new Date().toLocaleDateString()
            }));
            setProducts(list);
          } else {
            setProducts([]);
          }
          setLoading(false);
        }, (err) => {
          console.error('Firebase error:', err);
          setFetchError('Failed to sync inventory');
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error('Error fetching data:', err);
        setFetchError('Failed to load store inventory');
        setLoading(false);
      }
    };

    const unsubPromise = fetchProducts();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [userData]);

  const handleExport = () => {
    const headers = ['Product ID', 'Name', 'Net Weight', 'Price', 'Status', 'Date', 'Quantity'];
    const csvRows = filteredProducts.map(p => [
      `PRD-${String(p.id).padStart(4, '0')}`,
      p.name,
      p.netWeight || '500g',
      parseFloat(p.price || 0).toFixed(2),
      p.status,
      p.date,
      p.quantity
    ].map(v => `"${v}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

   const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All category' || p.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand" />
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
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Products</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold mt-1`}>
            Manage store inventory. Click any row to view full product details.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
            isDark ? 'bg-brand/10 border-brand/20 text-brand-lightdark' : 'bg-brand-light border-brand/10 text-brand'
          }`}>
            <ShoppingBag size={16} />
            <span className="text-xs font-black uppercase tracking-wider">Hub: {storeDetails?.hubName || 'Assigned Hub'}</span>
          </div>
          <button 
            onClick={() => handleExport()}
            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 active:scale-95 ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-brand hover:text-white hover:border-brand' : 'border-slate-200 text-slate-600 bg-white hover:bg-brand hover:text-white hover:border-brand shadow-sm'
            }`}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Table / Grid Section */}
      <div className={`rounded-xl border transition-all duration-500 hover:shadow-lg overflow-hidden ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search hub inventory…"
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
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            {/* Add Product button removed */}
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
              <option value="Active">Active</option>
              <option value="Hidden">Hidden</option>
              <option value="All">All Status</option>
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
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">Net Wt</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">Available</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8">Price</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {filteredProducts.map((p) => (
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
                            className="w-full h-full object-contain mix-blend-multiply"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product'; }}
                          />
                        </div>
                        <span className={`text-xs font-bold leading-tight max-w-[200px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {p.netWeight || p.weight || '500g'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                        (parseInt(p.quantity || p.stock || 0) > 10) 
                          ? (isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50')
                          : (isDark ? 'text-rose-400 bg-rose-500/10' : 'text-rose-600 bg-rose-50')
                      }`}>
                        {p.quantity || p.stock || 0} units
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs font-black text-right pr-8 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      KES {parseFloat(p.price || p.sellingPrice || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-16 text-center">
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`group flex flex-col p-4 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer ${
                  isDark ? 'bg-[#212529] border-slate-700/50 hover:border-brand/50' : 'bg-white border-slate-200 hover:border-brand/30'
                }`}
              >
                <div className="relative mb-4 aspect-square rounded-xl overflow-hidden border flex items-center justify-center p-4 bg-white dark:bg-slate-800 dark:border-slate-700">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Product'; }}
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black tracking-widest uppercase shadow-sm ${
                      p.status === 'Active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-500 text-white'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className={`text-sm font-bold leading-tight mb-2 line-clamp-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    {p.name}
                  </h3>
                  <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Price</p>
                      <p className={`text-sm font-black ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>
                        KES {parseFloat(p.price || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Stock</p>
                      <p className={`text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        {p.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
