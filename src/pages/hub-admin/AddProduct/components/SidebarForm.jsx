import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useTranslation } from 'react-i18next';
import { Edit2, Trash2 } from 'lucide-react';
import { useBrands } from '@/context/hub-admin/BrandsContext';
import "../styles/SidebarForm.css";

// ─── Data ────────────────────────────────────────────────────────────────────

const categoryProducts = {
  Grocery:   ['Rice', 'Wheat', 'Dal', 'Sugar', 'Atta', 'Oil'],
  Dairy:     ['Milk', 'Curd', 'Butter', 'Paneer', 'Ghee', 'Cheese'],
  Beverages: ['Orange Juice', 'Mango Juice', 'Coconut Water', 'Cold Coffee', 'Lemon Soda'],
  Snacks:    ['Biscuits', 'Chips', 'Namkeen', 'Cookies', 'Popcorn'],
};

// Product-to-Brand mapping
const productBrands = {
  Rice: ['India Gate', 'Daawat', 'Kohinoor', 'Local'],
  Wheat: ['Aashirvaad', 'Pillsbury', 'Patanjali', 'Local'],
  Dal: ['Tata Sampann', 'Rajdhani', 'Local'],
  Sugar: ['Madhur', 'Parry', 'Local'],
  Atta: ['Aashirvaad', 'Pillsbury', 'Fortune', 'Local'],
  Oil: ['Fortune', 'Saffola', 'Sundrop', 'Dhara'],
  Milk: ['Amul', 'Nestle', 'Heritage', 'Mother Dairy'],
  Curd: ['Amul', 'Milky Mist', 'Nestle', 'Mother Dairy'],
  Butter: ['Amul', 'Nutralite', 'Mother Dairy'],
  Paneer: ['Amul', 'Gowardhan', 'Local'],
  Ghee: ['Amul', 'Patanjali', 'Gowardhan'],
  Cheese: ['Amul', 'Go', 'Britannia', 'Laughing Cow'],
  'Orange Juice': ['Tropicana', 'Real', 'B Natural'],
  'Mango Juice': ['Maaza', 'Slice', 'Frooti'],
  'Coconut Water': ['Paper Boat', 'Raw Pressery'],
  'Cold Coffee': ['Nescafe', 'Amul', 'Starbucks'],
  'Lemon Soda': ['Sprite', '7UP', 'Limca'],
  Biscuits: ['Parle-G', 'Britannia', 'Sunfeast', 'Oreo'],
  Chips: ['Lays', 'Bingo', 'Uncle Chipps', 'Doritos'],
  Namkeen: ['Haldiram', 'Bikano', 'Balaji'],
  Cookies: ['Hide & Seek', 'Good Day', "Mom's Magic"],
  Popcorn: ['Act II', '4700BC', 'PVR Popcorn'],
};

// Product-type classification
const liquidProducts = new Set(['Milk', 'Orange Juice', 'Mango Juice', 'Coconut Water', 'Cold Coffee', 'Lemon Soda', 'Oil', 'Ghee']);
const packProducts   = new Set(['Biscuits', 'Chips', 'Namkeen', 'Cookies', 'Popcorn', 'Cheese', 'Butter']);

// Unit suggestions per product type
const unitSuggestions = {
  liquid: { presets: ['250 ml', '500 ml', '1 L', '2 L', '5 L'], units: ['ml', 'L'] },
  pack:   { presets: ['1 Pack', '2 Packs', '5 Packs', '10 Packs'], units: ['Pack', 'Packs', 'Box', 'Pieces'] },
  weight: { presets: ['250 g', '500 g', '1 kg', '5 kg'], units: ['g', 'kg'] },
};

function getWeightType(product) {
  if (!product) return 'weight';
  if (liquidProducts.has(product)) return 'liquid';
  if (packProducts.has(product))   return 'pack';
  return 'weight';
}

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_FORM = {
  category:     '',
  productName:  '',
  brand:        '',
  details:      '',
};

