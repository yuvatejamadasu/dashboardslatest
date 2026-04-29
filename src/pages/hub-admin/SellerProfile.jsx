import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, User, Phone, Mail, MapPin, Navigation, Info, ArrowLeft, Globe, Loader2, Users, Package, TrendingUp, Star, X } from 'lucide-react';
import { useTheme } from '@/context/hub-admin/ThemeContext';
import Button from '@/components/hub-admin/ui/Button';
import MapDisplay from '@/components/common/MapDisplay';
import { superAdminService } from "@/services/super-admin/superAdminService";

const SellerProfile = () => {
  const { isDark } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ admins: 0 });
  const [isAdminsModalOpen, setIsAdminsModalOpen] = useState(false);
  const [storeAdminsList, setStoreAdminsList] = useState([]);

  const [hubName, setHubName] = useState('N/A');
  const [hubStores, setHubStores] = useState([]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const data = await superAdminService.getStoreById(id);
      if (!data) throw new Error('Store not found');
      setStore(data);
      
      const [allHubs, allStores, admins] = await Promise.all([
        superAdminService.getHubs(),
        superAdminService.getStores(),
        superAdminService.getAdmins()
      ]);

      const hub = allHubs.find(h => String(h.id) === String(data.hubId) || String(h.id) === String(data.hub_id));
      setHubName(hub ? hub.name : (data.hubName || 'N/A'));
      
      const siblingStores = allStores.filter(s => String(s.hubId) === String(data.hubId) || String(s.hub_id) === String(data.hub_id));
      setHubStores(siblingStores);

      const storeAdmins = admins.filter(a => a.entityType === 'Store' && String(a.entityId) === String(id));
      
      setStoreAdminsList(storeAdmins);
      setStats({ admins: storeAdmins.length });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Store not found or failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 size={48} className="animate-spin text-brand mb-4" />
        <p className="font-medium">Retrieving store profile...</p>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 text-center">
        <Info size={48} className="mb-4 text-rose-500" />
        <p className="text-lg font-bold">{error || 'Store Not Found'}</p>
        <Button onClick={() => navigate('/hub-dashboard/sellers')} className="mt-4">Back to Stores</Button>
      </div>
    );
  }

  const cardClasses = `p-5 rounded-xl border transition-all duration-200 shadow-md hover:shadow-lg ${
    isDark ? 'bg-[#2c3136] border-slate-700' : 'bg-white border-gray-200'
  }`;

  const labelClasses = "text-gray-500 text-sm font-medium uppercase tracking-wider";
  const valueClasses = `text-md font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`;
  const iconBgClasses = `w-10 h-10 rounded-xl flex items-center justify-center ${
    isDark ? 'bg-slate-700 text-slate-300' : 'bg-brand/10 text-brand'
  }`;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/hub-dashboard/sellers')}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-600'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>{store.name}</h2>
            <p className={`text-sm font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Detailed retail store profile.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
            store.status === 'Active' 
              ? (isDark ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-brand text-white shadow-lg shadow-brand/20')
              : store.status === 'Pending'
              ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/20'
              : (isDark ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-white text-rose-500 border border-rose-500')
          }`}>
            {store.status}
          </span>

          {hubStores.length > 1 && (
            <div className="relative">
              <select
                value={id}
                onChange={(e) => navigate(`/hub-dashboard/sellers/${e.target.value}`)}
                className={`appearance-none pl-4 pr-10 py-2 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer transition-all ${
                  isDark ? 'bg-[#2c3136] border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-700'
                }`}
              >
                {hubStores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
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
        <StatCard icon={<Package size={24} />} label="Total Sales" value="8,405" isDark={isDark} />
        <StatCard icon={<TrendingUp size={24} />} label="Active Products" value="142" isDark={isDark} />
        <StatCard icon={<Star size={24} />} label="Customer Rating" value="4.8/5" isDark={isDark} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Store Info Card */}
        <div className="md:col-span-2 space-y-6">
          <div className={cardClasses}>
            <div className="flex items-center gap-3 mb-8">
              <div className={iconBgClasses}>
                <Store size={20} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>General Information</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="flex flex-col gap-1">
                <span className={labelClasses}>Store Name</span>
                <p className={valueClasses}>{store.name}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className={labelClasses}>Owner Name</span>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-brand" />
                  <p className={valueClasses}>{store.ownerName || store.owner_name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className={labelClasses}>Contact Number</span>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-brand" />
                  <p className={valueClasses}>{store.mobile || store.mobile_number}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className={labelClasses}>Email Address</span>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-brand" />
                  <p className={`${valueClasses} truncate`}>{store.email}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className={labelClasses}>Assigned Hub</span>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-brand" />
                  <p className={valueClasses}>{hubName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={cardClasses}>
            <div className="flex items-center gap-3 mb-4">
              <div className={iconBgClasses}>
                <MapPin size={20} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>Store Address</h3>
            </div>
            <p className={`text-md font-medium leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{store.address}</p>
          </div>

          <div className={cardClasses}>
            <div className="flex items-center gap-3 mb-4">
              <div className={iconBgClasses}>
                <User size={20} />
              </div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>Store Statistics</h3>
            </div>
            <div className="flex flex-col gap-1">
              <span className={labelClasses}>Total Admins</span>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{stats.admins}</p>
            </div>
          </div>
        </div>

        {/* Geo Location Card */}
        <div className={`${cardClasses} h-fit`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={iconBgClasses}>
              <Navigation size={20} />
            </div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>Geo Tracking</h3>
          </div>

          <div className="space-y-4">
            <div className={`p-3 rounded-lg border transition-all ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-brand'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Latitude</span>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>{store.latitude}</p>
            </div>

            <div className={`p-3 rounded-lg border transition-all ${
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-brand'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1">Longitude</span>
              <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-brand'}`}>{store.longitude}</p>
            </div>
          </div>
          
          <MapDisplay 
            latitude={store.latitude} 
            longitude={store.longitude} 
            isDark={isDark} 
          />
        </div>
      </div>

      {/* Assigned Admins Modal */}
      {isAdminsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsAdminsModalOpen(false)}>
          <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#1a1d21] border border-slate-700' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
              <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Users size={20} className="text-brand" />
                Assigned Admins
              </h3>
              <button onClick={() => setIsAdminsModalOpen(false)} className={`p-1.5 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <X size={18} />
              </button>
            </div>
            
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {storeAdminsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="font-medium">No admins assigned to this store yet.</p>
                </div>
              ) : (
                <ul className="space-y-1 p-2">
                  {storeAdminsList.map(admin => (
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
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProfile;

const StatCard = ({ icon, label, value, isDark, onClick, className }) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${className || ''} ${isDark ? 'bg-[#2c3136] border-slate-700 shadow-xl' : 'bg-white border-slate-100 shadow-md'}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700/50 text-orange-500' : 'bg-orange-500/10 text-orange-600'}`}>
      {icon}
    </div>
    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</h3>
    <p className={`text-sm font-bold mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
  </div>
);

