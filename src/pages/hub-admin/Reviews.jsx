import React, { useState } from 'react';
import { Search, ChevronRight, Star, Eye, X, LayoutGrid, List, MessageSquare } from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import { useReviews } from '@/context/hub-admin/ReviewsContext';

const StarRating = ({ rating, editable = false, onChange }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 fill-slate-200'} ${editable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => editable && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

// View Detail Modal
const DetailModal = ({ review, isDark, onClose }) => {
  if (!review) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border p-6 relative animate-scale-in ${
          isDark ? 'bg-[#2c3136] border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}>
          <X size={18} />
        </button>
        <h3 className="text-lg font-black mb-5 flex items-center gap-2">
          <Eye size={20} className="text-brand" /> Review Detail
        </h3>
        <div className="space-y-4">
          {[
            ['Review ID', `#${review.id}`],
            ['Product', review.product],
            ['Reviewer', review.name],
          ].map(([label, value]) => (
            <React.Fragment key={label}>
              <div className="flex justify-between items-center">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
                <span className={`text-sm font-bold ${label === 'Reviewer' ? 'text-brand' : ''}`}>{value}</span>
              </div>
              <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
            </React.Fragment>
          ))}
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Rating</span>
            <StarRating rating={review.rating} />
          </div>
          <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Date</span>
            <span className="text-sm font-bold">{review.date}</span>
          </div>
          <div className={`border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
          <div className="flex justify-between items-center">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Status</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
              review.status === 'active' ? 'bg-brand/10 text-brand' : 'bg-slate-500/10 text-slate-500'
            }`}>{review.status === 'active' ? 'Active' : 'Disabled'}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all active:scale-95 shadow-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
};


const Reviews = () => {
  const { isDark } = useTheme();
  const { reviews } = useReviews();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchByName, setSearchByName] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAllFilter, setShowAllFilter] = useState('showall');
  const [perPage, setPerPage] = useState(13);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailReview, setDetailReview] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('hubReviewsViewMode') || 'list');

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('hubReviewsViewMode', mode);
  };

  // Filter reviews
  const filteredReviews = reviews.filter((review) => {
    const matchSearch = searchTerm === '' || review.product.toLowerCase().includes(searchTerm.toLowerCase()) || review.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchName = searchByName === '' || review.name.toLowerCase().includes(searchByName.toLowerCase()) || review.product.toLowerCase().includes(searchByName.toLowerCase());
    let matchStatus = true;
    if (statusFilter === '5star') matchStatus = review.rating === 5;
    else if (statusFilter === '4star') matchStatus = review.rating === 4;
    else if (statusFilter === '3star') matchStatus = review.rating === 3;
    else if (statusFilter === '2star') matchStatus = review.rating === 2;
    else if (statusFilter === '1star') matchStatus = review.rating === 1;
    let matchShowAll = true;
    if (showAllFilter === 'active') matchShowAll = review.status === 'active';
    else if (showAllFilter === 'disabled') matchShowAll = review.status === 'disabled';
    return matchSearch && matchName && matchStatus && matchShowAll;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + perPage);

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
      {detailReview && <DetailModal review={detailReview} isDark={isDark} onClose={() => setDetailReview(null)} />}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Reviews</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-brand'} text-xs font-semibold mt-1`}>
            Monitor store product reviews and feedback.
          </p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name"
            value={searchByName}
            onChange={(e) => { setSearchByName(e.target.value); setCurrentPage(1); }}
            className={`border rounded-lg py-2.5 pl-4 pr-10 text-xs font-bold outline-none transition-all w-56 ${
              isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-white border-slate-200 text-slate-800 focus:border-brand shadow-sm'
            }`}
          />
          <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
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
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-brand'
              }`}
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
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
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <option value="all">Status</option>
              <option value="5star">5 Stars</option>
              <option value="4star">4 Stars</option>
              <option value="3star">3 Stars</option>
              <option value="2star">2 Stars</option>
              <option value="1star">1 Star</option>
            </select>
            <select
              value={showAllFilter}
              onChange={(e) => { setShowAllFilter(e.target.value); setCurrentPage(1); }}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <option value="showall">Show all</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className={`border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none transition-all ${
                isDark ? 'bg-[#212529] border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <option value={13}>Show 20</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 30</option>
              <option value={30}>Show 50</option>
            </select>
          </div>
        </div>
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-slate-800/30' : 'bg-slate-50/50 text-slate-500'}>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-wider w-12 text-center">
                    <input type="checkbox" className="rounded-sm accent-blue-600" />
                  </th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>#ID</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Product</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Name</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Rating</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Date</th>
                  <th className={`px-4 py-4 text-[11px] font-extrabold uppercase tracking-wider text-right pr-8 ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>Action</th>
                </tr>
              </thead>
              <tbody className={isDark ? 'divide-y divide-slate-700/50' : 'divide-y divide-slate-100'}>
                {paginatedReviews.map((review) => (
                  <tr key={review.id} className={`group/row transition-all duration-300 ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-center">
                      <input type="checkbox" className="rounded-sm accent-blue-600" />
                    </td>
                    <td className={`px-4 py-4 text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {review.id}
                    </td>
                    <td className={`px-4 py-4 text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                      {review.product}
                    </td>
                    <td className={`px-4 py-4 text-xs font-bold ${isDark ? 'text-brand-lightdark' : 'text-brand'}`}>
                      {review.name}
                    </td>
                    <td className="px-4 py-4">
                      <StarRating rating={review.rating} />
                    </td>
                    <td className={`px-4 py-4 text-[11px] font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      {review.date}
                    </td>
                    <td className="px-4 py-4 text-right pr-6">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setDetailReview(review)}
                          className="bg-brand hover:bg-brand-hover text-white text-[11px] uppercase font-bold tracking-wider px-4 py-2 rounded-lg transition-all active:scale-95 shadow-sm flex items-center gap-1.5"
                        >
                          <Eye size={13} /> Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedReviews.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No reviews found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedReviews.map((review) => (
              <div key={review.id} className={`flex flex-col p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-light dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-xs uppercase">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <span className={`text-sm font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>{review.name}</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{review.date}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                    review.status === 'active' ? 'bg-brand/10 text-brand' : 'bg-slate-500/10 text-slate-500'
                  }`}>
                    {review.status === 'active' ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="mb-4">
                  <StarRating rating={review.rating} />
                </div>

                <div className={`p-3 rounded-xl mb-5 flex-1 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Product</p>
                  <p className={`text-sm font-bold flex items-start gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    <MessageSquare size={16} className={`shrink-0 mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    {review.product}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => setDetailReview(review)}
                    className="w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-black transition-all bg-brand text-white hover:bg-brand-hover shadow-md"
                  >
                    <Eye size={14} className="mr-2" /> View Details
                  </button>
                </div>
              </div>
            ))}
            {paginatedReviews.length === 0 && (
              <div className="col-span-full py-16 text-center">
                <p className={`text-sm font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No reviews found.</p>
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
