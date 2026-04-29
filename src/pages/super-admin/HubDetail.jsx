import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Warehouse, MapPin, Navigation, Info, ArrowLeft, Globe, Loader2, Users, Store, Package, Banknote, X, User, Phone, Mail } from 'lucide-react';
import { useTheme } from '@/context/super-admin/ThemeContext';
import Button from '@/components/super-admin/ui/Button';
import MapDisplay from '@/components/common/MapDisplay';
import { superAdminService, validateKenyaMobile } from "@/services/super-admin/superAdminService";

const HubDetail = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ admins: 0, stores: 0 });
  const [isStoresModalOpen, setIsStoresModalOpen] = useState(false);
  const [hubStoresList, setHubStoresList] = useState([]);
  const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false);
  const [hubAdminsList, setHubAdminsList] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [allHubs, setAllHubs] = useState([]);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getHubById(id);
      if (!data) throw new Error('Hub not found');
      setHub(data);
      
      const [admins, stores, hubsData] = await Promise.all([
        superAdminService.getAdmins(),
        superAdminService.getStores(),
        superAdminService.getHubs()
      ]);

      setAllHubs(hubsData);
      const hubAdmins = admins.filter(a => String(a.hubId) === String(id));
      const hubStores = stores.filter(s => String(s.hubId) === String(id) || String(s.hub_id) === String(id));
      
      setHubAdminsList(hubAdmins);
      setHubStoresList(hubStores);
      setStats({ admins: hubAdmins.length, stores: hubStores.length });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching hub:', err);
      setError('Hub not found or failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, [id]);

  const handleApprove = async () => {
    try {
      await superAdminService.updateHubStatus(id, 'Active');
      await fetchHubData(); // refresh data
    } catch (err) {
      console.error('Failed to approve hub', err);
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin({ ...admin });
  };

  const handleSaveAdminEdit = async () => {
    if (editingAdmin.mobile && !validateKenyaMobile(editingAdmin.mobile)) {
      alert(editingAdmin.mobile.length < 9 ? "Enter valid mobile number" : "Kenya mobile number must be exactly 9 digits.");
      return;
    }
    try {
      const updated = await superAdminService.updateAdmin(editingAdmin.id, {
        fullName: editingAdmin.fullName || editingAdmin.name,
        email: editingAdmin.email,
        mobile: editingAdmin.mobile,
        password: editingAdmin.password,
        status: editingAdmin.status
      });
      setHubAdminsList(hubAdminsList.map(a => a.id === editingAdmin.id ? { ...a, ...updated } : a));
      setEditingAdmin(null);
    } catch (err) {
      alert('Error updating admin: ' + err.message);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        await superAdminService.deleteAdmin(adminId);
        setHubAdminsList(hubAdminsList.filter(a => a.id !== adminId));
        setStats(prev => ({ ...prev, admins: prev.admins - 1 }));
      } catch (err) {
        alert('Error deleting admin: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 size={48} className="animate-spin text-[#1d5ba0] mb-4" />
        <p className="font-medium">Retrieving hub details...</p>
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
        <Info size={48} className="mb-4 text-rose-500" />
        <p className="text-lg font-bold">{error || 'Hub Not Found'}</p>
        <Button onClick={() => navigate('/hubs')} className="mt-4">Back to List</Button>
      </div>
    );
  }

  const iconBgClasses = `w-10 h-10 rounded-xl flex items-center justify-center ${
    isDark ? 'bg-slate-700 text-slate-300' : 'bg-[#1d5ba0]/10 text-[#1d5ba0]'
  }`;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/hubs')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>{hub.name}</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Detailed hub information and location.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
              hub.status === 'Active' 
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                : hub.status === 'Pending'
                ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20'
                : 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
            }`}>
              {hub.status}
            </span>
            {hub.status === 'Pending' && (
              <button
                onClick={handleApprove}
                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-[#1d5ba0] text-white hover:bg-[#154682] shadow-lg shadow-brand/20 transition-all"
              >
                Approve
              </button>
            )}
          </div>

          {allHubs.length > 1 && (
            <div className="relative">
              <select
                value={id}
                onChange={(e) => navigate(`/hub/${e.target.value}`)}
                className={`appearance-none pl-4 pr-10 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all ${
                  isDark ? 'bg-[#2c3136] border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {allHubs.map(h => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
              <Navigation size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={<Users size={24} />} 
          label="Total Admins" 
          value={stats.admins} 
          isDark={isDark} 
          onClick={() => setIsAdminsModalOpen(true)}
          className="cursor-pointer"
        />
        <StatCard 
          icon={<Store size={24} />} 
          label="Assigned Stores" 
          value={stats.stores} 
          isDark={isDark} 
          onClick={() => setIsStoresModalOpen(true)}
          className="cursor-pointer"
        />
        <StatCard icon={<Package size={24} />} label="Total Orders" value="1,245" isDark={isDark} />
        <StatCard icon={<Banknote size={24} />} label="Revenue" value="KES 45,200" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info Card */}
        <div className={`md:col-span-2 p-8 rounded-3xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={iconBgClasses}>
              <Info size={20} />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>Hub Information</h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Hub Name</span>
                <p className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hub.name}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Owner Name</span>
                <p className={`text-md font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hub.ownerName}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Mobile Number</span>
                <p className={`text-md font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hub.mobile}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">Email Address</span>
                <p className={`text-md font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{hub.email}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-6">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Location Address</span>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="text-[#1d5ba0] shrink-0 mt-0.5" />
                <p className={`text-md font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{hub.location || hub.address}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
              <h4 className={`text-sm font-bold mb-4 uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Basic Statistics</h4>
              <div className="flex gap-6">
                <div className={`flex-1 p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Admins</span>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.admins}</p>
                </div>
                <div className={`flex-1 p-4 rounded-2xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Total Stores</span>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.stores}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coordinates Card */}
        <div className={`p-8 rounded-3xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={iconBgClasses}>
              <Navigation size={20} />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>Geo Location</h3>
          </div>

          <div className="space-y-6">
            <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-[#1d5ba0]'}`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Latitude</span>
              <p className={`text-xl font-black ${isDark ? 'text-[#1d5ba0]' : 'text-[#1d5ba0]'}`}>{hub.latitude}</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-[#1d5ba0]'}`}>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Longitude</span>
              <p className={`text-xl font-black ${isDark ? 'text-[#1d5ba0]' : 'text-[#1d5ba0]'}`}>{hub.longitude}</p>
            </div>
          </div>
          
          <MapDisplay 
            latitude={hub.latitude} 
            longitude={hub.longitude} 
            isDark={isDark} 
          />
        </div>
      </div>

      {/* Stores List Section */}
      <div className={`mt-8 p-8 rounded-3xl border transition-all ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={iconBgClasses}>
              <Store size={20} />
            </div>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#1d5ba0]'}`}>Assigned Stores ({stats.stores})</h3>
          </div>
          <button 
            onClick={() => navigate('/create-store')}
            className="px-4 py-2 bg-[#1d5ba0] text-white text-xs font-bold rounded-xl hover:bg-[#154682] transition-all"
          >
            Add New Store
          </button>
        </div>

        {hubStoresList.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
            <Store size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium italic">No stores have been assigned to this hub yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hubStoresList.map(store => (
              <div 
                key={store.id} 
                onClick={() => navigate(`/store/${store.id}`)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 ${
                  isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-[#1d5ba0]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700 text-orange-500' : 'bg-orange-500/10 text-orange-600'}`}>
                      <Store size={18} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{store.name}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        store.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        store.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>
                        {store.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <User size={14} className="shrink-0" />
                    <span>{store.ownerName || store.owner_name}</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{store.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Stores Modal */}
      {isStoresModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsStoresModalOpen(false)}>
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Store size={20} className="text-[#1d5ba0]" />
                Assigned Stores
              </h3>
              <button onClick={() => setIsStoresModalOpen(false)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {hubStoresList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-medium">No stores assigned to this hub yet.</p>
                </div>
              ) : (
                <ul className="space-y-1 p-2">
                  {hubStoresList.map(store => (
                    <li key={store.id} className={`p-3 rounded-xl flex flex-col gap-1 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{store.name}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          store.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          store.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {store.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><User size={12}/> {store.ownerName || store.owner_name}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {store.mobile || store.mobile_number}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assigned Admins Modal */}
      {isAdminsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAdminsModalOpen(false)}>
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Users size={20} className="text-[#1d5ba0]" />
                Assigned Admins
              </h3>
              <button onClick={() => setIsAdminsModalOpen(false)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {hubAdminsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-medium">No admins assigned to this hub yet.</p>
                </div>
              ) : (
                <ul className="space-y-1 p-2">
                  {hubAdminsList.map(admin => (
                    <li key={admin.id} className={`p-3 rounded-xl flex flex-col gap-1 transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{admin.name || admin.fullName}</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          admin.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {admin.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Mail size={12}/> {admin.email}</span>
                        <span className="flex items-center gap-1"><Phone size={12}/> {admin.mobile || 'N/A'}</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button 
                          onClick={() => handleEditAdmin(admin)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors`}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className={`flex-1 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Modal */}
      {editingAdmin && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl shadow-xl animate-scale-in ${isDark ? 'bg-[#2c3136] text-white' : 'bg-white text-slate-800'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Edit Admin Details</h3>
              <button onClick={() => setEditingAdmin(null)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={editingAdmin.fullName || editingAdmin.name || ''}
                  onChange={(e) => setEditingAdmin({...editingAdmin, fullName: e.target.value, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Email Address</label>
                <input
                  type="email"
                  value={editingAdmin.email || ''}
                  onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Mobile Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r pr-2 border-slate-700">
                    <span className="text-sm font-bold text-slate-500">+254</span>
                  </div>
                  <input
                    type="tel"
                    value={editingAdmin.mobile || ''}
                    onChange={(e) => {
                      if (e.target.value.length > 9) alert("Kenya mobile number must be exactly 9 digits.");
                      setEditingAdmin({...editingAdmin, mobile: e.target.value});
                    }}
                    className={`w-full pl-16 pr-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                    placeholder="+254 7XX XXXXXX"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Enter 9 digits without country code or leading 0</p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Password</label>
                <input
                  type="text"
                  value={editingAdmin.password || ''}
                  onChange={(e) => setEditingAdmin({...editingAdmin, password: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all font-mono ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                  placeholder="Set new password"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-400">Status</label>
                <select
                  value={editingAdmin.status || 'Active'}
                  onChange={(e) => setEditingAdmin({...editingAdmin, status: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all ${isDark ? 'bg-[#1a1d21] border-slate-700 text-white' : 'bg-slate-50 border-slate-200'}`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setEditingAdmin(null)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all`}>Cancel</button>
              <button onClick={handleSaveAdminEdit} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubDetail;

const StatCard = ({ icon, label, value, isDark, onClick, className }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${className || ''} ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-100 shadow-md'}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700/50 text-brand' : 'bg-brand/10 text-brand'}`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
    <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
  </div>
);

