import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Truck, MapPin, CreditCard, 
  FileText, Printer, Save, CheckCircle
} from 'lucide-react';
import { useTheme } from "@/context/store-admin/ThemeContext";
import { storeOrderService } from "@/services/store-admin/storeOrderService";
import DataState from "@/components/store-admin/DataState";
import api from "@/utils/common/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const formattedId = id?.startsWith('#') ? id : `#${id}`;

  // ── Data fetching ──────────────────────────────────────────────────────
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [employeesData, setEmployeesData] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await storeOrderService.getOrderById(id);
        if (data) {
          setOrder(data);
          setItems(data.items || []);
        } else {
          setError('Order not found');
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  useEffect(() => {
    if (showPartnerModal && employeesData.length === 0) {
      setEmployeesLoading(true);
      api.get('/data/employees.json')
        .then(response => setEmployeesData(response.data || []))
        .catch(err => console.error('API Error fetching partners dynamically:', err))
        .finally(() => setEmployeesLoading(false));
    }
  }, [showPartnerModal, employeesData.length]);

  const handleSave = () => {
    alert("Order details saved successfully!");
  };

  if (loading) return <DataState loading={true} />;
  if (error || !order) return <DataState error={error || 'Order not found'} />;

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const shipping = 10.00;
  const grandTotal = subtotal + shipping;

  // Status mapping to match image
  const displayStatus = order.status === 'Delivered' ? 'Received' : order.status;

  const cardClass = `rounded-xl border shadow-sm transition-all duration-300 ${
    isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
  }`;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      
      {/* ─── Top Bar ────────────────────────────────────────────────────────── */}
      <div className={`p-4 rounded-xl border flex items-center justify-between ${
        isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <button 
          onClick={() => navigate('/store-dashboard/orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
            isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Back to orders
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPartnerModal(true)}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all active:scale-95 bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand-light`}
          >
            Assign delivery partner
          </button>
          <button 
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
            }`}
          >
            Save
          </button>
          <button 
            onClick={() => window.print()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all active:scale-95 ${
              isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
            }`}
          >
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* ─── Order Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 px-1">
        <p className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Ordered on {order.date}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {order.id.replace('#ORD-', '')}
          </h2>
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${
            displayStatus === 'Received' 
              ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
              : (isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')
          }`}>
            {displayStatus}
          </span>
        </div>
      </div>

      {/* ─── Info Head Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer */}
        <div className={cardClass}>
          <div className="p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand-light text-brand'}`}>
              <User size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Customer</p>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.customerName}</h4>
              <p className={`text-xs font-medium mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.customerEmail || 'No email provided'}</p>
              <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone: {order.customerPhone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className={cardClass}>
          <div className="p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand-light text-brand'}`}>
              <Truck size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Order Info</p>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Shipping: Fast delivery</h4>
              <p className={`text-xs font-medium mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pay method: Card</p>
              <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status: {displayStatus}</p>
            </div>
          </div>
        </div>

        {/* Deliver To */}
        <div className={cardClass}>
          <div className="p-5 flex items-start gap-4">
            <div className={`p-2.5 rounded-lg ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand-light text-brand'}`}>
              <MapPin size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-extrabold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Deliver To</p>
              <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{order.city || 'N/A'}</h4>
              <p className={`text-xs font-medium mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {order.shippingAddress || 'No address provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Product Table */}
        <div className={`xl:col-span-8 rounded-xl border overflow-hidden ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">Unit Price</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-center">Quantity</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-12">Total</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.name}</td>
                    <td className={`px-6 py-4 text-xs font-bold text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>KES {item.unitPrice.toFixed(2)}</td>
                    <td className={`px-6 py-4 text-xs font-bold text-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.qty}</td>
                    <td className={`px-6 py-4 text-xs font-black text-right pr-12 ${isDark ? 'text-white' : 'text-slate-800'}`}>KES {item.total.toFixed(2)}</td>
                  </tr>
                ))}
                
                {/* Summary Rows */}
                <tr className="border-t border-slate-100 dark:border-slate-700">
                  <td colSpan="3" className={`px-6 py-3 text-xs font-bold text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Subtotal</td>
                  <td className={`px-6 py-3 text-xs font-black text-right pr-12 ${isDark ? 'text-white' : 'text-slate-800'}`}>KES {subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className={`px-6 py-3 text-xs font-bold text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Shipping</td>
                  <td className={`px-6 py-3 text-xs font-black text-right pr-12 ${isDark ? 'text-white' : 'text-slate-800'}`}>KES {shipping.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className={`px-6 py-3 text-sm font-bold text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Grand total</td>
                  <td className={`px-6 py-3 text-sm font-black text-right pr-12 ${isDark ? 'text-white' : 'text-slate-800'}`}>KES {grandTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan="3" className={`px-6 py-4 text-xs font-bold text-right ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Payment status</td>
                  <td className="px-6 py-4 text-right pr-12">
                    <span className="text-xs font-bold text-emerald-600">Paid</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="xl:col-span-4 space-y-6">
          {/* Payment Info */}
          <div className={cardClass}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <h5 className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Payment Info</h5>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <CreditCard size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Master Card **** **** 4768</p>
                  <p className={`text-[10px] font-bold mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Business name: Grand Market LLC</p>
                </div>
              </div>
              <p className={`text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Phone: +1 800 555-0154-52</p>
            </div>
          </div>

          {/* Notes */}
          <div className={cardClass}>
            <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <h5 className={`text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Notes</h5>
            </div>
            <div className="p-6">
              <textarea 
                placeholder="Type some note"
                className={`w-full h-24 p-4 rounded-xl text-xs font-bold outline-none transition-all resize-none border ${
                  isDark ? 'bg-slate-800/40 border-slate-700 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-100 text-slate-800 focus:border-brand'
                }`}
              />
              <button 
                className="w-full py-2.5 mt-4 rounded-lg bg-brand hover:bg-brand-hover text-white text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-md shadow-brand-light"
              >
                Save note
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ─── Assign Partner Modal ───────────────────────────────────────────── */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className={`w-full max-w-3xl p-6 rounded-2xl shadow-2xl relative ${isDark ? 'bg-[#2c3136] border border-slate-700' : 'bg-white border border-slate-200'}`}>
            <button 
              onClick={() => setShowPartnerModal(false)}
              className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
            >
              ✕
            </button>
            <h3 className={`text-xl font-black mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              <Truck className="text-brand" size={24} /> Assign Delivery Partner
            </h3>
            
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(employeesData || []).filter(e => e.department === 'Operations' || e.designation.includes('Logistics') || e.department === 'Customer Support' || e.department === 'Sales').slice(0, 10).map(emp => (
                  <div key={emp.id} className={`p-4 rounded-xl border flex items-center justify-between transition-all hover:scale-[1.02] cursor-pointer ${isDark ? 'border-slate-700 bg-[#212529] hover:border-brand/50' : 'border-slate-200 bg-slate-50 hover:bg-white hover:shadow-lg hover:border-brand/30'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-lg shadow-inner">
                        {emp.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{emp.fullName}</p>
                        <p className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{emp.phone}</p>
                        <p className={`text-[9px] font-extrabold uppercase mt-1 tracking-wider text-brand`}>{emp.designation}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        alert(`Assigned ${emp.fullName} to order ${order.id}`);
                        setShowPartnerModal(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-brand text-white hover:bg-brand-hover shadow-md shadow-brand-light transition-all active:scale-95"
                    >
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {(employeesLoading || (employeesData || []).length === 0) && (
              <div className="py-12 text-center text-sm font-bold text-slate-400">
                {employeesLoading ? 'Loading delivery partners dynamically...' : 'No partners found.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
