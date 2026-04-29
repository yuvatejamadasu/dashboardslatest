import React from 'react';
import { FileText, Download, CheckCircle, CreditCard, Plus } from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';

const Billing = () => {
  const { isDark } = useTheme();

  const invoices = [
    { id: '#INV-001', date: 'Oct 15, 2021', amount: 'KES 450.00', status: 'Paid' },
    { id: '#INV-002', date: 'Sep 12, 2021', amount: 'KES 380.00', status: 'Paid' },
    { id: '#INV-003', date: 'Aug 05, 2021', amount: 'KES 412.00', status: 'Paid' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Billing & Invoices</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Payment Methods */}
        <div className={`rounded-xl border transition-all duration-300 ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Payment Methods</h4>
              <button className="text-brand font-bold text-xs flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add New
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                isDark ? 'bg-[#212529] border-slate-700' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h6 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Visa **** 4567</h6>
                    <p className="text-xs text-slate-500 font-medium">Expires 12/26</p>
                  </div>
                </div>
                <div className="text-brand">
                  <CheckCircle size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice History */}
        <div className={`rounded-xl border transition-all duration-300 ${
          isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <div className="p-6">
            <h4 className={`text-lg font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>Invoice History</h4>
            <div className="space-y-4">
              {invoices.map(inv => (
                <div key={inv.id} className={`flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <h6 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{inv.id}</h6>
                      <p className="text-xs text-slate-500 font-medium">{inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{inv.amount}</p>
                    <button className="text-slate-400 hover:text-brand transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
