import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBypassOptions, BYPASS_ROUTE_MAP } from '@/utils/common/approvalChainUtils';

/**
 * BypassDropdown
 * 
 * A reusable "Create Account ▼" dropdown button rendered beside the
 * existing primary create button on each admin dashboard.
 *
 * Props:
 *   adminRole {string} — e.g. 'state', 'region', 'branch', 'hub', 'store'
 */
const BypassDropdown = ({ adminRole }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const options = getBypassOptions(adminRole);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Store admin has nothing to create below — disable
  if (options.length === 0) {
    return (
      <button
        disabled
        className="px-4 py-2 rounded-xl font-semibold bg-gray-200 text-gray-400 cursor-not-allowed flex items-center gap-2 text-sm"
        title="No lower levels available"
      >
        Create Account ▼
      </button>
    );
  }

  const handleSelect = (level) => {
    setOpen(false);
    
    // Hub Admin local redirection for Store creation
    if (adminRole === 'hub' && level === 'store') {
      navigate('/hub-dashboard/create-admin');
      return;
    }

    const route = BYPASS_ROUTE_MAP[level];
    if (route) navigate(route, { state: { creatorRole: adminRole } });
  };

  // Capitalize helper
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-[42px] min-w-[150px] px-4 rounded-xl font-bold bg-brand text-white hover:bg-brand-hover transition-all active:scale-95 flex items-center justify-center gap-2 text-sm shadow-lg shadow-brand/20"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M12 4v16m8-8H4" />
        </svg>
        Create Account
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in slide-in-from-top-2 duration-150"
          role="menu"
        >
          <div className="px-4 py-3 border-b border-slate-50 bg-slate-50/50">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Direct Account Creation
            </p>
          </div>
          <div className="py-1">
            {options.map((level) => (
              <button
                key={level}
                onClick={() => handleSelect(level)}
                className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-brand/5 hover:text-brand transition-colors flex items-center gap-3"
                role="menuitem"
              >
                <div className="w-2 h-2 rounded-full bg-brand/30" />
                {level === 'store' ? 'Store Admin Dashboard' : `${cap(level)} Account`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BypassDropdown;
