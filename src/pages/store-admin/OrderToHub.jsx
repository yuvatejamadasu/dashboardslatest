import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Box,
  ArrowRight,
} from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';
import DatePicker from "@/components/common/DatePicker";

// ─── Shared Date Picker used here ──────────────────────────────────────────────

import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { ref, get, push, set, update } from 'firebase/database';
import { storeAdminService } from '@/services/store-admin/storeAdminService';

// ─── Order To Hub Page ────────────────────────────────────────────────────────
const OrderToHub = () => {
  const { isDark } = useTheme();
  const { userData } = useAuth();
  const [hubName, setHubName] = useState('Loading Hub...');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedCity, setSelectedCity] = useState('Nairobi');
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchHub = async () => {
      if (userData?.hubId) {
        try {
          const hubRef = ref(db, `hubs/${userData.hubId}`);
          const snapshot = await get(hubRef);
          if (snapshot.exists()) {
            setHubName(snapshot.val().name || snapshot.val().hubName);
          } else {
            setHubName('Hub Not Found');
          }
        } catch (error) {
          setHubName('Error loading Hub');
        }
      } else {
        setHubName('No Hub Assigned');
      }
    };
    fetchHub();
  }, [userData?.hubId]);

  const popularData = {
    Nairobi: {
      brands: ['Daawat (Rice)', 'Amul (Dairy)', 'Lays (Snacks)', 'Tropicana (Beverages)'],
      products: ['Milk', 'Rice', 'Chips', 'Bread']
    },
    Mombasa: {
      brands: ['Kohinoor (Rice)', 'Mother Dairy (Dairy)', 'Bingo (Snacks)', 'Maaza (Beverages)'],
      products: ['Coconut Water', 'Seafood', 'Atta', 'Biscuits']
    }
  };

  // ── Weight display logic ────────────────────────────────────────────────
  const getDisplayWeight = (product) => {
    return product.netWeight || product.weight || 'N/A';
  };

  // ── Fetch products from assigned Hub ────────────────────────────────────
  useEffect(() => {
    const fetchProducts = async () => {
      const hubId = userData?.hubId || userData?.entityId && (await storeAdminService.getStoreDetails(userData.entityId))?.hubId;
      
      if (!hubId) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setFetchError(null);

      try {
        const data = await storeAdminService.getHubProducts(hubId);
        
        const mappedList = data.map(item => ({
          id: item.id,
          name: item.name || item.productName || 'Unnamed Product',
          price: item.price || item.sellingPrice || 0,
          category: item.category || 'Uncategorized',
          quantity: item.quantity !== undefined ? item.quantity : (item.stock || item.itemsCount || 0),
          image: item.image || item.imageUrl || '',
          status: item.status || 'Active',
          date: item.date || item.createdAt || new Date().toLocaleDateString(),
          netWeight: item.netWeight || item.weight || "N/A"
        }));

        setProducts(mappedList);
      } catch (err) {
        console.error('Error fetching hub products:', err);
        setFetchError('Failed to load products from hub inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [userData]);

  const handleExport = () => {
    const headers = ['Product ID', 'Name', 'Category', 'Net Weight Options'];
    const csvRows = products.map(p => [
      `PRD-${String(p.id).padStart(4, '0')}`,
      p.name,
      detectCategory(p.name),
      getWeightOptions(p.name).join(' | ')
    ].map(v => `"${v}"`).join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hub_inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ── Add to cart ─────────────────────────────────────────────────────────
  const addToCart = (product) => {
    if ((product.quantity || 0) <= 0) {
      alert('This product is out of stock.');
      return;
    }
    const weight = getDisplayWeight(product);
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.weight === weight);
      if (existing) {
        alert('This item is already in your order summary.');
        return prev;
      }
      return [...prev, { id: product.id, name: product.name, image: product.image, weight, quantity: 1, category: product.category, maxQuantity: product.quantity || 0, price: product.price || 0 }];
    });
  };

  // ── Update quantity in cart ─────────────────────────────────────────────
  const updateCartQuantity = (idx, val) => {
    const num = parseInt(val);
    setCartItems(prev => prev.map((item, i) => {
      if (i === idx) {
        if (!isNaN(num) && num > item.maxQuantity) {
          alert(`Quantity cannot exceed available stock (${item.maxQuantity})`);
          return { ...item, quantity: item.maxQuantity };
        }
        return { ...item, quantity: isNaN(num) ? '' : Math.max(0, num) };
      }
      return item;
    }));
  };

  // ── Remove from cart ────────────────────────────────────────────────────
  const removeFromCart = (idx) => {
    setCartItems(prev => prev.filter((_, i) => i !== idx));
  };

  const [submitting, setSubmitting] = useState(false);

  const handleProceedToOrder = async () => {
    if (cartItems.length === 0 || submitting) return;
    
    // Improved ID detection
    const storeId = userData?.storeId || userData?.entityId || userData?.id;
    const hubId = userData?.hubId || (storeId && (await storeAdminService.getStoreDetails(storeId))?.hubId);
    
    console.log('Submitting order:', { storeId, hubId, cartItems });

    if (!hubId) {
      alert("Error: No hub assigned to this store. Please contact support.");
      return;
    }

    if (!storeId) {
      alert("Error: Store identification failed. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      const orderId = `ORD-${Date.now()}`;
      const requestsRef = ref(db, `inventory_requests/${hubId}`);
      
      const newOrder = {
        id: orderId,
        storeId: storeId,
        storeName: userData.storeName || userData.name || userData.fullName || 'Unknown Store',
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: parseInt(item.quantity) || 0,
          weight: item.weight,
          price: item.price,
          category: item.category,
          image: item.image || ''
        })),
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        total: cartItems.reduce((sum, item) => sum + ((item.price || 0) * (parseInt(item.quantity) || 0)), 0)
      };

      const newRequestRef = push(requestsRef);
      await set(newRequestRef, newOrder);

      alert('Inventory request submitted successfully!');
      setCartItems([]);
    } catch (err) {
      console.error('Error submitting order:', err);
      alert('Failed to submit request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalItemsAdded = cartItems.length;

  // ── Loading state (identical to Products.jsx) ───────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-[var(--primary-color)] rounded-full animate-spin" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading inventory…</p>
        </div>
      </div>
    );
  }

  // ── Error state (identical to Products.jsx) ─────────────────────────────
  if (fetchError) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`flex flex-col items-center gap-3 p-8 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Failed to load inventory</p>
          <p className="text-xs text-slate-400 text-center max-w-xs">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* ─── Page Header (identical structure to Products.jsx) ──────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Order To Hub</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold mt-1`}>
            Browse central inventory and request restocks for your store.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 ${
            isDark ? 'border-slate-700 text-slate-300 bg-[#2c3136]' : 'border-slate-200 text-brand bg-white shadow-sm'
          }`}>
            <ShoppingCart size={14} />
            Items Added: {totalItemsAdded}
          </div>
          <button 
            onClick={() => handleExport()}
            className={`flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border transition-all duration-300 active:scale-95 ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-brand hover:text-white hover:border-brand' : 'border-slate-200 text-slate-600 bg-white hover:bg-brand hover:text-white hover:border-brand shadow-sm'
            }`}
          >
            <Download size={14} /> Export List
          </button>
        </div>
      </div>

      {/* ─── Popular in City Section ────────────────────────────────────── */}
      <div className={`p-5 rounded-xl border transition-all duration-500 shadow-sm ${
        isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-black flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            🔥 Trending in {selectedCity}
          </h3>
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className={`border rounded-lg px-4 py-2 text-xs font-bold outline-none transition-all ${
              isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            <option value="Nairobi">Nairobi</option>
            <option value="Mombasa">Mombasa</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Top Brands (Groceries & Snacks)</p>
            <div className="flex flex-wrap gap-2">
              {popularData[selectedCity].brands.map((brand, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-600 text-brand-lightdark' : 'bg-white border-blue-200 text-blue-700'
                }`}>
                  {brand}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mostly Used Products</p>
            <div className="flex flex-wrap gap-2">
              {popularData[selectedCity].products.map((prod, i) => (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border shadow-sm ${
                  isDark ? 'bg-slate-800 border-slate-600 text-emerald-400' : 'bg-white border-emerald-200 text-emerald-700'
                }`}>
                  {prod}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Filter Bar (identical to Products.jsx) ────────────────────── */}
      <div className={`p-4 rounded-xl border transition-all duration-500 hover:shadow-lg ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Search hub inventory…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'
              }`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="md:col-span-8 flex flex-wrap md:flex-nowrap items-center gap-3 justify-end">
            <div className={`px-4 py-2 rounded-lg border text-xs font-bold transition-all min-w-[140px] flex items-center gap-2 ${
              isDark ? 'bg-brand/20 border-brand/30 text-brand' : 'bg-brand/10 border-brand/20 text-brand'
            }`}>
              <Box size={14} /> Hub: {hubName}
            </div>
            <DatePicker isDark={isDark} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`border rounded-lg px-4 py-2 text-xs font-bold outline-none transition-all min-w-[160px] ${
              isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <option>All Categories</option>
              <option>Grains & Seeds</option>
              <option>Meat & Poultry</option>
              <option>Seafood</option>
              <option>Nuts & Dry Fruits</option>
              <option>Dairy</option>
              <option>Beverages</option>
              <option>Frozen Desserts</option>
              <option>Snacks</option>
              <option>General</option>
            </select>
          </div>
        </div>
      </div>

      {/* ─── Main Content (Table + Order Summary) ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

        {/* ─── Product Table (exact Products.jsx table styling) ─────────── */}
        <div className={`xl:col-span-8 rounded-xl border transition-all duration-500 hover:shadow-lg overflow-hidden ${
          isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider w-12 text-center">
                    <input type="checkbox" className="rounded-sm accent-brand" />
                  </th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Net Wt</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Available</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8">Order</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className={`group/row transition-all duration-200 ${
                      isDark ? 'hover:bg-slate-800/80' : 'hover:bg-brand-light/40'
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
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
                        <span className={`text-xs font-bold leading-tight max-w-[200px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}>
                        {getDisplayWeight(p)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {p.quantity > 0 ? (
                        <div className="flex flex-col">
                          <span className="text-emerald-500">{p.quantity} Units</span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Available in Hub</span>
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      KES {(p.price || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.quantity <= 0}
                        className={`text-[11px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all shadow-sm inline-flex items-center gap-1.5 ${
                          p.quantity > 0 
                            ? 'bg-brand hover:bg-brand-hover text-white active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                        }`}
                      >
                        <Plus size={14} /> Add
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center">
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Order Summary Sidebar (Dashboard card style) ────────────── */}
        <div className="xl:col-span-4 sticky top-4">
          <div className={`rounded-xl border transition-all duration-300 hover:shadow-xl overflow-hidden ${
            isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            {/* Summary Header */}
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${
              isDark ? 'border-slate-700/50' : 'border-slate-100'
            }`}>
              <ShoppingCart size={18} className="text-brand" />
              <h5 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Order Summary</h5>
            </div>

            {/* Cart Items or Empty State */}
            <div className="p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-brand-light'}`}>
                    <Box size={32} className="text-brand opacity-50" />
                  </div>
                  <h6 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>No items added yet</h6>
                  <p className={`text-xs font-medium mt-2 max-w-[200px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Start adding products to create your restock order
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  {cartItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border transition-all ${
                        isDark ? 'bg-slate-800/40 border-slate-700 hover:border-slate-600' : 'bg-slate-50 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {/* Product info row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg p-1 flex items-center justify-center border shrink-0 ${
                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'
                          }`}>
                            <img
                              src={item.image}
                              alt={item.name}
                              className={`w-full h-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`}
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=P'; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold leading-tight truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</p>
                            <p className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.weight}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(idx)}
                          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                            isDark ? 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                          }`}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {/* Quantity row */}
                      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-dashed" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Qty</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] whitespace-nowrap ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Max: {item.maxQuantity}</span>
                          <input
                            type="number"
                            min="0"
                            max={item.maxQuantity}
                            value={item.quantity}
                            onChange={(e) => updateCartQuantity(idx, e.target.value)}
                            className={`w-16 border rounded-lg py-1 text-center text-xs font-bold outline-none transition-all ${
                              isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-white border-slate-200 text-slate-800 focus:border-brand'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Total & Proceed Button */}
            <div className={`px-6 py-4 border-t flex flex-col gap-4 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total</span>
                <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  KES {cartItems.reduce((sum, item) => sum + ((item.price || 0) * (parseInt(item.quantity) || 0)), 0).toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleProceedToOrder}
                disabled={cartItems.length === 0 || submitting}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  cartItems.length > 0 && !submitting
                    ? 'bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand-light active:scale-[0.98]'
                    : (isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Proceed to Order <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderToHub;
