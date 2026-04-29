import React, { useState, useEffect } from 'react';
import {
  List, Package, Clock, Truck, CheckCircle, XCircle, Search, Eye, X, PlusCircle, Check
} from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/config/firebase';
import { ref, onValue, off, update as dbUpdate, get } from 'firebase/database';
import { storeAdminService } from '@/services/store-admin/storeAdminService';
import { Loader2 } from 'lucide-react';

const AddToProductsModal = ({ order, onClose, onSave, isDark }) => {
  const [items, setItems] = useState(
    (order.cartItems || []).map(item => ({ ...item, activeQty: item.quantity, hiddenQty: 0 }))
  );

  const handleActiveChange = (idx, val) => {
    const active = Math.min(Math.max(0, parseInt(val) || 0), items[idx].quantity);
    const hidden = items[idx].quantity - active;
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, activeQty: active, hiddenQty: hidden } : it));
  };
  
  const handleHiddenChange = (idx, val) => {
    const hidden = Math.min(Math.max(0, parseInt(val) || 0), items[idx].quantity);
    const active = items[idx].quantity - hidden;
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, activeQty: active, hiddenQty: hidden } : it));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all animate-scale-in flex flex-col ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`}>
        <div className={`sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b ${isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-brand/20 text-brand' : 'bg-brand-light text-brand'}`}>
              <PlusCircle size={20} />
            </div>
            <div>
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Add to Products</h3>
              <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Distribute ordered items to Active & Hidden inventory</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className={`w-12 h-12 rounded-lg p-1.5 flex items-center justify-center border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <img src={item.image} alt={item.name} className={`w-full h-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=P'; }} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</p>
                  <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Total Received: {item.quantity}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div>
                  <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Qty</label>
                  <input type="number" min="0" max={item.quantity} value={item.activeQty} onChange={(e) => handleActiveChange(idx, e.target.value)} className={`w-20 border rounded-lg py-1.5 px-3 text-sm font-bold outline-none transition-all ${isDark ? 'bg-[#1a1d21] border-slate-600 text-emerald-400 focus:border-brand' : 'bg-slate-50 border-slate-200 text-emerald-600 focus:border-brand'}`} />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Hidden Qty</label>
                  <input type="number" min="0" max={item.quantity} value={item.hiddenQty} onChange={(e) => handleHiddenChange(idx, e.target.value)} className={`w-20 border rounded-lg py-1.5 px-3 text-sm font-bold outline-none transition-all opacity-80 ${isDark ? 'bg-[#1a1d21] border-slate-600 text-slate-400 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-500 focus:border-brand'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-100'}`}>
          <button onClick={onClose} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            Cancel
          </button>
          <button onClick={() => onSave(items)} className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm inline-flex items-center gap-2">
            <Check size={16} /> Save to Inventory
          </button>
        </div>
      </div>
    </div>
  );
};

const statusConfig = {
  Delivered:   { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={13} /> },
  Approved:    { color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle size={13} /> },
  Processing:  { color: 'text-brand bg-brand-light border-brand/20', icon: <Truck size={13} /> },
  Pending:     { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <Clock size={13} /> },
  Cancelled:   { color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <XCircle size={13} /> },
};

