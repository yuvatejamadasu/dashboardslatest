import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';
import BrandCard from './BrandCard';
import { useTheme } from "@/context/store-admin/ThemeContext";

// Renders the full brand listing grid inside the card (header filters + brand cards).
// onBrandClick(brand) — called with the clicked brand object.
const BrandList = ({ brands, onBrandClick, searchTerm, setSearchTerm }) => {
    const { isDark } = useTheme();

    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-6 transition-all duration-300 ${
            isDark ? 'bg-[#212529] border-slate-700/50 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
            <header className={`p-5 border-b transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/20 border-slate-100'}`}>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 items-center">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search brands..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-xl border transition-all duration-300 outline-none focus:ring-2 focus:ring-brand ${
                                isDark ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-inner'
                            }`}
                        />
                    </div>
                </div>
            </header>
            <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                    {brands.map((brand) => (
                        <BrandCard
                            key={brand.id}
                            brand={brand}
                            onBrandClick={() => onBrandClick(brand)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BrandList;
