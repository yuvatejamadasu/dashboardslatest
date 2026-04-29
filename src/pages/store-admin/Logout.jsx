import React from 'react';
import { LogOut, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/context/store-admin/ThemeContext';
import { useAuth } from '@/context/AuthContext';

const Logout = () => {
  const { isDark } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem('storeAdminAuth');
      sessionStorage.removeItem('isAuthenticated');
      navigate('/store-login', { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-3xl border p-8 transition-all duration-300 text-center ${
        isDark ? 'bg-[#2c3136] border-slate-700 shadow-2xl' : 'bg-white border-slate-200 shadow-xl'
      }`}>
        <div className={`w-20 h-20 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6`}>
          <LogOut size={40} />
        </div>
        
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>Logout Confirmation</h2>
        <p className={`text-sm mb-8 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Are you sure you want to exit your dashboard session? You will need to login again to access your data.
        </p>

        <div className="space-y-4">
          <button 
            onClick={handleLogout}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
          >
            Yes, Log Me Out
          </button>
          
          <button 
            onClick={() => navigate('/store-dashboard/dashboard')}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isDark ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ArrowLeft size={18} />
            Cancel and Return
          </button>
        </div>

        <div className={`mt-8 pt-6 border-t flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
          isDark ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'
        }`}>
          <ShieldAlert size={14} />
          Secure Logout Session
        </div>
      </div>
    </div>
  );
};

export default Logout;
