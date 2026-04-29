import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandList from './components/BrandList';
import { Award, Plus, X, Loader2 } from 'lucide-react';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useBrands } from '@/context/hub-admin/BrandsContext';

const BrandPage = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { brands, addBrand, updateBrand, deleteBrand, loading } = useBrands();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [brandImage, setBrandImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Edit State
    const [editingBrand, setEditingBrand] = useState(null);
    const [editName, setEditName] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [editPreview, setEditPreview] = useState(null);

    const filteredBrands = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBrandClick = (brand) => {
        // Navigate to the brand products detail page using parameters
        navigate(`/hub-dashboard/brands/${brand.id}`);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBrandImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditClick = (brand) => {
        setEditingBrand(brand);
        setEditName(brand.name);
        setEditPreview(brand.image || brand.logo);
    };

    const handleDeleteClick = async (brand) => {
        if (window.confirm(`Are you sure you want to delete "${brand.name}"?`)) {
            try {
                await deleteBrand(brand.id);
            } catch (error) {
                alert('Failed to delete brand.');
            }
        }
    };

    const handleUpdateBrand = async (e) => {
        e.preventDefault();
        if (editName.trim()) {
            try {
                setIsSubmitting(true);
                await updateBrand(editingBrand.id, {
                    name: editName.trim(),
                    image: editPreview
                });
                setEditingBrand(null);
            } catch (error) {
                alert('Failed to update brand.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleAddBrand = async (e) => {
        e.preventDefault();
        if (newBrandName.trim()) {
            try {
                setIsSubmitting(true);
                await addBrand({ 
                    name: newBrandName.trim(),
                    image: imagePreview // Passing base64 for now
                });
                setNewBrandName('');
                setBrandImage(null);
                setImagePreview(null);
                setIsModalOpen(false);
            } catch (error) {
                alert('Failed to add brand. Please try again.');
            } finally {
                setIsSubmitting(false);
            }
        }
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
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium shadow-sm"
                >
                    <Plus size={18} />
                    <span>New Brand</span>
                </button>
            </div>

            {/* BrandList: filter bar + brand cards grid */}
            <BrandList 
                brands={filteredBrands} 
                onBrandClick={handleBrandClick} 
                onEditBrand={handleEditClick}
                onDeleteBrand={handleDeleteClick}
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

            {/* Add Brand Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Add New Brand</h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddBrand} className="p-4 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="Enter brand name"
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all ${
                                        isDark 
                                            ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Brand Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
                                        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                                    }`}>
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <Plus className="text-slate-400" size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            id="brand-image-upload"
                                        />
                                        <label
                                            htmlFor="brand-image-upload"
                                            className={`px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all inline-block ${
                                                isDark 
                                                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            {brandImage ? 'Change Image' : 'Choose Image'}
                                        </label>
                                        <p className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 2MB</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`pt-2 flex gap-3 justify-end`}>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsModalOpen(false)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newBrandName.trim() || isSubmitting}
                                    className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        'Add Brand'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Brand Modal */}
            {editingBrand && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white border border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>Edit Brand</h3>
                            <button 
                                onClick={() => setEditingBrand(null)}
                                className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateBrand} className="p-4 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Brand Name</label>
                                <input
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Enter brand name"
                                    className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all ${
                                        isDark 
                                            ? 'bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500' 
                                            : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'
                                    }`}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Brand Logo</label>
                                <div className="flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${
                                        isDark ? 'border-slate-700 bg-slate-800/50' : 'border-slate-200 bg-slate-50'
                                    }`}>
                                        {editPreview ? (
                                            <img src={editPreview} alt="Preview" className="w-full h-full object-contain" />
                                        ) : (
                                            <Plus className="text-slate-400" size={20} />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setEditPreview(reader.result);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="hidden"
                                            id="brand-edit-upload"
                                        />
                                        <label
                                            htmlFor="brand-edit-upload"
                                            className={`px-4 py-2 rounded-lg border text-xs font-bold cursor-pointer transition-all inline-block ${
                                                isDark 
                                                    ? 'border-slate-700 hover:bg-slate-800 text-slate-300' 
                                                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                                            }`}
                                        >
                                            Change Image
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className={`pt-2 flex gap-3 justify-end`}>
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setEditingBrand(null)}
                                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!editName.trim() || isSubmitting}
                                    className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading && brands.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-brand animate-spin mb-4" />
                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>Loading brands...</p>
                </div>
            )}
        </div>
    );
};

export default BrandPage;
