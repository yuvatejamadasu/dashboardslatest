import React, { useState } from 'react';
import { UserPlus, User, Mail, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { superAdminService, validateKenyaMobile } from '@/services/super-admin/superAdminService';

const CreateSuperAdmin = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'Super Admin',
    status: 'Active',
    password: Math.random().toString(36).slice(-8),
    needsPasswordChange: true
  });
  
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [superAdminCount, setSuperAdminCount] = useState(0);

  React.useEffect(() => {
    const fetchCount = async () => {
      const admins = await superAdminService.getSuperAdmins();
      setSuperAdminCount(admins.length);
    };
    fetchCount();
  }, []);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'mobile') {
      value = value.replace(/\D/g, ''); // restrict to digits only
      if (value.length > 9) value = value.substring(0, 9);
      
      if (value.length > 0 && value.length < 9) {
        setErrorMsg('Enter valid mobile number');
      } else {
        setErrorMsg('');
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (superAdminCount >= 3) {
      setErrorMsg('Maximum limit of 3 Super Admins reached. Cannot create more.');
      return;
    }
    
    if (!validateKenyaMobile(formData.mobile)) {
      setErrorMsg(formData.mobile.length < 9 ? 'Enter valid mobile number' : 'Kenya mobile number must be exactly 9 digits.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      // Duplicate check
      const exists = await superAdminService.checkEmailExists(formData.email);
      if (exists) {
        setErrorMsg('User already exists with this email address.');
        setIsSubmitting(false);
        return;
      }

      await superAdminService.createSuperAdmin({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        status: formData.status,
        password: formData.password,
        needsPasswordChange: formData.needsPasswordChange
      });
      setSuccessMsg('Super Admin successfully created!');
      setTimeout(() => {
        navigate('/super-admins');
      }, 1500);
    } catch (error) {
      setErrorMsg(error.message || 'Failed to create Super Admin');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create Super Admin</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Add a new super administrator with full system access.</p>
        </div>
        <button 
          onClick={() => navigate('/super-admins')}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
            isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Back to List
        </button>
      </div>

      {successMsg && (
        <div className="p-4 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 animate-fade-in">
          <CheckCircle2 size={24} />
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-600 dark:text-rose-400 animate-fade-in">
          <AlertCircle size={24} />
          <span className="font-bold">{errorMsg}</span>
        </div>
      )}

      <div className={`p-8 rounded-2xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <Shield size={24} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Super Admin Details</h3>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fill out the required information to create a new root account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Name */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`} 
                  placeholder="e.g. Master Admin"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`} 
                  placeholder="superadmin@primebasket.com"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Mobile Number</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 flex items-center gap-2">
                  <Shield size={18} />
                  <span className={`text-sm font-bold border-r pr-2 ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-500 border-slate-200'}`}>+254</span>
                </div>
                <input 
                  type="tel" 
                  name="mobile"
                  required
                  value={formData.mobile}
                  onChange={handleChange}
                  className={`w-full pl-20 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                  }`} 
                  placeholder="+254 7XX XXXXXX"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Enter 9 digits without country code or leading 0</p>
            </div>

            {/* Role (Read-only for visual consistency) */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Role</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Shield size={18} />
                </div>
                <input 
                  type="text" 
                  readOnly 
                  value="Super Admin"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border opacity-70 cursor-not-allowed ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, password: Math.random().toString(36).slice(-8) }))}
                  className="text-xs font-bold text-brand hover:underline"
                >
                  Regenerate
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-colors font-mono ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`} 
                />
              </div>
            </div>


            {/* Status */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Initial Status</label>
              <div className="flex gap-4 h-[50px]">
                <label className={`flex-1 rounded-xl border cursor-pointer flex items-center justify-center gap-3 transition-all ${
                  formData.status === 'Active' 
                    ? 'border-brand bg-brand/10 text-brand font-bold' 
                    : (isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500')
                }`}>
                  <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={handleChange} className="hidden" />
                  Active
                </label>
                <label className={`flex-1 rounded-xl border cursor-pointer flex items-center justify-center gap-3 transition-all ${
                  formData.status === 'Inactive' 
                    ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold' 
                    : (isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-500')
                }`}>
                  <input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={handleChange} className="hidden" />
                  Inactive
                </label>
              </div>
            </div>

            {/* Force Password Change */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  name="needsPasswordChange"
                  checked={formData.needsPasswordChange}
                  onChange={(e) => setFormData(prev => ({ ...prev, needsPasswordChange: e.target.checked }))}
                  className="w-5 h-5 rounded-md border-slate-300 text-brand focus:ring-brand"
                />
                <span className={`text-sm font-medium ${isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-600 group-hover:text-slate-900'}`}>
                  Force user to change password on first login
                </span>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting || superAdminCount >= 3}
              className={`bg-brand hover:bg-brand-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand/30 transition-all active:scale-95 flex items-center gap-2 ${isSubmitting || superAdminCount >= 3 ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting && <Loader2 size={18} className="animate-spin" />}
              {superAdminCount >= 3 ? 'Limit Reached (3)' : (isSubmitting ? 'Registering...' : 'Register Super Admin')}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CreateSuperAdmin;
