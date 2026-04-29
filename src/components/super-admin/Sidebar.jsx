import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  User, BarChart2,
  ChevronLeft, ChevronRight, Menu, Shield, UserPlus, Users, Trash2,
  Warehouse, Store, LayoutDashboard, Settings, LogOut, ChevronUp
} from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import primebasketLogoImg from '@/assets/revue-logo.jpeg';
import primeBasketIconImg from '@/assets/Prime-Basket-Logo.jpeg';
import { useTranslation } from 'react-i18next';
import avatarImg from '@/assets/avatar.png';
import { useProfile } from '@/context/super-admin/ProfileContext';

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

  const user = { role: 'super_admin' };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: t('nav.dashboard'), path: '/dashboard' },
    { icon: <BarChart2 size={20} />, label: t('nav.statistics'), path: '/statistics' },
    { icon: <Warehouse size={20} />, label: t('nav.hubs'), path: '/hubs', mt: true },
    { icon: <Store size={20} />, label: t('nav.stores'), path: '/stores' },
  ];

  const bottomItems = [
    { icon: <Trash2 size={20} />, label: 'Archive', path: '/trash' },
  ];

  const linkClass = ({ isActive }) => `
    flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-semibold
    ${isActive
      ? 'bg-[#1d5ba0] text-white shadow-md shadow-[#1d5ba0]/20'
      : (isDark
        ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
        : 'text-gray-700 hover:bg-[#1d5ba0] hover:text-white')}
    ${isMinimized ? 'justify-center' : ''}
  `;

  const displayName = profile?.fullName || 'Admin User';
  const displayRole = profile?.role || 'Super Administrator';

  return (
    <aside className={`sidebar fixed left-0 top-0 h-screen transition-all duration-300 z-50 border-r ${isMinimized ? 'w-20 collapsed' : 'w-64'
      } ${isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-200'
      } flex flex-col`}>
      {/* Sidebar Header */}
      <div className={`sidebar-header h-16 flex items-center justify-between ${isMinimized ? 'px-3' : 'px-4'}`}>
        <div className="sidebar-brand flex items-center gap-2.5 px-1" style={isMinimized ? { padding: '0', justifyContent: 'center', flex: 1 } : {}}>
          {isMinimized ? (
            <img
              src={primeBasketIconImg}
              alt="Prime Basket"
              style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px', display: 'block', margin: '0 auto' }}
            />
          ) : (
            <>
              <img
                src={primebasketLogoImg}
                alt="Prime Basket Logo"
                className="brand-logo h-14 w-auto"
                style={{ background: 'transparent' }}
              />
              <span className="brand-name" />
            </>
          )}
        </div>
        <button
          onClick={() => setMinimized(prev => !prev)}
          className={`menu-toggle p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
        >
          {isMinimized ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="px-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar pt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={(navData) => `${linkClass(navData)} ${item.mt ? 'mt-4' : ''}`}
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            {!isMinimized && (
              <span className="flex-1">{item.label}</span>
            )}
            {isMinimized && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}

        {bottomItems.length > 0 && <div className={`my-4 mx-2 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}></div>}

        {bottomItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={linkClass}
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            {!isMinimized && (
              <span className="flex-1">{item.label}</span>
            )}
            {isMinimized && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
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
                onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-[#1d5ba0]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#1d5ba0]'
                  }`}
              >
                <User size={16} />
                {!isMinimized && <span>{t('nav.profile')}</span>}
              </button>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/super-admins'); }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'text-slate-300 hover:bg-slate-700/50 hover:text-[#1d5ba0]' : 'text-slate-600 hover:bg-slate-50 hover:text-[#1d5ba0]'
                  }`}
              >
                <Shield size={16} />
                {!isMinimized && <span>Super Admin</span>}
              </button>
              <div className={`my-1 border-t ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}></div>
              <button
                onClick={() => { setShowProfileMenu(false); navigate('/logout'); }}
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
