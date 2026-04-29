import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { Check, X, Package, Clock, Store, Eye, Search, Filter, ArrowRight, Save, Edit2 } from 'lucide-react';
import { db } from '@/config/firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { useAuth } from '@/context/AuthContext';

const ProductRequests = () => {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const { userData } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hubInventory, setHubInventory] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const hubId = userData?.hubId || userData?.entityId;
    if (!hubId) return;

    // 1. Fetch Hub Inventory
    const productsRef = ref(db, 'products');
    const invUnsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const inv = {};
        Object.keys(data).forEach(key => {
          if (data[key].hubId === hubId) {
            inv[key] = data[key].quantity || data[key].stock || 0;
          }
        });
        setHubInventory(inv);
      }
    });

    // 2. Listen for Inventory Requests (Orders)
    const requestsRef = ref(db, `inventory_requests/${hubId}`);
    const unsubscribe = onValue(requestsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(list);
      } else {
        setOrders([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      invUnsubscribe();
    };
  }, [userData]);

  const handleStatusUpdate = async (order, newStatus) => {
    const hubId = userData?.hubId || userData?.entityId;
    try {
      if (newStatus === 'Approved') {
        // Only deduct if not already processed
        if (order.status !== 'Approved' && order.status !== 'Delivered') {
          const promises = [];
          for (const item of (order.items || [])) {
            if (item.productId) {
              const productRef = ref(db, `products/${item.productId}`);
              const prodSnap = await get(productRef);
              if (prodSnap.exists()) {
                const currentStock = parseInt(prodSnap.val().quantity || prodSnap.val().stock || 0);
                const newStock = Math.max(0, currentStock - (parseInt(item.quantity) || 0));
                promises.push(update(productRef, { 
                  quantity: newStock,
                  stock: newStock 
                }));
              }
            }
          }
          await Promise.all(promises);
        }
      }

      await update(ref(db, `inventory_requests/${hubId}/${order.firebaseKey}`), { status: newStatus });
      if (selectedOrder?.firebaseKey === order.firebaseKey) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert(`Failed to update status: ` + err.message);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedOrder) return;
    const hubId = userData?.hubId || userData?.entityId;
    try {
      const newTotal = editItems.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0)), 0);
      await update(ref(db, `inventory_requests/${hubId}/${selectedOrder.firebaseKey}`), { 
        items: editItems,
        total: newTotal
      });
      setSelectedOrder(prev => ({ ...prev, items: editItems, total: newTotal }));
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchLower = searchTerm.toLowerCase();
    
    // Check Store Name and ID
    const storeMatch = (order.storeName || '').toLowerCase().includes(searchLower) || 
                       (order.storeId || '').toLowerCase().includes(searchLower);
    
    // Check Product Names inside items
    const productMatch = (order.items || []).some(item => 
      (item.name || '').toLowerCase().includes(searchLower)
    );

    const matchesSearch = searchTerm === '' || storeMatch || productMatch;
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved': return <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase border border-emerald-500/20 tracking-wider">Approved</span>;
      case 'Rejected': return <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-lg text-[10px] font-black uppercase border border-rose-500/20 tracking-wider">Rejected</span>;
      case 'Delivered': return <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase border border-blue-500/20 tracking-wider">Delivered</span>;
      default: return <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase border border-amber-500/20 tracking-wider">Pending</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading requests…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 pb-8 animate-fade-in ${isDark ? 'text-white' : 'text-slate-800'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Store Requests</h2>
          <p className={`text-xs font-semibold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Manage inventory restock requests from registered stores.
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
          isDark ? 'bg-brand/10 border-brand/20 text-brand-lightdark' : 'bg-brand-light border-brand/10 text-brand'
        }`}>
          <Package size={16} />
          <span className="text-xs font-black uppercase tracking-wider">{orders.filter(o => o.status === 'Pending').length} Active Requests</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by store name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 rounded-2xl border outline-none transition-all ${
              isDark ? 'bg-[#2c3136] border-slate-700 text-white focus:border-brand/50' : 'bg-white border-slate-200 text-slate-800 focus:border-brand/30 shadow-sm'
            }`}
          />
        </div>
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`w-full pl-12 pr-10 py-3 rounded-2xl border outline-none appearance-none transition-all font-bold text-xs ${
              isDark ? 'bg-[#2c3136] border-slate-700 text-slate-300 focus:border-brand/50' : 'bg-white border-slate-200 text-slate-600 focus:border-brand/30 shadow-sm'
            }`}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all hover:shadow-lg ${isDark ? 'border-slate-700 bg-[#2c3136]' : 'border-slate-200 bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`uppercase tracking-wider text-[11px] font-extrabold ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
              <tr>
                <th className="px-6 py-5 text-center w-12">#</th>
                <th className="px-6 py-5">Store Name</th>
                <th className="px-6 py-5">Store ID</th>
                <th className="px-6 py-5 text-center">Items</th>
                <th className="px-6 py-5 text-center">Availability</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
              {filteredOrders.map((order, index) => {
                // Calculate stock coverage
                const totalItems = order.items?.length || 0;
                const shortageItems = (order.items || []).filter(item => {
                  const stock = hubInventory[item.productId] || 0;
                  return stock < (item.quantity || 0);
                }).length;

                return (
                  <tr key={order.firebaseKey} className={`transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4 text-center text-[10px] font-black text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-black flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        <Store size={14} className="text-brand" /> {order.storeName || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                        {order.storeId || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-black ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {totalItems}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {shortageItems === 0 ? (
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Fully Available</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-1 rounded">Shortage in {shortageItems}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.date}</span>
                    </td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className={`p-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 px-3 ${
                          isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Eye size={14} />
                        <span className="text-[10px] font-black uppercase">View Details</span>
                      </button>
                      
                      {order.status === 'Pending' && (
                        <>
                          <button 
                            onClick={() => handleStatusUpdate(order, 'Approved')} 
                            className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20 shadow-sm"
                            title="Approve Order"
                          >
                            <Check size={16} />
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate(order, 'Rejected')} 
                            className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-sm"
                            title="Reject Order"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl animate-scale-up ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-700 bg-[#212529]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Request Details</h3>
                  <p className="text-[10px] font-black text-brand uppercase tracking-widest">{selectedOrder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {selectedOrder.status === 'Pending' && !isEditing && (
                  <button 
                    onClick={() => { setIsEditing(true); setEditItems([...selectedOrder.items]); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-wider hover:bg-brand-hover transition-all"
                  >
                    <Edit2 size={14} /> Edit Quantities
                  </button>
                )}
                <button 
                  onClick={() => { setSelectedOrder(null); setIsEditing(false); }}
                  className={`p-2.5 rounded-xl transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Store Name</p>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedOrder.storeName}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Order Date</p>
                  <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedOrder.date}</p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Current Status</p>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
              </div>

              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-4">Product</th>
                    <th className="pb-4 text-center">Hub Stock</th>
                    <th className="pb-4 text-center">Requested</th>
                    <th className="pb-4 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                  {(isEditing ? editItems : selectedOrder.items).map((item, idx) => {
                    const stock = hubInventory[item.productId] || 0;
                    return (
                      <tr key={idx}>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
                            <span className="text-[10px] text-slate-500 font-bold">{item.weight || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          <span className={`text-xs font-bold ${stock < (isEditing ? editItems[idx].quantity : item.quantity) ? 'text-rose-500' : 'text-slate-400'}`}>
                            {stock} units
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editItems[idx].quantity}
                              onChange={(e) => {
                                const newItems = [...editItems];
                                newItems[idx].quantity = parseInt(e.target.value) || 0;
                                setEditItems(newItems);
                              }}
                              className="w-16 px-2 py-1 border rounded text-xs font-bold dark:bg-slate-800 dark:border-slate-600 text-center"
                            />
                          ) : (
                            <span className={`text-xs font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.quantity} units</span>
                          )}
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-xs font-black text-brand">KES {item.price}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={`p-6 border-t flex items-center justify-between ${isDark ? 'border-slate-700 bg-[#212529]' : 'border-slate-100 bg-slate-50/50'}`}>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Order Total</p>
                <p className="text-xl font-black text-brand">KES {(isEditing ? editItems : selectedOrder.items).reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveEdits}
                      className="px-8 py-2.5 rounded-xl bg-brand text-white text-[10px] font-black uppercase tracking-wider hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center gap-2"
                    >
                      <Save size={14} /> Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    {selectedOrder.status === 'Pending' && (
                      <>
                        <button 
                          onClick={() => { handleStatusUpdate(selectedOrder, 'Rejected'); setSelectedOrder(null); }}
                          className="px-6 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-wider hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                        >
                          Reject Request
                        </button>
                        <button 
                          onClick={() => { handleStatusUpdate(selectedOrder, 'Approved'); setSelectedOrder(null); }}
                          className="px-8 py-2.5 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                          <Check size={14} /> Approve Request
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductRequests;
