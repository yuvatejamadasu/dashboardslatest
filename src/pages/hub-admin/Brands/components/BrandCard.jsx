import { useTheme } from "@/context/hub-admin/ThemeContext";
import { Edit2, Trash2 } from 'lucide-react';

// Renders a single brand card in the brands listing grid.
// onBrandClick — called when the card is clicked.
const BrandCard = ({ brand, onBrandClick, onEdit, onDelete }) => {
    const { isDark } = useTheme();

    return (
        <div 
            className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-brand border ${
                isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
            }`}
        >
            {/* Quick Actions overlay */}
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(brand);
                    }}
                    className={`p-1.5 rounded-lg shadow-lg border backdrop-blur-md transition-all active:scale-90 ${
                        isDark 
                            ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-brand' 
                            : 'bg-white/80 border-slate-100 text-slate-600 hover:text-white hover:bg-brand'
                    }`}
                    title="Edit Brand"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(brand);
                    }}
                    className={`p-1.5 rounded-lg shadow-lg border backdrop-blur-md transition-all active:scale-90 ${
                        isDark 
                            ? 'bg-slate-800/80 border-slate-700 text-red-400 hover:text-white hover:bg-red-500' 
                            : 'bg-white/80 border-slate-100 text-red-500 hover:text-white hover:bg-red-500'
                    }`}
                    title="Delete Brand"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <div 
                onClick={onBrandClick}
                className={`h-32 flex items-center justify-center p-4 transition-all duration-300 ${
                    isDark ? 'bg-slate-800/50' : 'bg-white'
                }`}
            >
                <img 
                    src={brand.image || brand.logo || 'https://via.placeholder.com/150?text=Brand'} 
                    className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 ${isDark ? '' : 'mix-blend-multiply'}`} 
                    alt={brand.name} 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(brand.name); }}
                />
            </div>
            <div 
                onClick={onBrandClick}
                className={`p-4 text-center border-t transition-all duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}
            >
                <h6 className={`font-bold truncate mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{brand.name}</h6>
                <p className="text-xs font-black text-brand uppercase tracking-widest"> {brand.products?.length || 0} Products </p>
            </div>
        </div>
    );
};

export default BrandCard;
