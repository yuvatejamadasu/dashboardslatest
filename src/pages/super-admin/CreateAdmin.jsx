import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Shield, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { superAdminService, validateKenyaMobile } from '@/services/super-admin/superAdminService';
import Button from '@/components/super-admin/ui/Button';

const CreateAdmin = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    entityType: 'Hub',
    entityId: '',
    password: Math.random().toString(36).slice(-8)
  });
  
  const [hubs, setHubs] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedHubForStore, setSelectedHubForStore] = useState('all');
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubsData, storesData] = await Promise.all([
          superAdminService.getHubs(),
          superAdminService.getStores()
        ]);
        setHubs(hubsData);
        setStores(storesData);
        if (hubsData.length > 0) {
          setFormData(prev => ({ ...prev, entityId: hubsData[0].id }));
        }
      } catch (err) {
        setPopup({ message: 'Failed to load hubs and stores', type: 'error' });
      }
    };
    fetchData();
  }, []);

  // Auto-dismiss popup after 3 seconds
  useEffect(() => {
    if (popup.message) {
      const timer = setTimeout(() => {
        setPopup({ message: '', type: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [popup.message]);

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === 'mobile') {
      value = value.replace(/\D/g, ''); // restrict to digits only
      if (value.length > 9) value = value.substring(0, 9);
      
      if (value.length > 0 && value.length < 9) {
        setPopup({ message: 'Enter valid mobile number', type: 'error' });
      } else {
        setPopup({ message: '', type: '' });
      }
    }
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Auto-select first item when entity type changes
      if (name === 'entityType') {
        if (value === 'Hub' && hubs.length > 0) {
          updated.entityId = hubs[0].id;
        } else if (value === 'Store' && stores.length > 0) {
          updated.entityId = stores[0].id;
        } else {
          updated.entityId = '';
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.mobile.trim() || !formData.entityId) {
      setPopup({ message: 'Please fill all required fields', type: 'error' });
      return;
    }

    if (!validateKenyaMobile(formData.mobile)) {
      setPopup({ message: formData.mobile.length < 9 ? 'Enter valid mobile number' : 'Kenya mobile number must be exactly 9 digits.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      // Email duplication check
      const exists = await superAdminService.checkEmailExists(formData.email);
      if (exists) {
        setPopup({ message: 'User already exists with this email address.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      await superAdminService.createAdmin({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        entityType: formData.entityType,
        entityId: formData.entityId,
        password: formData.password
      });
      
      setPopup({ message: 'Admin created successfully as Pending', type: 'success' });
      setFormData({
        name: '',
        email: '',
        mobile: '',
        entityType: 'Hub',
        entityId: hubs.length > 0 ? hubs[0].id : '',
        password: Math.random().toString(36).slice(-8)
      });
    } catch (error) {
      setPopup({ message: error.message || 'Failed to create admin', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all
    ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-blue-500/20 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-brand/20 text-slate-800 placeholder-slate-400'}
  `;

  return (
    <div className="max-w-2xl mx-auto py-8 animate-fade-in relative">
      
      {/* Dynamic Popup / Toast */}
      {popup.message && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up border transition-all ${
          popup.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-rose-500 text-white border-rose-400'
        }`}>
          {popup.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          <span className="font-bold text-sm tracking-wide">{popup.message}</span>
          <button onClick={() => setPopup({ message: '', type: '' })} className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="mb-8">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Create Admin</h2>
        <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Assign an administrator to a Hub or Store (Max 2 per entity).</p>
      </div>

      <div className={`p-8 rounded-2xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Details</h3>
            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fill out the required information.</p>
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
                  className={`${inputClasses} pl-10`}
                  placeholder="e.g. John Doe"
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
                  className={`${inputClasses} pl-10`}
                  placeholder="admin@example.com"
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
                  className={`${inputClasses} pl-20`}
                  placeholder="+254 7XX XXXXXX"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Enter 9 digits without country code or leading 0</p>
            </div>



            {/* Entity Type */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Entity Type</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Shield size={18} />
                </div>
                <select 
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  className={`${inputClasses} pl-10`}
                >
                  <option value="Hub">Hub</option>
                  <option value="Store">Store</option>
                </select>
              </div>
            </div>

            {/* Select Hub or Store */}
            <div className="space-y-2">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Select {formData.entityType}</label>
              
              {formData.entityType === 'Store' && (
                <div className="mb-4">
                  <label className={`text-xs font-bold mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Step 1: Filter by Hub</label>
                  <select 
                    value={selectedHubForStore}
                    onChange={(e) => {
                      setSelectedHubForStore(e.target.value);
                      setFormData(prev => ({ ...prev, entityId: '' }));
                    }}
                    className={inputClasses}
                  >
                    <option value="all">All Hubs</option>
                    {hubs.map(hub => <option key={hub.id} value={hub.id}>{hub.name}</option>)}
                  </select>
                </div>
              )}

              <label className={`text-xs font-bold mb-2 block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {formData.entityType === 'Store' ? 'Step 2: Select Store' : `Select ${formData.entityType}`}
              </label>
              <select 
                name="entityId"
                value={formData.entityId}
                onChange={handleChange}
                required
                className={inputClasses}
              >
                <option value="" disabled>Select a {formData.entityType}</option>
                {formData.entityType === 'Hub' ? (
                  hubs.map(hub => <option key={hub.id} value={hub.id}>{hub.name}</option>)
                ) : (
                  stores
                    .filter(store => selectedHubForStore === 'all' || String(store.hubId) === String(selectedHubForStore) || String(store.hub_id) === String(selectedHubForStore))
                    .map(store => <option key={store.id} value={store.id}>{store.name}</option>)
                )}
              </select>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-4">
            <Button 
              variant="ghost" 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="px-8 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdmin;
