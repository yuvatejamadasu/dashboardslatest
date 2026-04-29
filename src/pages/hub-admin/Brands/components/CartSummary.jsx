import React from 'react';
import { ShoppingCart, ArrowRight } from 'lucide-react';

// Fixed bottom checkout bar — shown only when at least one item is in the cart.
// Displays total item count and a checkout button.
const CartSummary = ({ cart }) => {
    const totalItems = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

    if (totalItems === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 lg:left-64 right-0 z-[1050] bg-brand text-white p-4 px-8 flex items-center justify-between shadow-[0_-4px_20px_rgba(37,99,235,0.25)] animate-slide-up">
            {/* Left: item count */}
            <div className="flex items-center gap-4">
                <div className="bg-white text-brand rounded-full w-10 h-10 flex items-center justify-center font-black text-lg shadow-inner">
                    {totalItems}
                </div>
                <div>
                    <div className="font-bold text-lg leading-tight">
                        {totalItems} Item{totalItems > 1 ? 's' : ''} in cart
                    </div>
                </div>
            </div>

            {/* Right: checkout button */}
            <button
                className="bg-white text-brand hover:bg-slate-100 flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg group"
                onClick={() => alert(`Proceeding to checkout with ${totalItems} item(s)`)}
            >
                <ShoppingCart size={20} className="group-hover:rotate-12 transition-transform" />
                Checkout
                <ArrowRight size={18} />
            </button>
        </div>
    );
};

export default CartSummary;
