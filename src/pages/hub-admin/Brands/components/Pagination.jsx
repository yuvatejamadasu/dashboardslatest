import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPrev, onNext }) => {
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-6 mt-8 mb-4">
            <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                onClick={onPrev}
                disabled={currentPage === 1}
            >
                <ChevronLeft size={18} />
                Previous
            </button>

            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Page <span className="text-slate-800 dark:text-white">{currentPage}</span> of <span className="text-slate-800 dark:text-white">{totalPages}</span>
            </span>

            <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
