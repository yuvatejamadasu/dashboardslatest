import React from 'react';
import { CreditCard, Package, AlertTriangle } from 'lucide-react';

const notifications = [
  {
    id: 1,
    title: 'New Admin Request',
    description: 'A new Hub Admin request requires your approval.',
    time: '5 mins ago',
    icon: <CreditCard size={18} className="text-blue-500" />,
    bg: 'bg-blue-50 dark:bg-blue-500/10'
  },
  {
    id: 2,
    title: 'System Update',
    description: 'Platform maintenance scheduled for 2 AM UTC.',
    time: '2 hours ago',
    icon: <Package size={18} className="text-emerald-500" />,
    bg: 'bg-emerald-50 dark:bg-emerald-500/10'
  },
  {
    id: 3,
    title: 'Security Alert',
    description: 'Login from an unrecognized device detected.',
    time: 'Yesterday',
    icon: <AlertTriangle size={18} className="text-amber-500" />,
    bg: 'bg-amber-50 dark:bg-amber-500/10'
  }
];

const NotificationDropdown = ({ isDark, onClose }) => {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className={`absolute right-0 mt-3 w-80 rounded-xl border shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-scale-in ${
        isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-100'
      }`}>
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>Notifications</h3>
          <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full">3 New</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`flex gap-3 p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                isDark ? 'border-slate-700/50 hover:bg-slate-800/80' : 'border-slate-50 hover:bg-slate-50'
              }`}
              onClick={onClose}
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${notif.bg}`}>
                {notif.icon}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-bold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {notif.title}
                </h4>
                <p className={`text-xs mt-1 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {notif.description}
                </p>
                <p className="text-[10px] font-medium text-brand mt-1.5">{notif.time}</p>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={onClose}
          className={`w-full py-2.5 text-xs font-bold transition-colors ${
            isDark ? 'bg-[#212529] text-brand hover:text-brand-hover' : 'bg-slate-50 text-brand hover:text-brand-hover'
          }`}
        >
          View All Notifications
        </button>
      </div>
    </>
  );
};

export default NotificationDropdown;
