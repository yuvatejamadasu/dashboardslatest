import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, ShoppingCart, Users,
  CreditCard, User, Star, Award, BarChart2,
  ChevronLeft, ChevronRight, Menu, Briefcase, Store, LogOut, ChevronUp
} from 'lucide-react';
import { useTheme } from "@/context/hub-admin/ThemeContext";
import { useProfile } from '@/context/hub-admin/ProfileContext';
import logoImg from '@/assets/logo.png';
import primebasketLogoImg from '@/assets/revue-logo.jpeg';
import primeBasketIconImg from '@/assets/Prime-Basket-Logo.jpeg';
import { useTranslation } from 'react-i18next';
import avatarImg from '@/assets/avatar.png';

// navItems exported for search - uses English labels as fallback
export const navItems = [
  { icon: <Home size={20} />, label: 'Dashboard', path: '/hub-dashboard/dashboard' },
  { icon: <Store size={20} />, label: 'Stores', path: '/hub-dashboard/stores' },
  { icon: <Users size={20} />, label: 'Delivery Partners', path: '/hub-dashboard/delivery-partners' },
  { icon: <Briefcase size={20} />, label: 'Store Employees', path: '/hub-dashboard/employees' },
  { icon: <Users size={20} />, label: 'Delivery Personnel', path: '/hub-dashboard/delivery-personnel' },
  { icon: <ShoppingBag size={20} />, label: 'Products', path: '/hub-dashboard/products' },
  { icon: <Award size={20} />, label: 'Brands', path: '/hub-dashboard/brands' },
  { icon: <ShoppingCart size={20} />, label: 'Inventory Requests', path: '/hub-dashboard/inventory-requests' },
  { icon: <ShoppingCart size={20} />, label: 'Returns', path: '/hub-dashboard/returns' },
  { icon: <Star size={20} />, label: 'Damaged Stock', path: '/hub-dashboard/damaged-stock' },
  // { icon: <ShoppingCart size={20} />, label: 'Orders', path: '/hub-dashboard/orders' },
  { icon: <ShoppingCart size={20} />, label: 'Out of Stock', path: '/hub-dashboard/out-of-stock' },
  { icon: <CreditCard size={20} />, label: 'Transactions', path: '/hub-dashboard/transactions' },
];

const Sidebar = ({ isMinimized, setMinimized }) => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const translatedNavItems = [
    { icon: <Home size={20} />, label: t('nav.dashboard'), path: '/hub-dashboard/dashboard' },
    { icon: <Store size={20} />, label: t('nav.stores'), path: '/hub-dashboard/stores' },
    { icon: <ShoppingBag size={20} />, label: t('nav.products'), path: '/hub-dashboard/products' },
    // { icon: <Users size={20} />, label: t('nav.delivery_partners'), path: '/hub-dashboard/delivery-partners' },
    { icon: <Briefcase size={20} />, label: t('Hub Employees'), path: '/hub-dashboard/employees' },
    // { icon: <Users size={20} />, label: t('nav.delivery_personnel'), path: '/hub-dashboard/delivery-personnel' },
    { icon: <Award size={20} />, label: t('nav.brands') || 'Brands', path: '/hub-dashboard/brands' },
    { icon: <ShoppingCart size={20} />, label: t('nav.product_requests'), path: '/hub-dashboard/inventory-requests' },
    // { icon: <ShoppingCart size={20} />, label: t('nav.returns'), path: '/hub-dashboard/returns' },
    // { icon: <Star size={20} />, label: t('nav.damaged_stock'), path: '/hub-dashboard/damaged-stock' },
    // { icon: <ShoppingCart size={20} />, label: t('nav.orders'), path: '/hub-dashboard/orders' },
    // { icon: <ShoppingCart size={20} />, label: t('nav.out_of_stock'), path: '/hub-dashboard/out-of-stock' },
    { icon: <CreditCard size={20} />, label: t('nav.transactions'), path: '/hub-dashboard/transactions' },
  ];

  const linkClass = ({ isActive }) => `
    flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
    ${isActive
      ? 'bg-brand text-white shadow-lg shadow-brand-light'
      : (isDark
        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
        : 'text-slate-500 hover:bg-brand-light hover:text-brand')}
    ${isMinimized ? 'justify-center' : ''}
  `;

  const displayName = profile?.fullName || 'Admin User';
  const displayRole = profile?.role || 'Hub Administrator';

  return (
    <aside className={`sidebar fixed left-0 top-0 h-screen transition-all duration-300 z-50 border-r ${isMinimized ? 'w-20 collapsed' : 'w-64'
      } ${isDark ? 'bg-[#1a1d21] border-slate-700/50 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'} flex flex-col`}>
      {/* Sidebar Header */}
      <div className={`sidebar-header h-20 ${isMinimized ? 'px-2' : 'px-2'}`}>
        <Link to="/hub-dashboard/dashboard" className="sidebar-brand" style={isMinimized ? { padding: '0', justifyContent: 'center', flex: 1 } : {}}>
          {isMinimized ? (
            <img
              src={primeBasketIconImg}
              alt="Prime Basket"
              style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
            />
          ) : (
            <img src={primebasketLogoImg} alt="Prime Basket Logo" className="brand-logo" />
          )}
        </Link>
        <button
          onClick={() => setMinimized(prev => !prev)}
          className={`menu-toggle p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
        >
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
        {translatedNavItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/hub-dashboard/products' || item.path === '/hub-dashboard/brands'}
            className={linkClass}
          >
            <span className={`transition-transform duration-200 ${!isMinimized ? 'group-hover:scale-110' : ''}`}>
              {item.icon}
            </span>
            {!isMinimized && (
              <span className="flex-1 font-bold text-sm">{item.label}</span>
            )}
            {isMinimized && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

      </nav>

      {/* Profile Summary (bottom of sidebar) */}
      <div className="relative mt-auto border-t" ref={profileRef} style={{ borderColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#e2e8f0' }}>
        {showProfileMenu && (
          <div className={`absolute bottom-full left-0 w-full mb-2 px-2 z-50`}>
            <div className={`rounded-xl shadow-2xl border py-2 overflow-hidden ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/hub-dashboard/profile'); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-brand' : 'text-slate-600 hover:bg-slate-50 hover:text-brand'
                  }`}
              >
                <User size={16} />
                {!isMinimized && <span>{t('nav.profile')}</span>}
              </button>
              <div className={`my-1 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}></div>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/hub-dashboard/logout'); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-rose-500 transition-colors ${isDark ? 'hover:bg-rose-500/10' : 'hover:bg-rose-50'
                  }`}
              >
                <LogOut size={16} />
                {!isMinimized && <span>{t('nav.logout')}</span>}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`w-full flex items-center gap-3 ${isMinimized ? 'justify-center' : 'px-4'} py-3 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
            }`}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500/20 transition-all shadow-sm shrink-0">
            <img
              src={profile?.profileImage || avatarImg}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {!isMinimized && (
            <div className="min-w-0 flex-1 text-left">
              <p className={`text-xs font-bold leading-none ${isDark ? 'text-white' : 'text-slate-800'}`}>{displayName}</p>
              <p className="text-[10px] text-slate-500 mt-1 truncate">{displayRole}</p>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
