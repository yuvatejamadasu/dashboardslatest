import React, { useState, useEffect } from 'react';
import { Shield, Mail, Eye, Search, Loader2, LayoutGrid, List, Edit2, Trash2, X } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { superAdminService, validateKenyaMobile } from "@/services/super-admin/superAdminService";
import { useTranslation } from 'react-i18next';

const SuperAdminList = () => {
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(localStorage.getItem('superAdminListMode') || 'grid');
  const [editingAdmin, setEditingAdmin] = useState(null);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('superAdminListMode', mode);
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        const data = await superAdminService.getSuperAdmins();
        setAdmins(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching super admins:', err);
        setError('Failed to load super admins. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await superAdminService.updateSuperAdminStatus(id, newStatus);
      setAdmins(admins.map(admin => admin.id === id ? { ...admin, status: newStatus } : admin));
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this super admin?')) {
      try {
        await superAdminService.deleteSuperAdmin(id);
        setAdmins(admins.filter(a => a.id !== id));
      } catch (err) {
        alert('Error deleting super admin: ' + err.message);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile' && value.length > 9) {
      alert("Kenya mobile number must be exactly 9 digits.");
    }
    setEditingAdmin(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (admin) => {
    setEditingAdmin({ ...admin });
  };

  const handleSaveEdit = async () => {
    if (editingAdmin.mobile && !validateKenyaMobile(editingAdmin.mobile)) {
      alert(editingAdmin.mobile.length < 9 ? "Enter valid mobile number" : "Kenya mobile number must be exactly 9 digits.");
      return;
    }
    if (editingAdmin.password && editingAdmin.password !== editingAdmin.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const dataToUpdate = { ...editingAdmin };
      delete dataToUpdate.confirmPassword; // Don't save confirmPassword to DB

      const updated = await superAdminService.updateSuperAdmin(editingAdmin.id, dataToUpdate);
      setAdmins(admins.map(a => a.id === editingAdmin.id ? updated : a));
      setEditingAdmin(null);
    } catch (error) {
      console.error('Failed to update admin:', error);
      alert('Error updating super admin: ' + error.message);
    }
  };

  const filteredAdmins = admins.filter(admin => 
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-gray-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>{t('super_admins.title')}</h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{t('super_admins.subtitle')}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <button
            onClick={() => navigate('/trash')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
              isDark ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            View Trash
          </button>
          <button
            onClick={() => navigate('/create-super-admin')}
            disabled={admins.length >= 3}
            title={admins.length >= 3 ? t('super_admins.limit_reached') : t('super_admins.create_new')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all ${
              admins.length >= 3 
                ? (isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-200 text-slate-400 cursor-not-allowed')
                : (isDark ? 'bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20' : 'bg-[#1d5ba0] text-white hover:bg-[#154682] shadow-md')
            }`}
          >
            {t('super_admins.new_admin')}
          </button>
        </div>
      </div>

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
        <div className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
          <div className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b ${isDark ? 'border-slate-700/50' : 'border-slate-100'}`}>
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder={t('super_admins.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold border outline-none transition-all ${
                  isDark 
                    ? 'bg-[#212529] border-slate-600 text-slate-200 focus:border-brand' 
                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#1d5ba0]'
                }`}
              />
            </div>
            <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-[#1a1d21] border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={18} />
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (isDark ? 'bg-slate-700 text-white shadow-md' : 'bg-white text-[#1d5ba0] shadow-sm') : 'text-gray-400 hover:text-gray-600'}`}
                title="Grid View"
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>

          <div className="p-0">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-[#1d5ba0] text-white'} text-xs font-bold uppercase tracking-wider`}>
                      <th className="px-6 py-4">S.No</th>
                      <th className="px-6 py-4">{t('common.name')}</th>
                      <th className="px-6 py-4">{t('common.email')}</th>
                      <th className="px-6 py-4">{t('common.status')}</th>
                      <th className="px-6 py-4 text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                    {filteredAdmins.map((admin, index) => (
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
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                            <Mail size={14} className="shrink-0" />
                            <span className="truncate max-w-[200px]">{admin.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            admin.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : admin.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {admin.status !== 'Active' && (
                              <button 
                                onClick={() => handleStatusChange(admin.id, 'Active')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-500/20`}
                              >
                                {t('super_admins.set_active')}
                              </button>
                            )}
                            {admin.status !== 'Inactive' && (
                              <button 
                                onClick={() => handleStatusChange(admin.id, 'Inactive')}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20`}
                              >
                                {t('super_admins.set_inactive')}
                              </button>
                            )}
                            <button 
                              onClick={() => handleEdit(admin)}
                              className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-500/20`}
                              title={t('common.edit')}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(admin.id)}
                              className={`p-1.5 rounded-md text-xs font-bold transition-all duration-200 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20`}
                              title={t('common.delete')}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAdmins.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic text-sm">{t('super_admins.no_admins')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isDark ? 'bg-transparent' : 'bg-slate-50/50'}`}>
                {filteredAdmins.length > 0 ? filteredAdmins.map(admin => (
                  <div key={admin.id} className={`flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDark ? 'bg-[#212529] border-slate-700/50' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-brand' : 'bg-brand/10 text-[#1d5ba0]'}`}>
                          <Shield size={24} />
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{admin.name}</h3>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            admin.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : admin.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {admin.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400 shrink-0" />
                        <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{admin.email}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-2 border-slate-100 dark:border-slate-700/50">
                      <div className="flex gap-2">
                        {admin.status !== 'Active' && (
                          <button 
                            onClick={() => handleStatusChange(admin.id, 'Active')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors"
                          >
                            {t('super_admins.set_active')}
                          </button>
                        )}
                        {admin.status !== 'Inactive' && (
                          <button 
                            onClick={() => handleStatusChange(admin.id, 'Inactive')}
                            className="flex-1 py-2 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                          >
                            {t('super_admins.set_inactive')}
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(admin)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-20 text-center text-gray-400 italic text-sm">
                    {t('super_admins.no_matching_admins')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl animate-scale-in ${isDark ? 'bg-[#2c3136] text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{t('common.edit')} {t('common.name')}</h3>
              <button 
                onClick={() => setEditingAdmin(null)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('common.name')}</label>
                <input
                  type="text"
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1d5ba0]/20 transition-all ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{t('common.email')}</label>
                <input
                  type="email"
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1d5ba0]/20 transition-all ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-2 border-slate-300">
                    <span className="text-sm font-bold text-slate-500">+254</span>
                  </div>
                  <input
                    type="tel"
                    value={editingAdmin.mobile || ''}
                    onChange={handleEditChange}
                    className={`w-full pl-16 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1d5ba0]/20 transition-all ${
                      isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                    }`}
                    placeholder="+254 7XX XXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password</label>
                <input
                  type="text"
                  value={editingAdmin.password || ''}
                  onChange={(e) => setEditingAdmin({...editingAdmin, password: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1d5ba0]/20 transition-all font-mono ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm Password</label>
                <input
                  type="text"
                  value={editingAdmin.confirmPassword || ''}
                  onChange={(e) => setEditingAdmin({...editingAdmin, confirmPassword: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1d5ba0]/20 transition-all font-mono ${
                    isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                  }`}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingAdmin(null)}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  isDark ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-[#1d5ba0] text-white hover:bg-[#154682] shadow-lg shadow-[#1d5ba0]/20 transition-all"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminList;
