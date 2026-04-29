import React from 'react';
import QuantityControl from './QuantityControl';

// Renders a single product card: image, name, quantity badge, and quantity control.
const ProductItem = ({ product, quantity, onIncrease, onDecrease }) => {
    const isSelected = quantity > 0;

    return (
        <div className="col-span-1">
            <div
                className={`h-full rounded-2xl transition-all duration-300 overflow-hidden bg-white dark:bg-slate-800 border-2 ${
                    isSelected ? 'border-brand shadow-lg shadow-brand/10' : 'border-slate-100 dark:border-slate-700 shadow-sm'
                }`}
            >
                {/* Product Image */}
                <div className="flex items-center justify-center bg-white h-40 p-4 relative">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-32 max-w-full object-contain"
                    />
                    {isSelected && (
                        <span className="absolute top-3 right-3 bg-brand text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-black shadow-lg animate-scale-in">
                            {quantity}
                        </span>
                    )}
                </div>

                {/* Product Info */}
                <div className="p-4 text-center">
                    <h6
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-4 line-clamp-2 h-8 leading-tight"
                        title={product.name}
                    >
                        {product.name}
                    </h6>

                    <QuantityControl
                        productId={product.id}
                        quantity={quantity}
                        onIncrease={onIncrease}
                        onDecrease={onDecrease}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductItem;
