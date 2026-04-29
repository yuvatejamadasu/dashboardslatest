import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, CreditCard, Calendar,
  Search, ChevronDown, ChevronUp, ArrowUp, ArrowDown, X
} from 'lucide-react';
import { useTheme } from "@/context/store-admin/ThemeContext";
import DatePicker from "@/components/common/DatePicker";

const SearchableDropdown = ({ items, selected, onSelect, isDark, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative min-w-[160px]" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-4 py-2 text-xs font-bold rounded-lg transition-all ${isDark ? 'bg-transparent text-slate-300 hover:bg-slate-700/30' : 'bg-transparent text-slate-600 hover:bg-slate-100'}`}>
        <span>{selected}</span>
        {isOpen ? <ChevronUp size={14} className="opacity-50" /> : <ChevronDown size={14} className="opacity-50" />}
      </button>
      {isOpen && (
        <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl z-50 overflow-hidden border ${isDark ? 'bg-[#212529] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className="p-3 border-b border-slate-700/10">
            <div className={`relative flex items-center rounded-lg border px-3 py-2 ${isDark ? 'bg-[#2c3136] border-slate-600' : 'bg-slate-50 border-slate-200'}`}>
              <Search size={14} className="text-slate-400 mr-2" />
              <input type="text" placeholder={placeholder || 'Search...'} className="bg-transparent border-none outline-none text-xs w-full font-medium placeholder:text-slate-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <button key={item} onClick={() => { onSelect(item); setIsOpen(false); }} className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-all ${item === selected ? (isDark ? 'bg-brand text-white' : 'bg-brand text-white') : (isDark ? 'text-slate-400 hover:bg-brand hover:text-white' : 'text-slate-600 hover:bg-brand hover:text-white')}`}>
                {item}
              </button>
            )) : <div className="px-4 py-8 text-center text-xs text-slate-500 font-medium">No items found</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Shared DatePicker ───────────────────────────────────────────────────────

const LatestOrders = ({ isDark }) => {
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('Status');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const categories = ['All Categories', "Women's Clothing", "Men's Clothing", 'Cellphones', 'Computer & Office', 'Consumer Electronics', 'Jewelry & Accessories', 'Home & Garden', 'Shoes'];
  const statuses = ['All', 'Paid', 'Chargeback', 'Refund'];
  const orders = [
    { id: '#SK2540', billingName: 'Neal Matthews', date: '07 Oct, 2021', total: 'KES 400', status: 'Paid', method: 'Mastercard' },
    { id: '#SK2541', billingName: 'Jamal Burnett', date: '07 Oct, 2021', total: 'KES 380', status: 'Chargeback', method: 'Visa' },
    { id: '#SK2542', billingName: 'Juan Mitchell', date: '06 Oct, 2021', total: 'KES 384', status: 'Paid', method: 'Paypal' },
    { id: '#SK2543', billingName: 'Barry Dick', date: '05 Oct, 2021', total: 'KES 412', status: 'Paid', method: 'Mastercard' },
    { id: '#SK2544', billingName: 'Ronald Taylor', date: '04 Oct, 2021', total: 'KES 404', status: 'Refund', method: 'Visa' },
    { id: '#SK2545', billingName: 'Jacob Hunter', date: '04 Oct, 2021', total: 'KES 392', status: 'Paid', method: 'Paypal' },
  ];

  return (
    <div className="w-full">
      <div className={`rounded-xl border transition-all duration-300 hover:shadow-2xl overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="p-6 pb-0">
          <h5 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Latest orders</h5>
        </div>
        <div className={`mx-6 mt-4 mb-6 p-2 rounded-xl flex items-center justify-between gap-4 ${isDark ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
          <SearchableDropdown selected={category} items={categories} onSelect={setCategory} isDark={isDark} placeholder="Search category..." />
          <div className="flex items-center gap-3 pr-2">
            <DatePicker isDark={isDark} />
            <SearchableDropdown selected={status} items={statuses} onSelect={setStatus} isDark={isDark} placeholder="Search status..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider w-12 text-center"><input type="checkbox" className="rounded-sm accent-blue-600" /></th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Order ID</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Billing Name</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Date</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Total</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Status</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : ''}`}>Method</th>
                <th className={`px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-center ${isDark ? 'text-slate-400' : ''}`}>Action</th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
              {orders.map(order => (
                <tr key={order.id} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 text-center"><input type="checkbox" className="rounded-sm accent-blue-600" /></td>
                  <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-brand-lightdark' : 'text-brand'} cursor-pointer hover:underline`}>{order.id}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{order.billingName}</td>
                  <td className={`px-6 py-4 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{order.date}</td>
                  <td className={`px-6 py-4 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${order.status === 'Paid' ? 'bg-brand/10 text-brand' : order.status === 'Chargeback' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>{order.status}</span>
                  </td>
                  <td className={`px-6 py-4 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <div className="flex items-center gap-2"><CreditCard size={14} className="opacity-50" />{order.method}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="bg-brand hover:bg-brand text-white text-[11px] font-bold py-1.5 px-4 rounded-lg transition-all active:scale-95"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-slate-500 hover:bg-brand hover:text-white' : 'bg-slate-200 text-slate-400 hover:bg-brand hover:text-white'}`}><ChevronLeft size={16} /></button>
          {[1, 2, 3].map(n => (
            <button key={n} className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${n === 1 ? 'bg-brand text-white shadow-lg shadow-brand-light' : (isDark ? 'bg-slate-800/50 text-slate-500 hover:bg-brand hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-brand hover:text-white')}`}>0{n}</button>
          ))}
          <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-slate-500 hover:bg-brand hover:text-white' : 'bg-slate-200 text-slate-400 hover:bg-brand hover:text-white'}`}><ChevronRight size={16} /></button>
        </div>
        <p className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Showing 6 of 450 items</p>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-brand'}`}>Order Details</h3>
              <button onClick={() => setSelectedOrder(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between group">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Order ID</span>
                <span className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-tight ${isDark ? 'bg-slate-800 text-brand-lightdark' : 'bg-brand/10 text-brand'}`}>{selectedOrder.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Billing Name</span>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand/10 text-brand'}`}>{selectedOrder.billingName[0]}</div>
                  <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedOrder.billingName}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-right">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date</span>
                <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.date}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Payment Method</span>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                  <CreditCard size={14} className="opacity-50" />
                  <span className="text-xs font-black tracking-tight">{selectedOrder.method}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.total}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                <span className={`px-4 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-widest ${selectedOrder.status === 'Paid' ? (isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand/10 text-brand') : (isDark ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600')}`}>
                  {selectedOrder.status}
                </span>
              </div>
            </div>

            <div className={`p-6 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
              <button onClick={() => setSelectedOrder(null)} className="bg-brand hover:bg-brand text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-light transition-all active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LatestOrders;
