import React from 'react';
import { useTheme } from '@/context/super-admin/ThemeContext';

const Footer = () => {
  const { isDark } = useTheme();
  return (
    <footer className={`mt-auto py-6 px-8 border-t flex items-center justify-between transition-colors duration-300 ${
      isDark ? 'bg-[#1a1d21] border-slate-700/50' : 'bg-white border-slate-200'
    }`}>
      <p className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        &copy; {new Date().getFullYear()} Prime-Basket Admin Dashboard.
      </p>
    </footer>
  );
};

export default Footer;
