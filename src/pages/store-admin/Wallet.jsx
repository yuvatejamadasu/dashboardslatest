import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, CreditCard } from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';

const Wallet = () => {
  const { isDark } = useTheme();

  const transactions = [
    { id: 1, type: 'Income', amount: '+KES 500.00', date: 'Oct 24, 2021', status: 'Completed', color: 'text-brand' },
    { id: 2, type: 'Expense', amount: '-KES 120.50', date: 'Oct 23, 2021', status: 'Pending', color: 'text-rose-500' },
    { id: 3, type: 'Income', amount: '+KES 1,200.00', date: 'Oct 20, 2021', status: 'Completed', color: 'text-brand' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>My Wallet</h2>
        <button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all">
          <Plus size={18} />
          Add Funds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className={`lg:col-span-1 p-8 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-xl shadow-brand-light relative overflow-hidden`}>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md">
                <WalletIcon size={24} />
              </div>
              <CreditCard size={24} className="opacity-40" />
            </div>
            <div>
              <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Total Balance</p>
              <h3 className="text-3xl font-bold">KES 12,456.80</h3>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase">Card Holder</p>
                <p className="text-sm font-bold">Store Admin</p>
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-bold uppercase">Expires</p>
                <p className="text-sm font-bold">12/26</p>
              </div>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        {/* Transactions List */}
        <div className={`lg:col-span-2 rounded-xl border transition-all duration-300 ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-6">
            <h4 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Recent Transactions</h4>
            <div className="space-y-4">
              {transactions.map(tx => (
                <div key={tx.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  isDark ? 'bg-[#212529] border-slate-700/50 hover:bg-slate-700' : 'bg-slate-50 border-slate-100 hover:bg-white'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'Income' ? 'bg-brand/10 text-brand' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {tx.type === 'Income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <h6 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tx.type}</h6>
                      <p className="text-xs text-slate-500 font-medium">{tx.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.color}`}>{tx.amount}</p>
                    <p className={`text-[10px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 rounded-lg border border-dashed border-slate-300 text-slate-400 text-xs font-bold hover:border-brand hover:text-brand transition-all">
              View All Transactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
