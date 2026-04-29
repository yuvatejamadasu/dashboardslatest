import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from "@/context/hub-admin/ThemeContext";

/**
 * Reusable loading/error state wrapper used by all data-fetching pages.
 */
const DataState = ({ loading, error, children }) => {
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-brand" />
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Loading data…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className={`flex flex-col items-center gap-3 p-8 rounded-xl border ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <AlertCircle size={36} className="text-rose-500" />
          <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            Failed to load data
          </p>
          <p className="text-xs text-slate-400 text-center max-w-xs">{error}</p>
        </div>
      </div>
    );
  }

  return children;
};

export default DataState;
