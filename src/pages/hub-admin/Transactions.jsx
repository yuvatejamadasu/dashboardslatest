import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Banknote, Smartphone, CreditCard, X } from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';


const getMethodIcon = (method, isDark) => {
  const iconColor = isDark ? "text-slate-400" : "text-slate-500";
  switch (method) {
    case 'PayPal': return <Banknote size={14} className={iconColor} />;
    case 'UPI': return <Smartphone size={14} className={iconColor} />;
    case 'Visa': return <CreditCard size={14} className={iconColor} />;
    default: return null;
  }
};

const getStatusBadge = (status, isDark) => {
  switch (status) {
    case 'Pending':
      return isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-500';
    case 'Failed':
      return isDark ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-100 text-rose-500';
    case 'Paid':
      return isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-500';
    default:
      return isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500';
  }
};

const TransactionModal = ({ data, onClose }) => {
  const { isDark } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Modal Overlay Background */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Modal Card content */}
      <div className={`relative rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in flex flex-col border ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-100'}`}>

        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-700/50 bg-[#2c3136]' : 'border-slate-100 bg-white'}`}>
          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-brand'}`}>Transaction Details</h3>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${isDark ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className={`p-6 space-y-4 ${isDark ? 'bg-[#212529]' : 'bg-slate-50/50'}`}>

          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transaction ID</span>
            <span className={`text-sm font-bold px-3 py-1 rounded-md ${isDark ? 'text-white bg-brand/10' : 'text-brand bg-brand-light'}`}>{data.id}</span>
          </div>

          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Store Name</span>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] ${isDark ? 'bg-brand/20 text-white' : 'bg-brand-light text-brand'}`}>
                {(data?.storeName || data?.customer || 'U').charAt(0).toUpperCase()}
              </div>
              <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{data?.storeName || data?.customer || 'Unknown'}</span>
            </div>
          </div>

          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Date & Time</span>
            <div className="text-right">
              <span className={`block text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.date}</span>
              <span className={`block text-[11px] font-bold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{data.time}</span>
            </div>
          </div>

          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Payment Method</span>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border shadow-sm ${isDark ? 'text-white bg-[#2c3136] border-slate-700' : 'text-slate-700 bg-white border-slate-200'}`}>
              {getMethodIcon(data.method, isDark)}
              <span className="text-sm font-bold tracking-tight">{data.method}</span>
            </div>
          </div>

          <div className={`flex justify-between items-center pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200/60'}`}>
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Amount</span>
            <span className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>
              KES {Number(data?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
            <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-widest uppercase shadow-sm border ${isDark ? 'border-black/20' : 'border-black/5'} ${getStatusBadge(data.status, isDark)}`}>
              {data.status}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'border-slate-700/50 bg-[#2c3136]' : 'border-slate-100 bg-white'}`}>
          <button
            onClick={onClose}
            className={`text-[11px] uppercase font-bold tracking-wider px-6 py-2.5 rounded-lg transition-all active:scale-95 shadow-sm ${isDark ? 'bg-brand hover:bg-brand-hover text-white' : 'bg-brand hover:bg-brand-hover text-white'}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Transactions = () => {
  const { isDark } = useTheme();
  const [selectedMethod, setSelectedMethod] = useState('All Methods');
  const [statusFilter, setStatusFilter] = useState('Status');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data states
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const dropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const FIREBASE_URL = `${import.meta.env.VITE_FIREBASE_DATABASE_URL}/transactions.json`;
        const response = await axios.get(FIREBASE_URL);

        const data = response.data;

        if (!data) {
          setTransactions([]);
        } else {
          const formattedData = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setTransactions(formattedData);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const methods = ['All Methods', 'PayPal', 'UPI', 'Visa'];
  const statuses = ['Status', 'Paid', 'Pending', 'Failed'];

  const filteredTransactions = (transactions || []).filter(transaction => {
    const matchesMethod = selectedMethod === 'All Methods' || transaction?.method === selectedMethod;
    const matchesStatus = statusFilter === 'Status' || transaction?.status === statusFilter;
    const storeName = transaction?.storeName || transaction?.customer || '';
    const matchesSearch = transaction?.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      storeName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMethod && matchesStatus && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMethod, statusFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const indexOfLast = currentPage * transactionsPerPage;
  const indexOfFirst = indexOfLast - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openTransactionDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full pb-8 animate-fade-in">
      {/* 1. Header Section */}
      <div className={`mb-6 pb-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-200'}`}>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-brand'}`}>Transactions</h1>
      </div>

      {/* 3. Transactions Table Card */}
      <div className={`rounded-[12px] border overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>

        {/* 2. Filter Bar (Top Controls) */}
        <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-lg text-sm font-semibold border outline-none transition-all ${isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand placeholder:text-slate-500' : 'bg-[#f8fafc] border-slate-200 text-slate-700 focus:border-brand placeholder:text-slate-400 focus:ring-1 focus:ring-brand'}`}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-sm w-full sm:w-auto justify-between sm:justify-center min-w-[140px] ${isDark ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-brand text-white hover:bg-brand-hover'}`}
              >
                {statusFilter} <ChevronDown size={16} className={`transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStatusDropdownOpen && (
                <div className={`absolute right-0 top-full mt-2 w-full sm:w-40 border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${statusFilter === status
                        ? (isDark ? 'bg-brand/20 text-brand-lightdark' : 'bg-brand-light text-brand')
                        : (isDark ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800')
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 shadow-sm w-full sm:w-auto justify-between sm:justify-center min-w-[140px] ${isDark ? 'bg-brand text-white hover:bg-brand-hover' : 'bg-brand text-white hover:bg-brand-hover'}`}
              >
                {selectedMethod} <ChevronDown size={16} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className={`absolute right-0 top-full mt-2 w-full sm:w-40 border rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
                  {methods.map((method) => (
                    <button
                      key={method}
                      onClick={() => {
                        setSelectedMethod(method);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors ${selectedMethod === method
                        ? (isDark ? 'bg-brand/20 text-brand-lightdark' : 'bg-brand-light text-brand')
                        : (isDark ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800')
                        }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Table Columns */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className={`${isDark ? 'bg-slate-800/30' : 'bg-slate-50/60'}`}>
                {['Transaction ID', 'Store Name', 'Date & Time', 'Payment Method', 'Amount', 'Status', 'Details'].map((h) => (
                  <th key={h} className={`px-6 py-5 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-brand/80'} ${h === 'Details' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
              {currentTransactions?.length > 0 ? (
                currentTransactions.map((tx, idx) => {
                  const storeName = tx?.storeName || tx?.customer || 'Unknown';
                  return (
                    <tr key={idx} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'}`}>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-brand'}`}>{tx?.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[13px] ${isDark ? 'bg-brand/20 text-white' : 'bg-brand-light text-brand'}`}>
                            {storeName.charAt(0).toUpperCase()}
                          </div>
                          <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}>{storeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-slate-600'}`}>{tx.date}</span>
                          <span className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>{tx.time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {getMethodIcon(tx.method, isDark)}
                          <span className="text-[13px] font-bold">{tx.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[14px] font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          KES {Number(tx?.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${getStatusBadge(tx.status, isDark)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openTransactionDetails(tx)}
                          className={`text-[11px] uppercase font-bold tracking-wider px-5 py-2 rounded-lg transition-all active:scale-95 shadow-sm ${isDark ? 'bg-brand hover:bg-brand-hover text-white' : 'bg-brand hover:bg-brand-hover text-white'}`}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="7" className={`px-6 py-12 text-center font-bold text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                    {loading ? "Loading transactions..." : error ? `Error: ${error}` : "No transactions found displaying your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredTransactions.length > 0 && (
          <div className={`px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-slate-700/50 bg-[#2c3136]' : 'border-slate-100 bg-slate-50/50'}`}>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTransactions.length)} of {filteredTransactions.length} entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border`}
              >
                <ChevronLeft size={16} /> Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => setCurrentPage(number)}
                  className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-lg transition-colors border ${currentPage === number
                    ? (isDark ? 'bg-brand text-white border-brand shadow-sm' : 'bg-brand text-white border-brand shadow-sm')
                    : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
                    }`}
                >
                  {number}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-bold rounded-lg disabled:opacity-50 disabled:pointer-events-none transition-colors ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'} border`}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 5. Modal Rendering */}
      {isModalOpen && (
        <TransactionModal
          data={selectedTransaction}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Transactions;

