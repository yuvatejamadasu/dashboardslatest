import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPrev, onNext, isDark }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-6 py-6 border-t border-slate-100 dark:border-slate-700/50">
            <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                    isDark 
                        ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                onClick={onPrev}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={18} />
                Previous
            </button>

            <span className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Page <span className={isDark ? 'text-white' : 'text-slate-800'}>{currentPage}</span> of <span className={isDark ? 'text-white' : 'text-slate-800'}>{totalPages}</span>
            </span>

            <button
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm ${
                    isDark 
                        ? 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                }`}
                onClick={onNext}
                disabled={currentPage === totalPages}
            >
                Next
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
