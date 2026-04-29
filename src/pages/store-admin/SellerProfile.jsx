import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Star, ShoppingBag, Banknote, 
  Users, Calendar, Mail, Globe, Shield, ExternalLink,
  Award, TrendingUp, Package, Store, BarChart2
} from 'lucide-react';
import { useTheme } from '@/context/store-admin/ThemeContext';
import useFetch from '@/hooks/store-admin/useFetch';
import DataState from '@/components/store-admin/DataState';
import { API } from '@/config/store-admin/api';

const SellerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: sellersData, loading, error } = useFetch(API.SELLERS, '/data/sellers.json');
  const allSellers = Array.isArray(sellersData) ? sellersData : (sellersData?.sellers ?? sellersData?.Sellers ?? []);
  const seller = allSellers.find(s => String(s.id) === String(id));

  if (!loading && !seller && !error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Users size={64} className="text-slate-300" />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Seller Not Found</h3>
        <button 
          onClick={() => navigate('/sellers')}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-brand text-white font-bold transition-all hover:bg-brand-hover"
        >
          <ArrowLeft size={18} /> Back to Sellers
        </button>
      </div>
    );
  }

  const cardClass = `p-6 rounded-xl border transition-all duration-300 ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`;

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-6 pb-8 animate-fade-in">
        {/* Navigation & Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/sellers')}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Seller Profile</h2>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Detailed overview of vendor performance and information</p>
          </div>
        </div>

        {/* Hero Section */}
        <div className={`${cardClass} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Store size={120} />
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className={`w-32 h-32 rounded-2xl ${seller?.color} flex items-center justify-center text-white text-4xl font-black shadow-2xl ring-4 ring-white/10 shrink-0`}>
              {seller?.initials}
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{seller?.name}</h3>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Verified Partner</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <MapPin size={16} className="text-brand" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{seller?.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{seller?.rating} Rating</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Package size={16} className="text-violet-500" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{seller?.products} Products</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail size={16} className="text-rose-500" />
                  <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>contact@{seller?.name.toLowerCase().replace(/ /g, '')}.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button 
                  onClick={() => navigate(`/sellers/${seller?.id}/analytics`)}
                  className="px-6 py-2.5 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-bold transition-all shadow-lg shadow-brand-light active:scale-95 flex items-center gap-2"
                >
                  <BarChart2 size={18} /> Show Analytics
                </button>
                <button className={`px-6 py-2.5 rounded-lg border font-bold text-sm transition-all flex items-center gap-2 active:scale-95 ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  Contact Vendor
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Revenue', value: seller?.revenue, icon: <Banknote size={20} />, color: 'text-brand', bg: 'bg-brand/10' },
            { label: 'Avg. Monthly Sales', value: 'KES 8,420', icon: <TrendingUp size={20} />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Active Customers', value: '1,240', icon: <Users size={20} />, color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { label: 'Awards Won', value: '12', icon: <Award size={20} />, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          ].map(stat => (
            <div key={stat.label} className={cardClass}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <TrendingUp size={16} className="text-emerald-500 opacity-50" />
              </div>
              <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{stat.value}</p>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* About Section */}
          <div className={`${cardClass} lg:col-span-2 space-y-6`}>
            <div className="flex items-center justify-between">
              <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>About the Vendor</h4>
              <Shield size={18} className="text-brand opacity-50" />
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Started in 2018, {seller?.name} has been a cornerstone of quality in the {seller?.category} market. Located in {seller?.location}, they have consistently maintained a high rating of {seller?.rating} by focusing on customer satisfaction and quality products. They currently manage a diverse catalog of {seller?.products} products through our platform.
            </p>
            
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-700/50">
              <div className="space-y-2">
                <h5 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Registered On</h5>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Calendar size={14} className="text-brand" />
                  <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>January 15th, 2021</span>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Primary Category</h5>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <ShoppingBag size={14} className="text-brand" />
                  <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>{seller?.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links / Metadata */}
          <div className={`${cardClass} space-y-6`}>
            <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>Business Identity</h4>
            <div className="space-y-4">
              {[
                { label: 'E-commerce URL', value: `hub.admin/${seller?.name.toLowerCase().replace(/ /g, '-')}`, icon: <Globe size={16} /> },
                { label: 'Tax ID', value: 'TX-8829-4410', icon: <Shield size={16} /> },
                { label: 'Store Analytics', value: 'View Performance', icon: <ExternalLink size={16} />, link: true },
              ].map(item => (
                <div key={item.label} className="space-y-1.5">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.label}</p>
                  <div className={`flex items-center gap-2 text-xs font-bold ${item.link ? 'text-brand cursor-pointer hover:underline' : (isDark ? 'text-slate-300' : 'text-slate-600')}`}>
                    {item.icon}
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div className={`pt-6 border-t ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <button className="w-full py-2.5 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-black hover:bg-rose-500 hover:text-white transition-all">
                Suspend Vendor Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DataState>
  );
};

export default SellerProfile;

