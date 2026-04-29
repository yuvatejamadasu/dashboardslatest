import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Star, Eye, X, LayoutGrid, List, MessageSquare, Package } from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';
import { useReviews } from '@/context/store-admin/ReviewsContext';

const StarRating = ({ rating, editable = false, onChange }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'} ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => editable && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

// View Detail Modal for a Product
const DetailModal = ({ productData, isDark, onClose }) => {
  if (!productData) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border p-6 relative flex flex-col max-h-[85vh] animate-scale-in ${
          isDark ? 'bg-[#2c3136] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
          <X size={18} />
        </button>
        <h3 className="text-xl font-black mb-2 pr-8">{productData.product}</h3>
        <div className="flex items-center gap-4 mb-6 text-sm">
          <div className="flex items-center gap-1">
            <StarRating rating={productData.averageRating} />
            <span className="font-bold ml-1">{productData.averageRating.toFixed(1)} Avg</span>
          </div>
          <span className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{productData.count} Customer Reviews</span>
        </div>
        
        <div className="overflow-y-auto pr-2 space-y-4 custom-scrollbar flex-1">
          {productData.reviews.map(review => (
            <div key={review.id} className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
               <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-xs uppercase shrink-0">
                     {review.name.charAt(0)}
                   </div>
                   <div>
                     <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{review.name}</h4>
                     <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{review.date}</span>
                   </div>
                 </div>
                 <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                   review.status === 'active' ? 'bg-brand/10 text-brand' : 'bg-slate-500/10 text-slate-500'
                 }`}>
                   {review.status === 'active' ? 'Active' : 'Disabled'}
                 </span>
               </div>
               <div className="ml-[52px]">
                 <StarRating rating={review.rating} />
                 <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                   {review.feedback || (review.rating >= 4 ? 'Great product, highly recommended! The quality exceeded my expectations.' : review.rating === 3 ? 'It was okay, nothing special but it gets the job done for the price.' : 'Disappointing quality. Not what I expected based on the description.')}
                 </p>
               </div>
            </div>
          ))}
        </div>
        
        <div className={`mt-6 pt-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Reviews = () => {
  const { isDark } = useTheme();
  const { reviews } = useReviews();
  const [searchTerm, setSearchTerm] = useState('');
  const [perPage, setPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('storeReviewsViewMode') || 'grid');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('storeReviewsViewMode', mode);
  };

  // Group reviews by product
  const groupedReviews = useMemo(() => {
    const map = {};
    reviews.forEach(review => {
      if (!map[review.product]) {
        map[review.product] = {
          id: review.product,
          product: review.product,
          reviews: [],
          totalRating: 0,
          count: 0
        };
      }
      map[review.product].reviews.push(review);
      map[review.product].totalRating += review.rating;
      map[review.product].count += 1;
    });
    return Object.values(map).map(item => ({
      ...item,
      averageRating: item.totalRating / item.count
    }));
  }, [reviews]);

  // Filter products by search term
  const filteredProducts = groupedReviews.filter((item) => {
    return searchTerm === '' || item.product.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + perPage);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1, 2, 3);
      if (currentPage > 4) pages.push('...');
      if (currentPage > 3 && currentPage < totalPages - 2) pages.push(currentPage);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages);
    }
    return [...new Set(pages)];
  };

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Detail Modal */}
      {detailProduct && <DetailModal productData={detailProduct} isDark={isDark} onClose={() => setDetailProduct(null)} />}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Product Reviews</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-brand'} text-xs font-semibold mt-1`}>
            Monitor aggregated customer feedback across your products.
          </p>
        </div>
      </div>

      <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Filter Bar */}
        <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'
              }`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-brand shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <option value={12}>Show 12</option>
              <option value={24}>Show 24</option>
              <option value={48}>Show 48</option>
            </select>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider w-12 text-center">
                    <input type="checkbox" className="rounded-sm accent-brand" />
                  </th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Product</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Avg Rating</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Total Reviews</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {paginatedProducts.map((item) => (
                  <tr key={item.id} className={`group/row transition-all duration-300 ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox" className="rounded-sm accent-brand" />
                    </td>
                    <td className={`px-4 py-4 text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-brand" />
                        {item.product}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating rating={item.averageRating} />
                        <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.averageRating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className={`px-4 py-4 text-xs font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.count} reviews
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setDetailProduct(item)}
                          className="bg-brand hover:bg-brand-hover text-white text-[11px] uppercase font-bold tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                        >
                          <Eye size={13} /> View Reviews
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedProducts.map((item) => (
              <div key={item.id} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <span className={`text-sm font-bold block leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.product}</span>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.count} Total Reviews</span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl mb-5 flex flex-col items-center justify-center border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h4 className={`text-3xl font-black mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.averageRating.toFixed(1)}</h4>
                  <StarRating rating={item.averageRating} />
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => setDetailProduct(item)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all bg-brand text-white hover:bg-brand-hover shadow-md"
                  >
                    <Eye size={14} className="mr-2" /> View All Reviews
                  </button>
                </div>
              </div>
            ))}
            {paginatedProducts.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No products found.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`flex items-center justify-start gap-2 px-6 py-4 border-t ${
            isDark ? 'border-slate-700/50' : 'border-slate-100'
          }`}>
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`dots-${index}`} className={`px-2 text-xs font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                    currentPage === page
                      ? 'bg-brand text-white shadow-sm'
                      : isDark
                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-brand-light hover:text-brand'
                  }`}
                >
                  {String(page).padStart(2, '0')}
                </button>
              )
            )}
            {currentPage < totalPages && (
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-brand-light hover:text-brand'
                }`}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;