const createEmptyVariant = () => ({
  id: Date.now() + Math.random(),
  weight: '',
  sellingPrice: '',
  mrp: '',
  itemsCount: ''
});

// ─── Component ────────────────────────────────────────────────────────────────

const SidebarForm = ({ onAddProduct, productToEdit, clearEditProduct }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const [formData,     setFormData]     = useState(INITIAL_FORM);
  const [savedVariants, setSavedVariants] = useState([]);
  const [currentVariant, setCurrentVariant] = useState(createEmptyVariant());
  const [isEditingVariant, setIsEditingVariant] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors,       setErrors]       = useState({});

  // Derived
  const availableProducts = formData.category ? categoryProducts[formData.category] : [];
  const { brands } = useBrands();
  
  // Get unique brand names from the database that belong to this hub
  const dbBrandNames = brands.map(b => b.name);
  
  // Get suggested brands for the selected product
  const defaultBrands = formData.productName ? (productBrands[formData.productName] || ['Local']) : [];
  
  // Combine both, ensuring unique values and including "Local" as a fallback
  const availableBrands = Array.from(new Set([...defaultBrands, ...dbBrandNames]));
  
  const weightType = getWeightType(formData.productName);
  const { presets, units } = unitSuggestions[weightType];

  // Populate form if editing
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        category: productToEdit.category || '',
        productName: productToEdit.productName || '',
        brand: productToEdit.brand || '',
        details: productToEdit.details || '',
      });
      setSavedVariants([{
        id: productToEdit.id || Date.now() + Math.random(),
        weight: String(productToEdit.weight || ''),
        sellingPrice: String(productToEdit.sellingPrice || ''),
        mrp: String(productToEdit.mrp || ''),
        itemsCount: String(productToEdit.itemsCount || '')
      }]);
      setCurrentVariant(createEmptyVariant());
      setIsEditingVariant(false);
      setImagePreview(productToEdit.imageUrl || null);
    }
  }, [productToEdit]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { productName: '', brand: '' } : {}),
      ...(name === 'productName' ? { brand: '' } : {}),
    }));
    
    // Reset variants when product changes
    if (name === 'productName') {
      setSavedVariants([]);
      setCurrentVariant(createEmptyVariant());
      setIsEditingVariant(false);
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCurrentVariantChange = (field, value) => {
    setCurrentVariant(prev => ({ ...prev, [field]: value }));
    if (errors[`current_${field}`]) {
      setErrors(prev => ({ ...prev, [`current_${field}`]: null }));
    }
  };

  const validateCurrentVariant = () => {
    const errs = {};
    if (!currentVariant.weight.trim()) errs['current_weight'] = `Weight is required`;
    if (!currentVariant.sellingPrice) errs['current_sellingPrice'] = `Selling price required`;
    if (!currentVariant.mrp) errs['current_mrp'] = `MRP required`;

    if (currentVariant.sellingPrice && currentVariant.mrp && Number(currentVariant.sellingPrice) > Number(currentVariant.mrp)) {
      errs['current_sellingPrice'] = 'Price cannot exceed MRP';
    }
    
    setErrors(prev => ({...prev, ...errs}));
    return Object.keys(errs).length === 0;
  };

  const addOrUpdateVariant = () => {
    if (!validateCurrentVariant()) return;

    if (isEditingVariant) {
      setSavedVariants(prev => prev.map(v => v.id === currentVariant.id ? currentVariant : v));
      setIsEditingVariant(false);
    } else {
      setSavedVariants(prev => [...prev, { ...currentVariant, id: Date.now() + Math.random() }]);
    }
    setCurrentVariant(createEmptyVariant());
    if (errors.variants) setErrors(e => ({...e, variants: null}));
  };

  const editSavedVariant = (v) => {
    setCurrentVariant(v);
    setIsEditingVariant(true);
  };

  const removeSavedVariant = (id) => {
    setSavedVariants(prev => prev.filter(v => v.id !== id));
  };

  // Preset chip click → populates the weight for current variant
  const handlePresetClick = (preset) => {
    setCurrentVariant(prev => ({ ...prev, weight: preset }));
    if (errors['current_weight']) {
      setErrors(e => ({ ...e, 'current_weight': null }));
    }
  };

  // Unit helper dropdown → append unit to current variant
  const handleUnitHelperChange = (unit) => {
    if (!unit) return;
    const current = currentVariant.weight.trim();
    const numeric  = current.replace(/[a-zA-Z\s]+$/, '').trim();
    const newValue = numeric ? `${numeric} ${unit}` : unit;
    setCurrentVariant(prev => ({ ...prev, weight: newValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        if (errors.imageFile) setErrors(prev => ({ ...prev, imageFile: null }));
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a valid image file.');
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.category)     errs.category     = 'Category is required';
    if (!formData.productName)  errs.productName  = 'Product is required';
    if (formData.productName && availableBrands.length > 0 && !formData.brand) errs.brand = 'Brand is required';
    if (!imagePreview)          errs.imageFile     = 'Product image is required';

    if (savedVariants.length === 0) {
      if (currentVariant.weight.trim() || currentVariant.sellingPrice || currentVariant.mrp) {
        errs.variants = "Please click 'Add Weight' to save the current weight before submitting.";
      } else {
        errs.variants = "At least one weight configuration is required.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    savedVariants.forEach((v) => {
      onAddProduct({
        id:       Date.now().toString() + Math.random().toString().slice(2, 6),
        ...formData,
        weight:   v.weight.trim(),
        sellingPrice: v.sellingPrice,
        mrp: v.mrp,
        itemsCount: v.itemsCount,
        weightType,
        imageUrl: imagePreview,
      });
    });

    setFormData(INITIAL_FORM);
    setSavedVariants([]);
    setCurrentVariant(createEmptyVariant());
    setIsEditingVariant(false);
    setImagePreview(null);
    if (clearEditProduct) clearEditProduct();
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const typeLabel = weightType === 'liquid' ? 'Volume' : weightType === 'pack' ? 'Qty / Pack' : 'Weight';
  const typeBadge = weightType === 'liquid' ? 'Liquid' : weightType === 'pack' ? 'Pack' : 'Weight';

  return (
    <div className={`sidebar-container transition-all duration-300 ${isDark ? 'sidebar-dark' : ''}`}>

      {/* ── Header ── */}
      <div className={`sidebar-header border-b transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100'}`}>
        <div className={`sidebar-logo ${isDark ? 'bg-brand/20 text-brand-lightdark' : 'bg-brand text-white'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <div>
          <h2 className={isDark ? 'text-white' : 'text-slate-800'}>{t('add_product.title')}</h2>
          <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{t('add_product.subtitle')}</p>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="sidebar-content">
        <form onSubmit={handleSubmit} className="product-form">

          {/* 1. Category */}
          <div className="form-group">
            <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Category <span className="required">*</span></label>
            <div className={`select-wrapper ${isDark ? 'dark-select' : ''}`}>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleInputChange}
                className={isDark ? 'bg-slate-800 border-slate-700 text-white' : ''}
              >
                <option value="">Select Category</option>
                {Object.keys(categoryProducts).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            {errors.category && <span className="error-msg">{errors.category}</span>}
          </div>

          {/* 2. Product */}
          <div className="form-group">
            <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Product <span className="required">*</span></label>
            <div className={`select-wrapper ${isDark ? 'dark-select' : ''}`}>
              <select
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                disabled={!formData.category}
                className={isDark ? 'bg-slate-800 border-slate-700 text-white disabled:opacity-50' : ''}
              >
                <option value="">Select Product</option>
                {availableProducts.map(prod => (
                  <option key={prod} value={prod}>{prod}</option>
                ))}
              </select>
            </div>
            {errors.productName && <span className="error-msg">{errors.productName}</span>}
          </div>

          {/* 2.5 Brand */}
          <div className="form-group">
            <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Brand <span className="required">*</span></label>
            <div className={`select-wrapper ${isDark ? 'dark-select' : ''}`}>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                disabled={!formData.productName || availableBrands.length === 0}
                className={isDark ? 'bg-slate-800 border-slate-700 text-white disabled:opacity-50' : ''}
              >
                <option value="">Select Brand</option>
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            {errors.brand && <span className="error-msg">{errors.brand}</span>}
          </div>

          {/* 3, 4, 5. Variants (Weights & Prices) */}
          <div className="form-group">
            <div className="flex justify-between items-center mb-2">
              <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                Weights & Prices <span className="required">*</span>
                {formData.productName && (
                  <span className={`unit-badge unit-${weightType} ml-2 ${isDark ? 'opacity-90 shadow-none' : ''}`}>{typeBadge}</span>
                )}
              </label>
            </div>

            <div className="variants-container space-y-4">
              
              {/* Saved Variants Table */}
              {savedVariants.length > 0 && (
                <div className={`rounded-xl border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <table className="w-full text-left text-xs">
                    <thead className={`${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'} font-bold uppercase`}>
                      <tr>
                        <th className="px-3 py-2">{typeLabel}</th>
                        <th className="px-3 py-2">MRP</th>
                        <th className="px-3 py-2">Price</th>
                        <th className="px-3 py-2">Items</th>
                        <th className="px-3 py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-700 bg-slate-800/30 text-slate-300' : 'divide-slate-200 bg-white text-slate-700'}`}>
                      {savedVariants.map(v => (
                        <tr key={v.id}>
                          <td className="px-3 py-2 font-medium">{v.weight}</td>
                          <td className="px-3 py-2">KES{v.mrp}</td>
                          <td className="px-3 py-2">KES{v.sellingPrice}</td>
                          <td className="px-3 py-2">{v.itemsCount || '-'}</td>
                          <td className="px-3 py-2 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => editSavedVariant(v)}
                                className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-700 text-blue-400' : 'hover:bg-slate-100 text-blue-600'}`}
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeSavedVariant(v.id)}
                                className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-700 text-rose-400' : 'hover:bg-slate-100 text-rose-600'}`}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Current Variant Form */}
              <div className={`p-4 rounded-xl border relative transition-all ${isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                
                {/* Weight Row */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{typeLabel}</label>
                    {/* Preset chips for this variant */}
                    {formData.productName && (
                      <div className="preset-chips !mb-0 !gap-1.5 flex-wrap justify-end">
                        {presets.map(p => (
                          <button
                            key={p}
                            type="button"
                            className={`chip !py-0.5 !px-2.5 !text-[10px] ${currentVariant.weight === p ? 'chip--active' : ''} ${isDark ? 'chip-dark focus:ring-brand shadow-none' : ''}`}
                            onClick={() => handlePresetClick(p)}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="qty-row">
                    <div className="qty-textbox-wrapper text-white w-full">
                      <input
                        type="text"
                        value={currentVariant.weight}
                        onChange={(e) => handleCurrentVariantChange('weight', e.target.value)}
                        placeholder="e.g. 750g, 1.5 kg, 2 L, 3 packs"
                        className={`qty-input !pl-3 ${errors['current_weight'] ? 'input-error' : ''} ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white'}`}
                        disabled={!formData.productName}
                        autoComplete="off"
                      />
                      {currentVariant.weight && (
                        <button
                          type="button"
                          className={`qty-clear right-2 ${isDark ? 'text-slate-400 hover:text-white' : ''}`}
                          onClick={() => handleCurrentVariantChange('weight', '')}
                          title="Clear"
                        >✕</button>
                      )}
                    </div>

                    {/* Unit helper — optional, appends unit to textbox */}
                    <div className="unit-helper-wrapper relative">
                      <select
                        className={`unit-helper-select !w-16 !pl-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white'}`}
                        value=""
                        onChange={(e) => handleUnitHelperChange(e.target.value)}
                        disabled={!formData.productName}
                        title="Pick a unit to append"
                      >
                        <option value="">Unit</option>
                        {units.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors['current_weight'] && <span className="error-msg">{errors['current_weight']}</span>}
                </div>

                {/* Prices & Items Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 !mb-0">
                  <div className="form-group !mb-0">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Selling Price</label>
                    <div className="input-with-prefix !mt-0">
                      <span className={`prefix ${isDark ? 'text-slate-400 bg-slate-700 border-slate-600' : ''}`}>KES</span>
                      <input
                        type="number"
                        value={currentVariant.sellingPrice}
                        onChange={(e) => handleCurrentVariantChange('sellingPrice', e.target.value)}
                        placeholder="0"
                        step="1"
                        min="0"
                        className={isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white'}
                      />
                    </div>
                    {errors['current_sellingPrice'] && <span className="error-msg !mt-1">{errors['current_sellingPrice']}</span>}
                  </div>

                  <div className="form-group !mb-0">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>MRP</label>
                    <div className="input-with-prefix !mt-0">
                      <span className={`prefix ${isDark ? 'text-slate-400 bg-slate-700 border-slate-600' : ''}`}>KES</span>
                      <input
                        type="number"
                        value={currentVariant.mrp}
                        onChange={(e) => handleCurrentVariantChange('mrp', e.target.value)}
                        placeholder="0"
                        step="1"
                        min="0"
                        className={isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white'}
                      />
                    </div>
                    {errors['current_mrp'] && <span className="error-msg !mt-1">{errors['current_mrp']}</span>}
                  </div>

                  <div className="form-group !mb-0">
                    <label className={`text-xs font-bold uppercase tracking-wider mb-1 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Items</label>
                    <input
                      type="number"
                      value={currentVariant.itemsCount}
                      onChange={(e) => handleCurrentVariantChange('itemsCount', e.target.value)}
                      placeholder="e.g. 50"
                      min="1"
                      className={isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : 'bg-white'}
                    />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addOrUpdateVariant}
                  disabled={!formData.productName}
                  className={`mt-4 flex items-center justify-center w-full gap-2 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                    isDark 
                      ? 'bg-brand text-white hover:bg-brand-hover disabled:opacity-50' 
                      : 'bg-brand text-white hover:bg-[#154682] disabled:opacity-50'
                  }`}
                >
                  {isEditingVariant ? 'Update Weight' : '+ Add Weight'}
                </button>

              </div>
            </div>
            {errors.variants && <span className="error-msg !mt-2 block">{errors.variants}</span>}
          </div>

          {/* 7. Image Upload */}
          <div className="form-group">
            <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Product Image <span className="required">*</span></label>
            <div className={`file-upload-wrapper ${imagePreview ? 'has-image' : ''} ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {!imagePreview && (
                <div className={`upload-placeholder ${isDark ? 'text-slate-500 hover:text-slate-400' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" strokeWidth="1.5"
                       strokeLinecap="round" strokeLinejoin="round" className={isDark ? 'text-slate-600' : ''}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className={isDark ? 'text-slate-400 font-bold' : ''}>Click to upload image</span>
                  <small>PNG, JPG, WEBP supported</small>
                </div>
              )}
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <div className="change-image-overlay">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Change</span>
                  </div>
                </div>
              )}
            </div>
            {errors.imageFile && <span className="error-msg">{errors.imageFile}</span>}
          </div>

          {/* 8. Details */}
          <div className="form-group">
            <label className={isDark ? 'text-slate-300' : 'text-slate-700'}>Details</label>
            <textarea
              name="details"
              value={formData.details}
              onChange={handleInputChange}
              rows="3"
              placeholder="Enter product description..."
              className={isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' : ''}
            />
          </div>

        </form>
      </div>

      {/* ── Sticky footer ── */}
      <div className={`sidebar-footer border-t transition-all duration-300 ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-100'}`}>
        <button type="button" className={`btn-submit shadow-xl ${isDark ? 'shadow-brand/20' : ''}`} onClick={handleSubmit}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Product
        </button>
      </div>
    </div>
  );
};

export default SidebarForm;
