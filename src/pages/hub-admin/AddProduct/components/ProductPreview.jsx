import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import "../styles/ProductPreview.css";

const ProductPreview = ({ products, onFinalSubmit, onEditProduct, onRemoveProduct }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleFinalSubmit = () => {
    if (products.length === 0) {
      alert('Please add at least one product before submitting.');
      return;
    }
    onFinalSubmit(); // notify parent (optional)
    navigate('/hub-dashboard/final-summary', { state: { products } });
  };

  return (
    <div className={`preview-container transition-all duration-300 ${isDark ? 'preview-dark bg-[#212529] text-white' : 'bg-white'}`}>
      {/* Top bar */}
      <div className={`preview-header border-b transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
        <div className="header-left">
          <h2 className={isDark ? 'text-white' : 'text-slate-800'}>Product Preview</h2>
          <span className={`product-count-badge ${isDark ? 'bg-brand/20 text-brand-lightdark' : 'bg-brand text-white'}`}>
            {products.length} {products.length === 1 ? 'Product' : 'Products'}
          </span>
        </div>
        <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
          Products added will appear below. Click <strong className={isDark ? 'text-brand-lightdark' : ''}>Final Submit</strong> when ready.
        </p>
      </div>

      {/* Cards area */}
      <div className="preview-content">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className={`empty-icon ${isDark ? 'text-slate-700 bg-slate-800/40' : 'text-slate-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 className={isDark ? 'text-slate-300' : 'text-slate-700'}>No products yet</h3>
            <p className={isDark ? 'text-slate-500' : 'text-slate-400'}>Fill in the form on the left and click <em>Add Product</em> to see cards here.</p>
          </div>
        ) : (
          <div className="cards-grid">
            {products.map((p, i) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                index={i} 
                onEdit={() => onEditProduct(p)} 
                onRemove={() => onRemoveProduct(p.id)} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className={`preview-footer border-t transition-all duration-300 ${isDark ? 'bg-slate-800/80 border-slate-700 shadow-none' : 'bg-white border-slate-100 shadow-xl'}`}>
        <div className="footer-inner">
          <span className={`footer-summary ${isDark ? 'text-slate-400 font-bold' : 'text-slate-500'}`}>
            {products.length > 0
              ? `${products.length} product${products.length > 1 ? 's' : ''} ready to submit`
              : 'No products added yet'}
          </span>
          <button
            className="btn-final-submit"
            onClick={handleFinalSubmit}
            disabled={products.length === 0}
          >
            Final Submit
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
