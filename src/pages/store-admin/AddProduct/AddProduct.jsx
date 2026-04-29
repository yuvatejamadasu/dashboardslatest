import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SidebarForm from './components/SidebarForm';
import ProductPreview from './components/ProductPreview';
import { useTheme } from "@/context/store-admin/ThemeContext";
import './styles/ProductPage.css';

const AddProduct = () => {
  const location = useLocation();
  const [products, setProducts] = useState(location.state?.products || []);
  const [productToEdit, setProductToEdit] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleAddProduct = (newProduct) => {
    setProducts(prev => {
      const existingIdx = prev.findIndex(p => 
        p.productName === newProduct.productName && 
        p.brand === newProduct.brand && 
        p.weight === newProduct.weight
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        const currentQty = parseInt(updated[existingIdx].itemsCount) || 0;
        const addedQty = parseInt(newProduct.itemsCount) || 0;
        updated[existingIdx] = {
          ...updated[existingIdx],
          itemsCount: String(currentQty + addedQty)
        };
        return updated;
      }
      return [...prev, newProduct];
    });
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const handleRemoveProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleFinalSubmit = () => {
    navigate('/store-dashboard/final-summary', { state: { products } });
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/store-dashboard/products');
  };

  return (
    <div className={`add-product-page p-6 min-h-full transition-all duration-300 ${
      isDark ? 'bg-[#1a1d21]' : 'bg-slate-50'
    }`}>
      <button
        type="button"
        onClick={handleGoBack}
        className={`mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          isDark
            ? 'bg-[#2c3136] border border-slate-700 text-white hover:bg-slate-700'
            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT — sticky form: stays visible while right column scrolls */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden sticky self-start transition-all duration-300 ${
          isDark ? 'bg-[#2c3136] border-slate-700/50 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <SidebarForm 
            onAddProduct={handleAddProduct} 
            productToEdit={productToEdit} 
            clearEditProduct={() => setProductToEdit(null)} 
          />
        </div>

        {/* RIGHT — capped height preview: scrolls internally */}
        <div className={`preview-panel-wrapper rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
          isDark ? 'bg-[#212529] border-slate-700/50 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <ProductPreview 
            products={products} 
            onFinalSubmit={handleFinalSubmit} 
            onEditProduct={handleEditProduct}
            onRemoveProduct={handleRemoveProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
