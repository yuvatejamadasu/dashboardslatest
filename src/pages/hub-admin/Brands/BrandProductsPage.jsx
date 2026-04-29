import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Search, 
    ArrowLeft, 
    Filter, 
    ChevronRight, 
    Mail, 
    Phone, 
    User, 
    MoreVertical,
    Package
} from 'lucide-react';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useBrands } from '@/context/hub-admin/BrandsContext';
import { hubAdminService } from '@/services/hub-admin/hubAdminService';
import { useAuth } from '@/context/AuthContext';

const BrandDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { brands } = useBrands();
    const { userData } = useAuth();
    const hubId = userData?.hubId || userData?.entityId;

    // Find the specific brand using the ID from the URL
    const brand = useMemo(() => 
        brands.find(b => String(b.id) === String(id)), 
        [brands, id]
    );

    // ── State ──────────────────────────────────────────────────────────────────
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Sync products if brand changes
    React.useEffect(() => {
        if (brand) {
            setProducts(brand.products || []);
        }
    }, [brand]);

    // ── Combined Filtering Logic ───────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.productName.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = category ? product.category === category : true;
            const matchesStatus = status ? product.status === status : true;
            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, search, category, status]);

    // Get unique categories for the filter dropdown
    const categories = useMemo(() => {
        return [...new Set(products.map(p => p.category))];
    }, [products]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleAddProduct = async (newProduct) => {
        if (!brand || !hubId) return;
        
        try {
            const productWithId = {
                ...newProduct,
                id: Date.now().toString(),
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            };

            const updatedProducts = [productWithId, ...products];
            
            // We need to update the brand in the database with the new products list
            // For now, let's update it via a service call if available
            // If hubAdminService doesn't have updateBrandProducts, we might need to add it
            await hubAdminService.updateBrand(brand.id, { 
                products: updatedProducts 
            });

            setProducts(updatedProducts);
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding product to brand:", error);
            alert("Failed to add product. Please try again.");
        }
    };

    if (!brand) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
                <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-2xl mb-4 border border-rose-100 dark:border-rose-800 text-rose-500">
                    <Package size={48} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Brand Not Found</h2>
                <button 
                    onClick={() => navigate('/hub-dashboard/brands')}
                    className="mt-4 text-brand font-bold flex items-center gap-2 hover:underline"
                >
                    <ArrowLeft size={16} /> Back to Brands List
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            {/* Add Product Modal */}
            {showAddModal && (
                <AddProductModal 
                    isDark={isDark} 
                    onClose={() => setShowAddModal(false)} 
                    onAdd={handleAddProduct}
                    brandName={brand.name}
                />
            )}
            {/* Breadcrumbs & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-2">
                        <button onClick={() => navigate('/hub-dashboard/brands')} className="text-slate-400 hover:text-brand transition-colors">Brands</button>
                        <ChevronRight size={10} className="text-slate-300" />
                        <span className="text-brand">{brand.name}</span>
                    </nav>
                    <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Brand Details</h2>
                </div>
                <button 
                    onClick={() => navigate('/hub-dashboard/brands')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all active:scale-95 shadow-sm ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <ArrowLeft size={16} />
                    Back to Brands
                </button>
            </div>

            {/* Profile Header Card */}
            <div className={`p-8 rounded-3xl border transition-all duration-500 ${isDark ? 'bg-[#212529] border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl p-4 bg-white border border-slate-100 shadow-inner flex items-center justify-center shrink-0">
                        <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    
                    {/* Brand Info */}
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{brand.name}</h1>
                            <span className="px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-wider">
                                {brand.tag}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand/5 flex items-center justify-center text-brand">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Manager</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{brand.managerName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-500">
                                    <Mail size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Email</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate">{brand.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">Phone</p>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{brand.phone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combined Filter Bar */}
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-12 lg:col-span-5 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder={`Search ${brand.name} products...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                                isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-brand shadow-inner'
                            }`}
                        />
                    </div>
                    <div className="md:col-span-12 lg:col-span-7 flex flex-wrap lg:flex-nowrap items-center gap-3 justify-end">
                        <div className="relative min-w-[180px] flex-1 lg:flex-none">
                            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 opacity-50" />
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs font-bold appearance-none outline-none cursor-pointer ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <option value="">{brand.name} Categories</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div className="relative min-w-[160px] flex-1 lg:flex-none">
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold appearance-none outline-none cursor-pointer ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <option value="">{brand.name} Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <button 
                            onClick={() => {setSearch(''); setCategory(''); setStatus('');}}
                            className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                                isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Table Section */}
            <div className={`rounded-3xl border overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Product Inventory</h3>
                        <span className="px-2 py-0.5 rounded-lg bg-brand/10 text-brand text-[10px] font-black">{filteredProducts.length}</span>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-brand hover:bg-brand-hover text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand/20 flex items-center gap-2"
                    >
                        <Package size={16} /> Add Product
                    </button>
                </div>
                <div className="overflow-x-auto overflow-y-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50/80'} border-b border-slate-100 dark:border-slate-700/50`}>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Name</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Price</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock</th>
                                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-slate-100'}`}>
                            {filteredProducts.map((p) => (
                                <tr key={p.id} className={`group transition-all duration-200 ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand font-black text-[10px] shrink-0 border border-brand/10 transition-transform group-hover:scale-110">
                                                {p.productName.charAt(0)}
                                            </div>
                                            <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{p.productName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className={`px-8 py-5 text-sm font-black ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                                        ${p.price.toFixed(2)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center text-[10px] font-bold">
                                                <span className={p.stock < 10 ? 'text-rose-500' : 'text-slate-400'}>{p.stock} units</span>
                                                <span className="text-slate-300">/ 200</span>
                                            </div>
                                            <div className="w-32 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full transition-all duration-1000 ${p.stock < 10 ? 'bg-rose-500' : 'bg-brand'}`}
                                                    style={{ width: `${Math.min(100, (p.stock / 200) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border ${
                                            p.status === 'Active' 
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800' 
                                            : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Package size={48} />
                                            <p className="text-sm font-bold uppercase tracking-widest">No products matching filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BrandDetail;

const AddProductModal = ({ isDark, onClose, onAdd, brandName }) => {
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        price: '',
        stock: '',
        status: 'Active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-scale-in border ${
                isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-white border-slate-100'
            }`}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                    <div>
                        <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Add New Product</h3>
                        <p className="text-xs text-slate-500 font-bold mt-1">Register for {brandName}</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name</label>
                        <input 
                            required
                            type="text"
                            placeholder="e.g. Classic T-Shirt"
                            value={formData.productName}
                            onChange={e => setFormData({...formData, productName: e.target.value})}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                                isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-brand'
                            }`}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                            <input 
                                required
                                type="text"
                                placeholder="e.g. Fashion"
                                value={formData.category}
                                onChange={e => setFormData({...formData, category: e.target.value})}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-brand'
                                }`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
                            <select 
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all cursor-pointer ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-slate-300 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-600 focus:bg-white focus:border-brand'
                                }`}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price (USD)</label>
                            <input 
                                required
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={e => setFormData({...formData, price: e.target.value})}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-brand'
                                }`}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Units</label>
                            <input 
                                required
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={e => setFormData({...formData, stock: e.target.value})}
                                className={`w-full px-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${
                                    isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-brand'
                                }`}
                            />
                        </div>
                    </div>
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className={`flex-1 px-6 py-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                                isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 bg-brand hover:bg-brand-hover text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-brand/20"
                        >
                            Save Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
