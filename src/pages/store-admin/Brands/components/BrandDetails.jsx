import React from 'react';

// Displays the selected brand's logo and name at the top of the Brand Products page.
const BrandDetails = ({ brand }) => {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div
                className="brand-logo-wrap border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm"
                style={{ width: 80, height: 80, flexShrink: 0 }}
            >
                <img
                    src={brand.logo}
                    alt={brand.name}
                    style={{ maxWidth: 68, maxHeight: 68, objectFit: 'contain' }}
                />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{brand.name}</h2>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 w-fit">
                    <span className="text-orange-500 text-xs">★</span>
                    <span className="text-orange-700 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
                        Official Brand Partner
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BrandDetails;
