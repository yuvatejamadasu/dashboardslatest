import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { superAdminService } from "@/services/super-admin/superAdminService";

const DeletedAdmins = () => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [trashedAdmins, setTrashedAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [superAdminCount, setSuperAdminCount] = useState(0);

  const fetchTrash = async () => {
    try {
      setLoading(true);
      const [trashData, superAdmins] = await Promise.all([
        superAdminService.getTrashedAdmins(),
        superAdminService.getSuperAdmins()
      ]);
      setTrashedAdmins(trashData);
      setSuperAdminCount(superAdmins.length);
    } catch (err) {
      console.error('Failed to load trash', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id, type) => {
    if (type === 'Admin' || type === 'Super Admin') {
      if (superAdminCount >= 3) {
        alert('Cannot restore. Maximum limit of 3 Super Admins reached.');
        return;
      }
    }
    try {
      await superAdminService.restoreAdmin(id, type);
      await fetchTrash();
    } catch (err) {
      alert('Error restoring: ' + err.message);
    }
  };
  
  const handlePermanentDelete = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) {
      try {
        await superAdminService.permanentDeleteAdmin(id);
        await fetchTrash();
      } catch (err) {
        alert('Error deleting: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-6 pb-8 animate-fade-in text-gray-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            <Trash2 className="text-rose-500" /> Deleted Users
          </h2>
          <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            View and restore deleted administrators.
          </p>
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden shadow-sm ${isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-slate-200'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 size={40} className="animate-spin text-[#1d5ba0] mb-4" />
            <p className="font-medium">Loading trash...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'} text-xs font-bold uppercase tracking-wider`}>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Account Type</th>
                  <th className="px-6 py-4">Deleted Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-gray-100'}`}>
                {trashedAdmins.length > 0 ? trashedAdmins.map((admin) => (
                  <tr key={`${admin.type}-${admin.id}`} className={`group transition-all duration-200 ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                    <td className={`px-6 py-4 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {admin.name || admin.fullName || admin.hubName || admin.storeName || 'N/A'}
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{admin.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold ${admin.type === 'Super Admin' ? 'bg-purple-500/10 text-purple-600' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                        {admin.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      {new Date(admin.deletedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleRestore(admin.id, admin.type)}
                        disabled={(admin.type === 'Admin' || admin.type === 'Super Admin') && superAdminCount >= 3}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${
                          (admin.type === 'Admin' || admin.type === 'Super Admin') && superAdminCount >= 3
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : isDark 
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white'
                        }`}
                        title={(admin.type === 'Admin' || admin.type === 'Super Admin') && superAdminCount >= 3 ? "Super Admin limit (3) reached" : ""}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(admin.id)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm ${isDark ? 'bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white'
                          }`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <Trash2 size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      <p className="text-slate-400 italic">Trash is empty. No deleted users found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletedAdmins;
