import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStates, getRegions, getBranches, getHubs, getStores } from "@/constants/locations";
import { notifyParent, getNotificationsForUser, clearNotification, requestDeletion, getDeletionRequestsForUser, approveDeletion, rejectDeletion } from '@/utils/common/notifications';
import { processApproval, processRejection } from '@/utils/common/approvalUtils';
import BypassDropdown from '@/components/common/BypassDropdown';
import RequestDetailsModal from '@/components/common/RequestDetailsModal';


const HubDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [hubData, setHubData] = useState([]);
  const [filters, setFilters] = useState({ state: '', region: '', branch: '', hub: '', store: '' });
  const [counts, setCounts] = useState({ state: 0, region: 0, branch: 0, hub: 0, store: 0 });
  const [pendingReqs, setPendingReqs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);


  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('hubAdminAuth') || 'null');
    if (!auth || !auth.loggedIn) {
      navigate('/hub-login');
      return;
    }
    const adminState = auth.state;
    const adminRegion = auth.regionName || auth.region;
    const adminBranch = auth.branchName || auth.branch;
    const adminHub = auth.hubName || auth.hub;
    setUserName(auth.fullName || auth.adminName || auth.name || 'Hub Admin');

    const s = JSON.parse(localStorage.getItem('stateAdminAccounts') || '[]');
    const r = JSON.parse(localStorage.getItem('regionAccounts') || '[]');
    const b = JSON.parse(localStorage.getItem('branchAccounts') || '[]');
    const h = JSON.parse(localStorage.getItem('hubAccounts') || '[]');
    const rawSt = JSON.parse(localStorage.getItem('storeAccounts') || '[]');

    const st = rawSt.filter(acc => acc.state === adminState && (acc.regionName === adminRegion || acc.region === adminRegion) && (acc.branchName === adminBranch || acc.branch === adminBranch) && (acc.hubName === adminHub || acc.hub === adminHub) && acc.status !== 'Pending');
    
    setHubData(st); 
    const pr = JSON.parse(localStorage.getItem('pendingRequests') || '[]');

    setPendingReqs([
      ...pr.filter(req => req.targetRole === 'hub-admin' && req.state === adminState && (req.regionName === adminRegion || req.region === adminRegion) && (req.branchName === adminBranch || req.branch === adminBranch) && (req.hubName === adminHub || req.hub === adminHub)).map(req => ({...req, key:'pendingRequests'})),
      ...rawSt.filter(acc => acc.state === adminState && (acc.regionName === adminRegion || acc.region === adminRegion) && (acc.branchName === adminBranch || acc.branch === adminBranch) && (acc.hubName === adminHub || acc.hub === adminHub) && acc.status === 'Pending').map(acc => ({...acc, type: 'Store', key:'storeAccounts'}))
    ]);

    setCounts({
      state: s.length,
      region: r.length,
      branch: b.length,
      hub: h.length,
      store: st.length
    });

    const notes = getNotificationsForUser('hub-admin', auth);
    setNotifications(notes);
    setDeletionRequests(getDeletionRequestsForUser('hub-admin', auth));
  }, [navigate]);



  const handleApprove = (email, storageKey, requestId) => {
    if (storageKey === 'pendingRequests') {
      const result = processApproval(requestId);
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.message || 'Approval failed');
      }
      return;
    }

    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = accounts.map(acc => acc.email === email ? { ...acc, status: 'Approved' } : acc);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.location.reload();
  };

  const handleReject = (email, storageKey, requestId) => {
    if(!window.confirm("Are you sure?")) return;

    if (storageKey === 'pendingRequests') {
      const result = processRejection(requestId);
      if (result.success) {
        window.location.reload();
      }
      return;
    }

    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = accounts.filter(acc => acc.email !== email);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.location.reload();
  };

  const handleDelete = (email, storageKey, entityType) => {
    if (!window.confirm(`Are you sure you want to request deletion for this ${entityType}? This will require approval from Super, State, Region, Branch, and Hub admins.`)) return;
    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const itemToDelete = accounts.find(acc => acc.email === email);
    
    if (itemToDelete) {
      requestDeletion(entityType, itemToDelete, 'hub-admin');
      alert(`Deletion request for ${entityType} has been sent. All required parent administrators (Super, State, Region, Branch, Hub) must approve before final deletion.`);
      window.location.reload();
    }
  };

  const handleApproveDeletion = (id) => {
    if(!window.confirm("Confirm approval for this deletion? Final deletion only occurs when all required administrators (Super, State, Region, Branch, Hub) have approved.")) return;
    const isFinal = approveDeletion(id, 'hub-admin');
    if (isFinal) {
      alert("Final approval received. The entity has been permanently deleted.");
    } else {
      alert("Your approval has been recorded. Still waiting for other higher-level approvals.");
    }
    window.location.reload();
  };

  const handleRejectDeletion = (id) => {
    rejectDeletion(id);
    window.location.reload();
  };


  const handleDismissNotification = (id) => {
    clearNotification(id);
    setNotifications(notifications.filter(n => n.id !== id));
  };


  const handleLogout = () => {
    localStorage.removeItem('hubAdminAuth');
    navigate('/');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'state') { updated.region = ''; updated.branch = ''; updated.hub = ''; updated.store = ''; }
      if (name === 'region') { updated.branch = ''; updated.hub = ''; updated.store = ''; }
      if (name === 'branch') { updated.hub = ''; updated.store = ''; }
      if (name === 'hub') { updated.store = ''; }
      return updated;
    });
  };

  const filteredHubs = hubData.filter(h => {
    return (!filters.state || h.state === filters.state) &&
           (!filters.region || h.regionName === filters.region) &&
           (!filters.branch || h.branchName === filters.branch) &&
           (!filters.hub || h.hubName === filters.hub);
  });

  const totalHubs = filteredHubs.length;
  const coveredStates = new Set(filteredHubs.map((item) => item.state)).size;
  const coveredRegions = new Set(filteredHubs.map((item) => item.regionName)).size;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hierarchy Navigation */}
      <section className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a2c42]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          Quick Navigation
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'State', count: counts.state, path: '/state-admin-dashboard', color: 'blue' },
            { label: 'Region', count: counts.region, path: '/region-dashboard', color: 'blue' },
            { label: 'Branch', count: counts.branch, path: '/branch-dashboard', color: 'blue' },
            { label: 'Hub', count: counts.hub, path: '/hub-dashboard', color: 'blue' },
            { label: 'Store', count: counts.store, path: '/store-dashboard', color: 'blue' },
          ].map((level, idx) => (
            <button
              key={idx}
              onClick={() => navigate(level.path)}
              className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-lg bg-${level.color}-50 text-${level.color}-600 text-[10px] font-bold uppercase tracking-wider`}>
                  {level.label}
                </span>
                <span className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{level.count}</p>
            </button>
          ))}
        </div>
      </section>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hub Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {userName}. Manage hubs and quick actions from here.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <button onClick={() => navigate('/store-signup', { state: { creatorRole: 'hub' } })} className="px-4 py-2 rounded-xl font-semibold bg-[#1a2c42] text-white hover:bg-[#152436] transition-all active:scale-95 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create Store Account
          </button>
          <BypassDropdown adminRole="hub" />
          <button onClick={handleLogout} className="px-4 py-2 rounded-xl font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all active:scale-95 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {notifications.length > 0 && (
        <section className="space-y-3">
          {notifications.map(note => (
            <div key={note.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="text-blue-900 font-medium">{note.message}</p>
                  <p className="text-blue-700 text-xs">{new Date(note.timestamp).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => handleDismissNotification(note.id)} className="text-blue-400 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </section>
      )}

      {deletionRequests.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm animate-in zoom-in-95 duration-500 mb-8 mt-4">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Deletion Requests from Store Admins ({deletionRequests.length})
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden border border-red-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-red-50/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-red-800 uppercase">Entity to Delete</th>
                  <th className="px-6 py-3 text-xs font-bold text-red-800 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {deletionRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 text-nowrap">
                      <p className="font-bold text-gray-900">{req.entityType}: {req.entityData.fullName || req.entityData.adminName || req.entityData.hubName || req.entityData.storeName}</p>
                      <p className="text-xs text-gray-500">{req.entityData.email}</p>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => handleApproveDeletion(req.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700">Approve Deletion</button>
                      <button onClick={() => handleRejectDeletion(req.id)} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-200">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}


      
      {pendingReqs.length > 0 && (
         <section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm overflow-hidden mb-8 mt-12">
            <h2 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              Pending Activation Requests ({pendingReqs.length})
            </h2>
            <div className="bg-white rounded-2xl border border-amber-100 overflow-x-auto shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {pendingReqs.map((req, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedRequest(req)} 
                      className="cursor-pointer hover:bg-amber-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-bold text-amber-700">{req.type}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{req.storeName || req.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{req.email}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleApprove(req.email, req.key, req.id); }} 
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all mr-2"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleReject(req.email, req.key, req.id); }} 
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-all"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter Hubs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">State</label>
            <select name="state" value={filters.state} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
              <option value="">All States</option>
              {getStates('India').map(s => <option key={s} value={s}>{s}</option>)}
              {getStates('Kenya').map(s => <option key={s} value={s}>{s}</option>)}
            </select>

          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Region</label>
            <select name="region" value={filters.region} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
              <option value="">All Regions</option>
              {getRegions('India', filters.state).map(r => <option key={r} value={r}>{r}</option>)}
              {getRegions('Kenya', filters.state).map(r => <option key={r} value={r}>{r}</option>)}
            </select>

          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Branch</label>
            <select name="branch" value={filters.branch} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
              <option value="">All Branches</option>
              {getBranches('India', filters.state, filters.region).map(b => <option key={b} value={b}>{b}</option>)}
              {getBranches('Kenya', filters.state, filters.region).map(b => <option key={b} value={b}>{b}</option>)}
            </select>

          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Hub</label>
            <select name="hub" value={filters.hub} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
              <option value="">All Hubs</option>
              {getHubs('India', filters.state, filters.region, filters.branch).map(h => <option key={h} value={h}>{h}</option>)}
              {getHubs('Kenya', filters.state, filters.region, filters.branch).map(h => <option key={h} value={h}>{h}</option>)}
            </select>

          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Store</label>
            <select name="store" value={filters.store} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none">
              <option value="">All Stores</option>
              {getStores('India', filters.state, filters.region, filters.branch, filters.hub).map(s => <option key={s} value={s}>{s}</option>)}
              {getStores('Kenya', filters.state, filters.region, filters.branch, filters.hub).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

          </div>
        </div>
      </section>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-4">Store Admin Names</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {hubData.length ? hubData.map((store, idx) => (
            <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-xl">
               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-semibold text-sm">{(store.storeName || store.fullName || 'S').charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{store.storeName || store.fullName}</p>
                <p className="text-sm text-gray-500">{store.state} - {store.hubName}</p>
              </div>
            </div>
          )) : (
            <p className="text-gray-500 col-span-full">No stores added yet.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Store Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Country/State</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hubData.length > 0 ? hubData.map((store, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{store.storeName}</td>
                    <td className="px-6 py-4 text-gray-500">{store.country || 'India'} / {store.state}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        store.status === 'Pending Deletion' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {store.status || 'Approved'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{store.fullName || store.adminName}</td>
                    <td className="px-6 py-4 text-gray-500">{store.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDelete(store.email, 'storeAccounts', 'Store')} className="text-red-600 hover:text-red-800 font-bold p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 italic">No entries yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-[#1a2c42] rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-[#1a2c42]/20">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-3">Quick Insights</h2>
            <p className="opacity-90 mb-6">Manage all stores and logins directly from the header buttons.</p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-white/10 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
};

export default HubDashboard;
