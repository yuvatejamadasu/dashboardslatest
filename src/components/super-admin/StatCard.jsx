import React from 'react';
import { useTheme } from '@/context/super-admin/ThemeContext';

const StatCard = ({ icon, label, value, subtext, colorClass, className }) => {
  const { isDark } = useTheme();
  return (
    <div className={`p-6 rounded-xl border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${
      isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
    } ${className || ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
          <h4 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h4>
          <p className={`text-xs mt-1 font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
