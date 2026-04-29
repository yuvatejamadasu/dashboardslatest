import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-indigo-950 text-indigo-100 flex flex-col fixed left-0 top-0 z-20 shadow-2xl">
      <div className="p-6 border-b border-indigo-900/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-950 font-bold text-xl shadow-lg">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-white">AdminPanel</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive 
              ? "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium bg-indigo-600 text-white shadow-lg shadow-indigo-900/50" 
              : "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-indigo-300 hover:bg-indigo-900 hover:text-white"
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NavLink>
        
        <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-indigo-300 hover:bg-indigo-900 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-indigo-900/50">
        <div className="flex items-center gap-3 p-3 bg-indigo-900/30 rounded-xl">
          <div className="w-10 h-10 bg-indigo-800 rounded-full flex items-center justify-center text-indigo-300">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Super Admin</p>
            <p className="text-xs text-indigo-400 truncate">admin@dashboard.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
