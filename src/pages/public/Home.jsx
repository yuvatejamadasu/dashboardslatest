import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "@/components/common/StatsCard";
import { notifyParent, getDeletionRequestsForUser, approveDeletion, rejectDeletion, requestDeletion, notifySubordinates } from "@/utils/common/notifications";
import { sendApprovalEmail, sendRejectionEmail } from "@/utils/common/emailMock";
import { processApproval, processRejection } from "@/utils/common/approvalUtils";
import RequestDetailsModal from "@/components/common/RequestDetailsModal";
import BypassDropdown from "@/components/common/BypassDropdown";

function Home() {
  const navigate = useNavigate();
  const [hubs, setHubs] = useState([]);
  const [stores, setStores] = useState([]);
  const [counts, setCounts] = useState({ hub: 0, store: 0 });
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [pendingReqs, setPendingReqs] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const h = JSON.parse(localStorage.getItem("hubAccounts") || "[]");
    const st = JSON.parse(localStorage.getItem("storeAccounts") || "[]");
    const pr = JSON.parse(localStorage.getItem("pendingRequests") || "[]");
    
    setHubs(h);
    setStores(st);
    setPendingReqs(pr);

    setCounts({
      hub: h.filter(acc => acc.status === 'Approved').length,
      store: st.filter(acc => acc.status === 'Approved').length
    });

    setDeletionRequests(getDeletionRequestsForUser('super-admin', {}));
  }, []);

  const filteredHubs = hubs.filter(acc => acc.status === 'Approved').slice(0, 5);
  const filteredStores = stores.filter(acc => acc.status === 'Approved').slice(0, 5);

  const allPending = [
    ...pendingReqs.filter(req => req.targetRole === 'super-admin').map(acc => ({ ...acc, type: acc.type || 'Account', key: 'pendingRequests' })),
    ...hubs.filter(acc => acc.status === 'Pending' || acc.status === 'Pending Super').map(acc => ({ ...acc, type: 'Hub', key: 'hubAccounts' })),
    ...stores.filter(acc => acc.status === 'Pending' || acc.status === 'Pending Super').map(acc => ({ ...acc, type: 'Store', key: 'storeAccounts' }))
  ];

  const pendingCount = allPending.length;

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
    const updated = accounts.map(acc => {
      if (acc.email?.trim().toLowerCase() === email?.trim().toLowerCase()) {
        return { ...acc, status: 'Approved' };
      }
      return acc;
    });
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.location.reload();
  };

  const handleReject = (email, storageKey, requestId) => {
    if(!window.confirm("Are you sure you want to reject/delete this request?")) return;

    if (storageKey === 'pendingRequests') {
        const result = processRejection(requestId);
        if (result.success) {
            window.location.reload();
        }
        return;
    }

    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = accounts.filter(acc => acc.email?.trim().toLowerCase() !== email?.trim().toLowerCase());
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.location.reload();
  };

  const handleApproveDeletion = (id) => {
    if(!window.confirm("Approve this deletion? Final deletion only occurs when all required administrators have approved.")) return;
    const isFinal = approveDeletion(id, 'super-admin');
    if (isFinal) {
      alert("Final approval received. The entity and its subordinates have been permanently deleted.");
    } else {
      alert("Your approval (Super Admin) has been recorded. Waiting for other required approvals.");
    }
    window.location.reload();
  };

  const handleRejectDeletion = (id) => {
    rejectDeletion(id);
    window.location.reload();
  };

  const handleDelete = (email, storageKey, entityType) => {
    let confirmMsg = `Are you sure you want to delete this ${entityType}?`;
    
    if (entityType === 'Hub') {
      confirmMsg = "This Hub information will be deleted. Passing Hub info to Stores where necessary. Proceed?";
    } else if (entityType === 'Store') {
      confirmMsg = "This Store information will be deleted. Proceed?";
    }

    if (!window.confirm(confirmMsg)) return;
    
    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const itemToDelete = accounts.find(acc => acc.email?.trim().toLowerCase() === email?.trim().toLowerCase());
    
    if (itemToDelete) {
      const updated = accounts.filter(acc => acc.email?.trim().toLowerCase() !== email?.trim().toLowerCase());
      localStorage.setItem(storageKey, JSON.stringify(updated));
      notifySubordinates(entityType, itemToDelete);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage the entire Prime Basket hierarchy from one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/hub-signup', { state: { creatorRole: 'super' } })}
            className="h-[42px] min-w-[150px] px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create a Hub Account
          </button>
          <BypassDropdown adminRole="super" />
          <button 
            onClick={() => {
              if(window.confirm("WARNING: This will CLEAR ALL accounts and data from your browser to fix any broken dropdowns. Are you sure?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="h-[42px] min-w-[150px] px-4 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Reset All Data
          </button>
        </div>
      </header>
      
      {allPending.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Pending Approval Requests ({allPending.length})
            </h2>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-amber-50/50">
                  <tr>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Type</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Details</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase">Request Date</th>
                    <th className="px-6 py-3 text-xs font-bold text-amber-800 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {allPending.map((req, idx) => (
                    <tr 
                      key={idx} 
                      onClick={() => setSelectedRequest(req)} 
                      className="cursor-pointer hover:bg-amber-50/50 transition-colors text-sm"
                    >
                      <td className="px-6 py-4 font-bold text-amber-700">{req.type}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{req.name || req.fullName || req.hubName || req.storeName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {req.email} <br/>
                        <span className="text-xs text-gray-400 capitalize">{req.state}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleApprove(req.email, req.key, req.id); }} 
                            className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleReject(req.email, req.key, req.id); }} 
                            className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {deletionRequests.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm animate-in zoom-in-95 duration-500 mb-8">
          <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Pending Deletion Approvals ({deletionRequests.length})
          </h2>
          <div className="bg-white rounded-2xl overflow-hidden border border-red-100 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-red-50/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-red-800 uppercase">Entity</th>
                  <th className="px-6 py-3 text-xs font-bold text-red-800 uppercase">Requested By</th>
                  <th className="px-6 py-3 text-xs font-bold text-red-800 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {deletionRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{req.entityType}: {req.entityData.fullName || req.entityData.hubName || req.entityData.storeName}</p>
                      <p className="text-xs text-gray-500">{req.entityData.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600 uppercase">{req.requesterRole.replace('-', ' ')}</td>
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

      {/* System Hierarchy Overview */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          System Hierarchy
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {[
            { label: 'Hubs', count: counts.hub, path: '/hub-dashboard', color: 'amber', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745V6c0-1.105 1.12-2 2.5-2h13c1.38 0 2.5.895 2.5 2v7.255z' },
            { label: 'Stores', count: counts.store, path: '/store-dashboard', color: 'purple', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z' },
          ].map((level, idx) => (
            <button
              key={idx}
              onClick={() => navigate(level.path)}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group text-left"
            >
              <div className={`w-12 h-12 rounded-xl bg-${level.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <svg className={`w-6 h-6 text-${level.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={level.icon} />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{level.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{level.count}</p>
              <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold group-hover:gap-2 transition-all">
                Access Dashboard
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard 
          title="Active Hubs" 
          value={counts.hub.toString() || '0'} 
          trend="up" 
          color="bg-amber-50 text-amber-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatsCard 
          title="Pending Approvals" 
          value={pendingCount.toString() || '0'} 
          color="bg-emerald-50 text-emerald-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        {/* <StatsCard 
          title="System Logs" 
          value="1,284" 
          trend="down" 
          trendValue="2%"
          color="bg-blue-50 text-blue-600"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        /> */}
      </div>

      {/* Admin Portals Overview */}
      <section className="mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Login Portals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">Login Portals</h2>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Entry</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {[
                { label: 'Hub Admin', path: '/hub-login', color: 'amber' },
                { label: 'Store Admin', path: '/store-login', color: 'purple' },
              ].map((portal, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(portal.path)}
                  className={`group relative overflow-hidden bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-${portal.color}-200 transition-all text-left`}
                >
                  <div className={`w-10 h-10 bg-${portal.color}-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-5 h-5 text-${portal.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xs text-gray-900 group-hover:text-amber-600 transition-colors uppercase tracking-widest leading-relaxed">{portal.label}</h3>
                </button>
              ))}
            </div>
          </div>

          {/* Creation Portals */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 border-l-4 border-emerald-600 pl-3">Creation Portals</h2>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Setup</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              {[
                { label: 'Create Hub', path: '/hub-signup', color: 'amber' },
                { label: 'Create Store', path: '/store-signup', color: 'purple' },
              ].map((portal, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(portal.path)}
                  className={`group relative overflow-hidden bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-${portal.color}-200 transition-all text-left`}
                >
                  <div className={`w-10 h-10 bg-${portal.color}-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <svg className={`w-5 h-5 text-${portal.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-xs text-gray-900 group-hover:text-emerald-600 transition-colors uppercase tracking-widest leading-relaxed">{portal.label}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        {/* Hubs Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Hubs</h2>
            <button onClick={() => navigate('/hub-list')} className="text-amber-600 text-sm font-semibold hover:text-amber-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hub</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredHubs.length > 0 ? filteredHubs.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-6 py-3 font-medium text-gray-900">{row.hubName}</td>
                    <td className="px-6 py-3 text-gray-500">{row.branchName}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Pending Deletion' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {row.status || 'Approved'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleDelete(row.email, 'hubAccounts', 'Hub')} className="text-red-600 hover:text-red-800 font-bold p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No matches found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Recent Stores</h2>
            <button onClick={() => navigate('/store-list')} className="text-purple-600 text-sm font-semibold hover:text-purple-700 transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto min-h-[200px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Store</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hub</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStores.length > 0 ? filteredStores.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors text-sm">
                    <td className="px-6 py-3 font-medium text-gray-900">{row.storeName}</td>
                    <td className="px-6 py-3 text-gray-500">{row.hubName}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        row.status === 'Pending Deletion' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {row.status || 'Approved'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleDelete(row.email, 'storeAccounts', 'Store')} className="text-red-600 hover:text-red-800 font-bold p-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400 italic">No matches found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <RequestDetailsModal 
        request={selectedRequest} 
        onClose={() => setSelectedRequest(null)} 
      />
    </div>
  );
}

export default Home;
