import React from 'react';
import ProductItem from './ProductItem';
import { Box } from 'lucide-react';

// Renders the product grid for the current page.
const ProductList = ({ products, cart, onIncrease, onDecrease }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="bg-slate-200 dark:bg-slate-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Box size={40} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No products found</h3>
                <p className="text-sm text-slate-500 dark:text-slate-401">We couldn't find any products in this category.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <ProductItem
                    key={product.id}
                    product={product}
                    quantity={cart[product.id] || 0}
                    onIncrease={onIncrease}
                    onDecrease={onDecrease}
                />
            ))}
        </div>
    );
};

export default ProductList;
