import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrandList from './components/BrandList';
import { Award } from 'lucide-react';
import { useTheme } from "@/context/store-admin/ThemeContext";
import { brandsData } from './data/brandsData';

const BrandPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredBrands = brandsData.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBrandClick = (brand) => {
        // Navigate to the brand products detail page using parameters
        navigate(`/store-dashboard/brands/${brand.id}`);
    };

    return (
        <div className="space-y-8 pb-8 animate-fade-in">
            {/* Header section consistent with Hub-Admin style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Brands</h2>
                    <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Manage and explore all product brands and partners
                    </p>
                </div>
            </div>

            {/* BrandList: filter bar + brand cards grid */}
            <BrandList 
                brands={filteredBrands} 
                onBrandClick={handleBrandClick} 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            {/* Verification Badge / Footer Info */}
            <div className={`p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isDark ? 'bg-[#2c3136]/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center text-brand">
                        <Award size={24} />
                    </div>
                    <div>
                        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Verified Partner Program</h4>
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>All listed brands are officially verified and managed.</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Last sync: {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
};

export default BrandPage;
