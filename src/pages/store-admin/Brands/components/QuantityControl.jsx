import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantityControl = ({ productId, quantity, onIncrease, onDecrease }) => {
    return (
        <div className="flex items-center justify-center gap-3 mt-3">
            <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm"
                onClick={() => onDecrease(productId)}
                disabled={quantity === 0}
                aria-label="Decrease quantity"
            >
                <Minus size={14} className="group-hover:scale-110 transition-transform" />
            </button>
            <span
                className={`min-w-[24px] text-center font-black text-sm select-none ${
                    quantity > 0 ? 'text-brand' : 'text-slate-400'
                }`}
            >
                {quantity}
            </span>
            <button
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-brand hover:bg-brand hover:text-white transition-all active:scale-95 group shadow-sm"
                onClick={() => onIncrease(productId)}
                aria-label="Increase quantity"
            >
                <Plus size={14} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>
    );
};

export default QuantityControl;
