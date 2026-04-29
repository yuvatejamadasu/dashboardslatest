import React, { useState, useEffect } from 'react';
import { Shield, Plus, Loader2, CheckCircle2, AlertCircle, X, Trash2 } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { superAdminService } from '@/services/super-admin/superAdminService';
import Button from '@/components/super-admin/ui/Button';

const SuperAdminSettings = () => {
  const { isDark } = useTheme();
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, setPopup] = useState({ message: '', type: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const fetchSuperAdmins = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getSuperAdmins();
      setSuperAdmins(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching super admins:', err);
      setError('Failed to load super admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdmins();
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await superAdminService.updateSuperAdminStatus(id, newStatus);
      await fetchSuperAdmins();
      setPopup({ message: `Status changed to ${newStatus}`, type: 'success' });
    } catch (err) {
      setPopup({ message: err.message || 'Error updating status', type: 'error' });
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setPopup({ message: 'Please fill all fields', type: 'error' });
      return;
    }

    try {
      await superAdminService.createSuperAdmin(formData);
      setPopup({ message: 'Super Admin created successfully', type: 'success' });
      setFormData({ name: '', email: '' });
      setShowAddForm(false);
      await fetchSuperAdmins();
    } catch (err) {
      setPopup({ message: err.message, type: 'error' });
    }
  };

  const inputClasses = `
    w-full px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all
    ${isDark ? 'bg-[#1a1d21] border-slate-700 focus:ring-blue-500/20 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 focus:ring-brand/20 text-slate-800 placeholder-slate-400'}
  `;

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-gray-700">
      
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>Profile</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Manage super administrators (Maximum 5)</p>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          disabled={superAdmins.length >= 5}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          {superAdmins.length >= 5 ? 'Limit Reached (5/5)' : 'Add Super Admin'}
        </Button>
      </div>

      {showAddForm && (
        <div className={`p-6 rounded-xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add New Super Admin</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={inputClasses}
                placeholder="Admin Name"
              />
            </div>
            <div className="flex-1 w-full space-y-1">
              <label className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={inputClasses}
                placeholder="admin@example.com"
              />
            </div>
            <div className="w-full md:w-auto flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 size={40} className="animate-spin text-[#1d5ba0] mb-4" />
          <p className="font-medium">Loading super admins...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500">
          <p className="font-bold">{error}</p>
        </div>
      ) : (
        <div className={`rounded-xl overflow-hidden transition-all ${isDark ? 'bg-[#2c3136] border border-slate-700 shadow-xl' : 'bg-white shadow-md p-4'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-[#1d5ba0] text-white'} text-xs font-bold uppercase tracking-wider`}>
                  <th className="px-6 py-4 rounded-tl-lg">S.No</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                {superAdmins.map((admin, index) => (
                  <tr key={admin.id} className={`group transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-[#1d5ba0]/10'}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#1d5ba0]/10 text-[#1d5ba0]'}`}>
                          <Shield size={16} />
                        </div>
                        <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{admin.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleToggleStatus(admin.id, admin.status)}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
                          admin.status === 'Active'
                            ? (isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800')
                            : (isDark ? 'bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white' : 'bg-green-100 text-green-700 hover:bg-green-200')
                        }`}
                      >
                        {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSettings;
