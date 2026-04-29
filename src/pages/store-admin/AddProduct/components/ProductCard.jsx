import React, { useState } from 'react';
import { useTheme } from "@/context/store-admin/ThemeContext";
import "../styles/ProductCard.css";

const ProductCard = ({ product, onEdit, onRemove }) => {
  const { isDark } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const {
    category,
    productName,
    brand,
    weight,       // free-text value exactly as entered
    weightType,
    sellingPrice,
    mrp,
    itemsCount,
    imageUrl,
    details,
  } = product;

  const hasDiscount = sellingPrice && mrp && Number(sellingPrice) < Number(mrp);
  const discountPct = hasDiscount
    ? Math.round(((Number(mrp) - Number(sellingPrice)) / Number(mrp)) * 100)
    : 0;

  const unitClass = weightType === 'liquid' ? 'liquid' : weightType === 'pack' ? 'pack' : 'weight';

  return (
    <div className={`product-card transition-all duration-300 border ${isDark ? 'bg-slate-800 border-slate-700/50 shadow-none' : 'bg-white border-slate-100 shadow-sm'}`}>

      {/* Image */}
      <div className="card-image-wrapper">
        <img src={imageUrl} alt={productName} className="card-image" />
        <div className="card-overlay-badges">
          <span className="badge-category">{category}</span>
          {hasDiscount && <span className="badge-discount">{discountPct}% OFF</span>}
        </div>
        {/* Weight tag — exact user-entered value */}
        <div className={`weight-tag weight-tag--${unitClass}`}>{weight}</div>
      </div>

      {/* Body */}
      <div className="card-body">
        <div>
          {brand && <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{brand}</div>}
          <h3 className={`card-title ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{productName}</h3>
        </div>

        <div className="card-pricing">
          <span className={`price-actual ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>KES {Number(sellingPrice).toFixed(2)}</span>
          {hasDiscount && (
            <>
              <span className={`price-mrp ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>KES {Number(mrp).toFixed(2)}</span>
              <span className={`price-savings ${isDark ? 'text-emerald-500/80 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'}`}>{discountPct}% off</span>
            </>
          )}
        </div>

        <div className="card-meta-grid">
          <div className={`meta-chip ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`meta-label ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Qty / Weight</span>
            <span className={`meta-value ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{weight}</span>
          </div>
          <div className={`meta-chip ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`meta-label ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Stock</span>
            <span className={`meta-value ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{itemsCount ? `${itemsCount} pcs` : '—'}</span>
          </div>
        </div>

        {details && (
          <div className="mt-1">
            {!showDetails ? (
              <button 
                onClick={() => setShowDetails(true)}
                className={`text-xs font-bold underline ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}
              >
                More Details
              </button>
            ) : (
              <div className="animate-fade-in">
                <p className={`card-details ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{details}</p>
                <button 
                  onClick={() => setShowDetails(false)}
                  className="text-[10px] font-bold underline mt-1 text-rose-500"
                >
                  Hide
                </button>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className={`mt-3 flex gap-2 pt-3 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <button 
            onClick={onEdit} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isDark ? 'bg-slate-700/50 hover:bg-brand text-slate-300 hover:text-white' : 'bg-slate-50 hover:bg-brand/10 text-slate-600 hover:text-brand'
            }`}
          >
            Edit
          </button>
          <button 
            onClick={onRemove} 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              isDark ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400' : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
            }`}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
