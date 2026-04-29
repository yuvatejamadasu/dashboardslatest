import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useTheme } from '@/context/super-admin/ThemeContext';

const Layout = () => {
  const [isMinimized, setMinimized] = useState(false);
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${
      isDark ? 'bg-[#1a1d21] text-slate-100 dark' : 'bg-white text-slate-800'
    }`}>
      <Sidebar isMinimized={isMinimized} setMinimized={setMinimized} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isMinimized ? 'ml-20' : 'ml-64'}`}>
        <main className="p-8 flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Layout;