const OrdersFromHub = () => {
  const { isDark } = useTheme();
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // for details modal
  const [integratingOrder, setIntegratingOrder] = useState(null); // for Add to Products modal

  useEffect(() => {
    const fetchOrders = async () => {
      const storeId = userData?.storeId || userData?.entityId || userData?.id;
      const hubId = userData?.hubId || (storeId && (await storeAdminService.getStoreDetails(storeId))?.hubId);
      
      if (!hubId || !storeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const requestsRef = ref(db, `inventory_requests/${hubId}`);
      
      const unsubscribe = onValue(requestsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list = Object.keys(data)
            .map(key => ({
              firebaseKey: key,
              ...data[key],
              // Ensure fields match what the UI expects
              id: data[key].id || key,
              cartItems: data[key].items || [],
              items: data[key].items?.length || 0,
              total: data[key].total ? `KES ${data[key].total.toFixed(2)}` : 'KES 0.00',
              time: data[key].createdAt ? new Date(data[key].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
            }))
            .filter(order => order.storeId === storeId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          
          setOrders(list);
        } else {
          setOrders([]);
        }
        setLoading(false);
      });

      return () => off(requestsRef);
    };

    const unsubPromise = fetchOrders();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [userData]);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    (o.storeName && o.storeName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaveToInventory = async (items) => {
    let storeId = userData?.storeId || userData?.entityId || userData?.id;
    if (storeId) storeId = String(storeId);
    
    if (!storeId || storeId === 'NaN') {
      alert("Store identification failed. Your account may have been set up incorrectly.");
      return;
    }

    try {
      // Generate new entries in Firebase
      const promises = [];
      items.forEach(item => {
        const baseProduct = {
          name: item.name,
          category: item.category || 'Uncategorized',
          price: parseFloat(item.price || 0),
          netWeight: item.weight || 'N/A',
          image: item.image || '',
          date: new Date().toLocaleDateString(),
          hubId: userData.hubId || ''
        };
        
        if (item.activeQty > 0) {
          promises.push(storeAdminService.addProduct(storeId, {
            ...baseProduct,
            quantity: parseInt(item.activeQty),
            status: 'Active'
          }));
        }
        
        if (item.hiddenQty > 0) {
          promises.push(storeAdminService.addProduct(storeId, {
            ...baseProduct,
            quantity: parseInt(item.hiddenQty),
            status: 'Hidden'
          }));
        }
      });
      
      await Promise.all(promises);
    
      // 4. Mark order as integrated in Firebase
      const hubId = userData?.hubId || (storeId && (await storeAdminService.getStoreDetails(storeId))?.hubId);
      
      if (hubId && integratingOrder.firebaseKey) {
        const orderRef = ref(db, `inventory_requests/${hubId}/${integratingOrder.firebaseKey}`);
        await dbUpdate(orderRef, { integrated: true });
      }
      
      setIntegratingOrder(null);
      alert('Products successfully added to store inventory!');
    } catch (err) {
      console.error('Integration error:', err);
      alert('Failed to add products to inventory: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Orders From Hub</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs font-semibold mt-1`}>
            Track your restock requests placed to the central hub.
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-xl border transition-all duration-500 hover:shadow-lg ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-lg py-2.5 pl-10 pr-4 text-xs font-bold outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand shadow-inner'}`}
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      <div className={`rounded-xl border transition-all duration-500 hover:shadow-lg overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8">Action</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const sc = statusConfig[order.status] || { color: 'text-slate-500 bg-slate-100 border-slate-300', icon: <Package size={13} /> };
                  return (
                    <tr key={order.id} className={`group/row transition-all duration-200 ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-brand-light/40'}`}>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{order.date}</span>
                          <span className={`text-[10px] font-semibold mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{order.time}</span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{order.items} Items</td>
                      <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.total || 'KES 0.00'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${sc.color} ${isDark ? 'bg-opacity-10 border-opacity-20' : ''}`}>
                          {sc.icon} {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase transition-all active:scale-95 border ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-brand'}`}
                          >
                            <Eye size={13} /> Detail
                          </button>
                          {(order.status === 'Delivered' || order.status === 'Approved') && (
                            <button
                              onClick={() => {
                                if (order.integrated) return;
                                setIntegratingOrder(order);
                              }}
                              disabled={order.integrated}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all active:scale-95 ${
                                order.integrated
                                  ? (isDark ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-not-allowed' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed')
                                  : 'bg-brand hover:bg-brand-hover text-white shadow-sm'
                              }`}
                            >
                              {order.integrated ? 'Added' : 'Add to Products'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center">
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No orders found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all animate-slide-up ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`}>
            <div className={`sticky top-0 z-10 px-6 py-4 flex items-center justify-between border-b ${isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-brand/20 text-brand' : 'bg-brand-light text-brand'}`}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Order Details</h3>
                  <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{selectedOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date Placed</p>
                  <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{selectedOrder.date} at {selectedOrder.time}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Current Status</p>
                  <span className={`inline-flex mt-1 items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[selectedOrder.status]?.color || 'text-slate-500 bg-slate-100 border-slate-300'} ${isDark ? 'bg-opacity-10 border-opacity-20' : ''}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Ordered Products ({selectedOrder.cartItems?.length || 0})</h4>
                <div className="space-y-3">
                  {selectedOrder.cartItems && selectedOrder.cartItems.length > 0 ? (
                    selectedOrder.cartItems.map((item, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg p-1.5 flex items-center justify-center border shrink-0 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                            <img src={item.image} alt={item.name} className={`w-full h-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`} onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=P'; }} />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</p>
                            <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Weight: {item.weight}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No items in this order.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-100'}`}>
              <button
                onClick={() => setSelectedOrder(null)}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {integratingOrder && (
        <AddToProductsModal
          order={integratingOrder}
          onClose={() => setIntegratingOrder(null)}
          onSave={handleSaveToInventory}
          isDark={isDark}
        />
      )}
    </div>
  );
};

export default OrdersFromHub;
