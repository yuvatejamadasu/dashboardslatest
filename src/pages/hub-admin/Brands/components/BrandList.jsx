import React from 'react';
import { Search, Filter, Calendar, LayoutGrid, List, Edit2, Trash2, X } from 'lucide-react';
import BrandCard from './BrandCard';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import Pagination from '@/components/common/Pagination';

// Renders the full brand listing grid inside the card (header filters + brand cards).
// onBrandClick(brand) — called with the clicked brand object.
const BrandList = ({ brands, onBrandClick, onEditBrand, onDeleteBrand, searchTerm, setSearchTerm }) => {
    const { isDark } = useTheme();
    const [viewMode, setViewMode] = React.useState(localStorage.getItem('hubBrandsViewMode') || 'grid');
    
    // Pagination State
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        localStorage.setItem('hubBrandsViewMode', mode);
    };

    // Pagination Logic
    const totalPages = Math.ceil(brands.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);

    // Reset page when search changes (brands prop changes)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [brands]);

    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden mb-6 transition-all duration-300 ${
            isDark ? 'bg-[#212529] border-slate-700/50 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
            <header className={`p-5 border-b transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/20 border-slate-100'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
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
                    <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                        <button
                            onClick={() => handleViewModeChange('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                            title="List View"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => handleViewModeChange('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                            title="Grid View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>
                </div>
            </header>
            <div className="p-6">
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                                    <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Brand</th>
                                    <th className={`p-4 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Products</th>
                                    <th className={`p-4 text-xs font-bold uppercase tracking-wider text-right ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBrands.map((brand) => (
                                    <tr 
                                        key={brand.id}
                                        className={`border-b last:border-b-0 transition-colors ${
                                            isDark ? 'border-slate-700/50 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-lg border p-1 flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                                                    <img 
                                                        src={brand.image || brand.logo || 'https://via.placeholder.com/150?text=' + encodeURIComponent(brand.name)} 
                                                        className={`max-h-full max-w-full object-contain ${isDark ? '' : 'mix-blend-multiply'}`} 
                                                        alt={brand.name} 
                                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(brand.name); }}
                                                    />
                                                </div>
                                                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                                    {brand.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-sm font-black text-brand`}>
                                                {brand.products?.length || 0}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEditBrand(brand);
                                                    }}
                                                    className={`p-2 rounded-lg border transition-all ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
                                                    title="Edit Brand"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onDeleteBrand(brand);
                                                    }}
                                                    className={`p-2 rounded-lg border transition-all ${isDark ? 'border-slate-700 text-red-400 hover:bg-red-500/10' : 'border-slate-200 text-red-500 hover:bg-red-50'}`}
                                                    title="Delete Brand"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onBrandClick(brand);
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all active:scale-95 shadow-md ml-2"
                                                >
                                                    View Products
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {currentBrands.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500 text-sm font-medium">
                                            No brands found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                        {currentBrands.map((brand) => (
                            <BrandCard
                                key={brand.id}
                                brand={brand}
                                onBrandClick={() => onBrandClick(brand)}
                                onEdit={onEditBrand}
                                onDelete={onDeleteBrand}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination Controls */}
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPrev={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    onNext={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    isDark={isDark}
                />
            </div>
        </div>
    );
};

export default BrandList;
