import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Package, Calendar, Edit2, Save, ShoppingBag, Clock, Banknote } from 'lucide-react';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import useFetch from "@/hooks/hub-admin/useFetch";
import DataState from "@/components/hub-admin/DataState";
import Button from "@/components/hub-admin/ui/Button";
import { API } from "@/config/hub-admin/api";

const OrderDetails = () => {
  const { id } = useParams(); // e.g. "ORD-7291"
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const formattedId = id?.startsWith('#') ? id : `#${id}`;

  const { data: ordersData, loading, error } = useFetch(API.ORDERS, '/data/orders.json');
  const fetchedOrders = Array.isArray(ordersData) ? ordersData : (ordersData?.orders ?? ordersData?.Orders ?? []);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    try {
      const localStr = localStorage.getItem('hub_orders');
      let localOrders = localStr ? JSON.parse(localStr) : [];
      if (!Array.isArray(localOrders)) localOrders = [];
      setAllOrders([...localOrders, ...fetchedOrders]);
    } catch (e) {
      setAllOrders(fetchedOrders);
    }
  }, [fetchedOrders]);

  const [order, setOrder] = useState(null);
  const [pastOrders, setPastOrders] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', qty: 1, netWt: '' });

  const dummyProducts = ['Organic Apples', 'Fresh Bananas', 'Whole Wheat Bread', 'Almond Milk', 'Greek Yogurt', 'Avocado', 'Brown Eggs'];
  const netWtOptions = ['1 pack', '200 gms', '500 gms', '1 kg', '250 ml', '500 ml'];

  useEffect(() => {
    if (allOrders.length > 0 && formattedId) {
      const foundOrder = allOrders.find(o => o.id === formattedId);
      if (foundOrder) {
        setOrder(foundOrder);
        
        // Find past orders from the same store
        const storePastOrders = allOrders.filter(o => o.storeName === foundOrder.storeName && o.id !== formattedId);
        setPastOrders(storePastOrders);

        // Use cartItems if available, otherwise fallback to dummy items
        let itemsList = [];
        if (foundOrder.cartItems && foundOrder.cartItems.length > 0) {
          itemsList = foundOrder.cartItems.map((item, i) => ({
            id: item.id || `item-${i}`,
            name: item.name,
            qty: item.quantity,
            netWt: item.weight,
            price: item.price || 0
          }));
        } else {
          itemsList = Array.from({ length: foundOrder.items }, (_, i) => ({
            id: `item-${i + 1}`,
            name: dummyProducts[Math.floor(Math.random() * dummyProducts.length)],
            qty: Math.floor(Math.random() * 3) + 1,
            netWt: netWtOptions[Math.floor(Math.random() * netWtOptions.length)],
          }));
        }
        setCurrentItems(itemsList);
      }
    }
  }, [allOrders, formattedId]);

  if (loading) return <DataState loading={true} />;
  if (error || !order) return <DataState error={error || 'Order not found'} />;

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditForm({ name: item.name, qty: item.qty, netWt: item.netWt });
  };

  const saveEdit = (id) => {
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, name: editForm.name, qty: editForm.qty, netWt: editForm.netWt } : item
    );
    setCurrentItems(updatedItems);
    setEditingItemId(null);

    const newTotalStr = `KES ${updatedItems.reduce((sum, item) => sum + (item.price * item.qty), 0).toFixed(2)}`;

    try {
      const localStr = localStorage.getItem('hub_orders');
      if (localStr) {
        let localOrders = JSON.parse(localStr);
        const orderIndex = localOrders.findIndex(o => o.id === formattedId);
        if (orderIndex >= 0) {
          localOrders[orderIndex].cartItems = updatedItems.map(ui => ({
            id: ui.id,
            name: ui.name,
            quantity: ui.qty,
            weight: ui.netWt,
            price: ui.price
          }));
          localOrders[orderIndex].total = newTotalStr;
          localOrders[orderIndex].items = updatedItems.length;
          localStorage.setItem('hub_orders', JSON.stringify(localOrders));

          // Also implicitly update current order state
          setOrder(prev => ({ ...prev, total: newTotalStr, items: updatedItems.length, cartItems: localOrders[orderIndex].cartItems }));

          // Notify Store Admin
          const newNotif = {
            id: Date.now(),
            title: 'Order Updated',
            description: `Order ${formattedId} details were modified by the Hub Admin.`,
            time: 'Just now',
            type: 'Order Updated'
          };
          const notifsStr = localStorage.getItem('store_notifications');
          let notifs = notifsStr ? JSON.parse(notifsStr) : [];
          notifs.unshift(newNotif);
          localStorage.setItem('store_notifications', JSON.stringify(notifs));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrderStatus = (newStatus) => {
    try {
      const localStr = localStorage.getItem('hub_orders');
      if (localStr) {
        let localOrders = JSON.parse(localStr);
        const orderIndex = localOrders.findIndex(o => o.id === formattedId);
        if (orderIndex >= 0) {
          localOrders[orderIndex].status = newStatus;
          localStorage.setItem('hub_orders', JSON.stringify(localOrders));

          // Also update local state
          setOrder({ ...order, status: newStatus });

          // Notify Store Admin
          const newNotif = {
            id: Date.now(),
            title: 'Order Status Updated',
            description: `Order ${formattedId} status was changed to ${newStatus}.`,
            time: 'Just now',
            type: 'Order Updated'
          };
          const notifsStr = localStorage.getItem('store_notifications');
          let notifs = notifsStr ? JSON.parse(notifsStr) : [];
          notifs.unshift(newNotif);
          localStorage.setItem('store_notifications', JSON.stringify(notifs));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header and Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/hub-dashboard/orders')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Order Details</h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Information and items for {order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status:</span>
          <select 
            value={order.status || 'Pending'} 
            onChange={(e) => updateOrderStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg text-sm font-bold border outline-none ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-white border-slate-200 text-slate-800 focus:border-brand shadow-sm'}`}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Store & Order Info Section */}
      <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 p-6 rounded-xl border shadow-sm ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-lg">
            {order.avatar}
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Store Name</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.storeName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center text-sky-600">
            <Store size={22} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Store ID</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>ST-{order.avatar}-091</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600">
            <Calendar size={22} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date & Time</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.date}</p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <Package size={22} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Items</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.items}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600">
            <Banknote size={22} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Total Price</p>
            <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.total || 'KES 0.00'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Current Orders */}
        <div className={`lg:col-span-2 rounded-xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 border-b flex items-center gap-2 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <ShoppingBag size={18} className="text-brand" />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Current Order Items</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/60'}>
                  <th className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Product Name</th>
                  <th className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Net Wt</th>
                  <th className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Quantity</th>
                  <th className={`px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {currentItems.map((item) => (
                  <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4">
                      {editingItemId === item.id ? (
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
                      ) : (
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItemId === item.id ? (
                        <select 
                          value={editForm.netWt} 
                          onChange={(e) => setEditForm({ ...editForm, netWt: e.target.value })}
                          className={`w-full px-3 py-1.5 rounded-lg text-sm border outline-none ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'}`}
                        >
                          {netWtOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-600'}`}>{item.netWt}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingItemId === item.id ? (
                        <input 
                          type="number" 
                          min="0"
                          value={editForm.qty} 
                          onChange={(e) => setEditForm({ ...editForm, qty: parseInt(e.target.value) || 0 })}
                          className={`w-20 px-3 py-1.5 rounded-lg text-sm border outline-none ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'}`}
                        />
                      ) : (
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-600'}`}>{item.qty}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      {editingItemId === item.id ? (
                        <Button variant="primary" size="sm" onClick={() => saveEdit(item.id)} className="ml-auto">
                          Save
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => startEdit(item)} className={`ml-auto ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                          <Edit2 size={14} /> Edit
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {currentItems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-400">No items found for this order.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {editingItemId && (
            <div className={`p-4 border-t flex justify-end ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => saveEdit(editingItemId)}
                className="shadow-lg shadow-brand/20 animate-fade-in"
              >
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Section 2: Past Orders */}
        <div className={`rounded-xl border overflow-hidden shadow-sm flex flex-col ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 border-b flex items-center gap-2 ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <Clock size={18} className="text-amber-500" />
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Past Orders</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {pastOrders.length > 0 ? (
              <div className="p-4 space-y-3">
                {pastOrders.map(po => (
                  <div key={po.id} className={`p-4 rounded-xl border flex justify-between items-center transition-colors cursor-pointer ${isDark ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800/80' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'}`} onClick={() => navigate(`/hub-dashboard/orders/${po.id.replace('#', '')}`)}>
                    <div>
                      <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-brand'}`}>{po.id}</h4>
                      <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>{po.date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-600'}`}>
                        {po.items} Items
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 gap-3 h-full">
                <Store size={36} className="text-slate-300" />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No past orders found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

