import { useTheme } from "@/context/store-admin/ThemeContext";

// Renders a single brand card in the brands listing grid.
// onBrandClick — called when the card is clicked.
const BrandCard = ({ brand, onBrandClick }) => {
    const { isDark } = useTheme();

    return (
        <div 
            onClick={onBrandClick}
            className={`group cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:border-brand border ${
                isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'
            }`}
        >
            <div className={`h-32 flex items-center justify-center p-4 transition-all duration-300 ${
                isDark ? 'bg-slate-800/50' : 'bg-white'
            }`}>
                <img 
                    src={brand.logo} 
                    className={`max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110 ${isDark ? '' : 'mix-blend-multiply'}`} 
                    alt={brand.name} 
                />
            </div>
            <div className={`p-4 text-center border-t transition-all duration-300 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <h6 className={`font-bold truncate mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{brand.name}</h6>
                <p className="text-xs font-black text-brand uppercase tracking-widest"> {brand.products.length} Products </p>
            </div>
        </div>
    );
};

export default BrandCard;
