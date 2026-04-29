/**
 * Notification Utility for Dashboard
 * Manages messages sent between admin levels on entity deletion.
 */

const STORAGE_KEYS = {
  'State Admin': 'stateAdminAccounts',
  'State': 'stateAdminAccounts',
  'Region': 'regionAccounts',
  'Branch': 'branchAccounts',
  'Hub': 'hubAccounts',
  'Store': 'storeAccounts'
};

const moveToTrash = (item, type) => {
  let trashedAdmins = JSON.parse(localStorage.getItem('trashed_admins')) || [];
  trashedAdmins.push({
    ...item,
    name: item.name || item.fullName || item.hubName || item.storeName || 'N/A',
    deletedAt: new Date().toISOString(),
    type: type
  });
  localStorage.setItem('trashed_admins', JSON.stringify(trashedAdmins));
};

/**
 * Creates a deletion request that requires multiple levels of approval.
 */
export const requestDeletion = (entityType, entityData, requesterRole) => {
  const requests = JSON.parse(localStorage.getItem('deletionRequests') || '[]');
  
  // Mark the account as Pending Deletion in its storage
  const storageKey = STORAGE_KEYS[entityType];
  if (storageKey) {
    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = accounts.map(acc => 
      acc.email?.trim().toLowerCase() === entityData.email?.trim().toLowerCase() ? { ...acc, status: 'Pending Deletion' } : acc
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  // Determine ALL parent levels that must approve (Multi-Level Approval)
  let requiredApprovals = ['super-admin'];
  switch (entityType) {
    case 'Region':
      requiredApprovals.push('state-admin');
      break;
    case 'Branch':
      requiredApprovals.push('state-admin', 'region-admin');
      break;
    case 'Hub':
      requiredApprovals.push('state-admin', 'region-admin', 'branch-admin');
      break;
    case 'Store':
      requiredApprovals.push('state-admin', 'region-admin', 'branch-admin', 'hub-admin');
      break;
  }

  const newRequest = {
    id: `del-${Date.now()}`,
    entityType,
    entityData,
    requesterRole,
    requiredApprovals,
    approvedBy: [], // Array of roles that have already approved
    status: 'Pending',
    timestamp: new Date().toISOString()
  };

  requests.push(newRequest);
  localStorage.setItem('deletionRequests', JSON.stringify(requests));
  return newRequest;
};

/**
 * Gets deletion requests that the current user is authorized to approve and hasn't already.
 */
export const getDeletionRequestsForUser = (role, userAuth) => {
  const requests = JSON.parse(localStorage.getItem('deletionRequests') || '[]');
  
  return requests.filter(req => {
    if (req.status !== 'Pending') return false;
    
    // Safety check for legacy requests missing requiredApprovals
    if (!req.requiredApprovals || !Array.isArray(req.requiredApprovals)) return false;
    
    // Check if current user's role is in required list AND hasn't already approved
    if (!req.requiredApprovals.includes(role)) return false;
    if (req.approvedBy && req.approvedBy.includes(role)) return false;

    if (role === 'super-admin') return true;

    // For other admins, filter by hierarchy (e.g., State Admin only sees requests from their state)
    if (userAuth.state && req.entityData.state !== userAuth.state) return false;
    if (userAuth.regionName && (req.entityData.regionName !== userAuth.regionName && req.entityData.region !== userAuth.regionName)) return false;
    if (userAuth.branchName && (req.entityData.branchName !== userAuth.branchName && req.entityData.branch !== userAuth.branchName)) return false;
    if (userAuth.hubName && (req.entityData.hubName !== userAuth.hubName && req.entityData.hub !== userAuth.hubName)) return false;

    return true;
  });
};

/**
 * Approves a deletion request from the current role.
 * Executes final deletion ONLY after all required party approvals are collected.
 */
export const approveDeletion = (requestId, currentRole) => {
  const requests = JSON.parse(localStorage.getItem('deletionRequests') || '[]');
  const requestIdx = requests.findIndex(r => r.id === requestId);
  
  if (requestIdx === -1) return;
  const request = requests[requestIdx];

  // Initialize arrays if missing (legacy data)
  if (!request.approvedBy) request.approvedBy = [];
  if (!request.requiredApprovals) request.requiredApprovals = ['super-admin'];

  // 1. Add current role to approvedBy
  if (!request.approvedBy.includes(currentRole)) {
    request.approvedBy.push(currentRole);
  }

  // 2. Check if ALL required approvals are met
  const isFullyApproved = request.requiredApprovals.every(role => request.approvedBy.includes(role));

  if (isFullyApproved) {
    // 3. Final Deletion: Remove the entity from its storage
    const storageKey = STORAGE_KEYS[request.entityType];
    if (storageKey) {
      const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const itemToDelete = accounts.find(acc => acc.email?.trim().toLowerCase() === request.entityData.email?.trim().toLowerCase());
      if (itemToDelete) {
        moveToTrash(itemToDelete, request.entityType);
      }
      const updated = accounts.filter(acc => acc.email?.trim().toLowerCase() !== request.entityData.email?.trim().toLowerCase());
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }

    // 4. Mark request as completed (remove from pending)
    requests.splice(requestIdx, 1);

    // 5. Notify Downward (Subordinates)
    notifySubordinates(request.entityType, request.entityData);
  } else {
    // Partial approval - just update requests storage
    requests[requestIdx] = request;
  }

  localStorage.setItem('deletionRequests', JSON.stringify(requests));
  return isFullyApproved;
};

/**
 * Rejects a deletion request immediately and cancels the entire workflow.
 */
export const rejectDeletion = (requestId) => {
  const requests = JSON.parse(localStorage.getItem('deletionRequests') || '[]');
  const request = requests.find(r => r.id === requestId);
  
  if (!request) return;

  // Restore status in target entity's storage
  const storageKey = STORAGE_KEYS[request.entityType];
  if (storageKey) {
    const accounts = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updated = accounts.map(acc => 
      acc.email?.trim().toLowerCase() === request.entityData.email?.trim().toLowerCase() ? { ...acc, status: 'Approved' } : acc
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  // Remove request immediately (any single rejection cancels everything)
  const updatedRequests = requests.filter(r => r.id !== requestId);
  localStorage.setItem('deletionRequests', JSON.stringify(updatedRequests));
};

/**
 * Notifies sub-entities when a parent is deleted and triggers cascading deletion.
 */
export const notifySubordinates = (deletedEntityType, deletedEntityData) => {
  const notifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
  const timestamp = new Date().toISOString();
  
  const createNote = (role, criteria, message) => ({
    id: Date.now() + Math.random(),
    recipientRole: role,
    criteria,
    message,
    timestamp,
    read: false
  });

  let message = `Notice: Your parent ${deletedEntityType} (${entityName}) has been removed. All associated sub-entities are also being removed.`;
  if (deletedEntityType === 'State Admin') {
    message = "State Admin access is now under Country. This State Admin data is being passed to Regions, Branches, Hubs, and Stores, and then deleted.";
  } else if (deletedEntityType === 'Region') {
    message = "Region admin data is now under a State and being deleted. Information is passing to Branches, Hubs, and Stores.";
  } else if (deletedEntityType === 'Branch') {
    message = "Branch information is now under a Region and being deleted. Branch information data is being sent to Hubs and Stores.";
  } else if (deletedEntityType === 'Hub') {
    message = "Hub information is now under a Branch and being deleted. Branch information is being passed to Stores.";
  } else if (deletedEntityType === 'Store') {
    message = "Store information is now under a Hub.";
  }

  const state = deletedEntityData.state;
  const region = deletedEntityData.regionName || deletedEntityData.region;
  const branch = deletedEntityData.branchName || deletedEntityData.branch;
  const hub = deletedEntityData.hubName || deletedEntityData.hub;

  // Determine who to notify below this entity (before they are deleted)
  switch (deletedEntityType) {
    case 'State':
    case 'State Admin':
      notifications.push(createNote('region-admin', { state }, message));
      notifications.push(createNote('branch-admin', { state }, message));
      notifications.push(createNote('hub-admin', { state }, message));
      notifications.push(createNote('store-admin', { state }, message));
      break;
    case 'Region':
      notifications.push(createNote('branch-admin', { state, regionName: region }, message));
      notifications.push(createNote('hub-admin', { state, regionName: region }, message));
      notifications.push(createNote('store-admin', { state, regionName: region }, message));
      break;
    case 'Branch':
      notifications.push(createNote('hub-admin', { state, regionName: region, branchName: branch }, message));
      notifications.push(createNote('store-admin', { state, regionName: region, branchName: branch }, message));
      break;
    case 'Hub':
      notifications.push(createNote('store-admin', { state, regionName: region, branchName: branch, hubName: hub }, message));
      break;
  }

  localStorage.setItem('dashboardNotifications', JSON.stringify(notifications));

  // Perform cascading deletion of actual account data
  cascadeDeleteSubordinates(deletedEntityType, deletedEntityData);
};

/**
 * Physically removes subordinate account data from localStorage.
 */
export const cascadeDeleteSubordinates = (deletedEntityType, deletedEntityData) => {
  const state = deletedEntityData.state;
  const region = deletedEntityData.regionName || deletedEntityData.region;
  const branch = deletedEntityData.branchName || deletedEntityData.branch;
  const hub = deletedEntityData.hubName || deletedEntityData.hub;

  const filterOut = (key, predicate) => {
    const data = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = data.filter(item => !predicate(item));
    localStorage.setItem(key, JSON.stringify(updated));
  };

  switch (deletedEntityType) {
    case 'State':
    case 'State Admin':
      filterOut('regionAccounts', item => item.state === state);
      filterOut('branchAccounts', item => item.state === state);
      filterOut('hubAccounts', item => item.state === state);
      filterOut('storeAccounts', item => item.state === state);
      break;
    case 'Region':
      filterOut('branchAccounts', item => item.state === state && (item.regionName === region || item.region === region));
      filterOut('hubAccounts', item => item.state === state && (item.regionName === region || item.region === region));
      filterOut('storeAccounts', item => item.state === state && (item.regionName === region || item.region === region));
      break;
    case 'Branch':
      filterOut('hubAccounts', item => item.state === state && (item.regionName === region || item.region === region) && (item.branchName === branch || item.branch === branch));
      filterOut('storeAccounts', item => item.state === state && (item.regionName === region || item.region === region) && (item.branchName === branch || item.branch === branch));
      break;
    case 'Hub':
      filterOut('storeAccounts', item => item.state === state && (item.regionName === region || item.region === region) && (item.branchName === branch || item.branch === branch) && (item.hubName === hub || item.hub === hub));
      break;
  }
};

export const notifyParent = (entityType, entityData) => {
  const notifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
  
  let recipientRole = '';
  let criteria = {};
  let entityLabel = entityData.adminName || entityData.regionName || entityData.region || entityData.branchName || entityData.branch || entityData.hubName || entityData.hub || entityData.storeName || entityData.fullName;

  switch (entityType) {
    case 'Region':
      recipientRole = 'state-admin';
      criteria = { state: entityData.state };
      break;
    case 'Branch':
      recipientRole = 'region-admin';
      criteria = { state: entityData.state, regionName: entityData.regionName || entityData.region };
      break;
    case 'Hub':
      recipientRole = 'branch-admin';
      criteria = { 
        state: entityData.state, 
        regionName: entityData.regionName || entityData.region,
        branchName: entityData.branchName || entityData.branch
      };
      break;
    case 'Store':
      recipientRole = 'hub-admin';
      criteria = { 
        state: entityData.state, 
        regionName: entityData.regionName || entityData.region,
        branchName: entityData.branchName || entityData.branch,
        hubName: entityData.hubName || entityData.hub
      };
      break;
    default:
        return;
  }

  const message = `${entityType} "${entityLabel}" has been removed and all sub-entities have been notified.`;

  notifications.push({
    id: Date.now() + Math.random(),
    recipientRole,
    criteria,
    message,
    timestamp: new Date().toISOString(),
    read: false
  });

  localStorage.setItem('dashboardNotifications', JSON.stringify(notifications));
};

export const getNotificationsForUser = (role, userAuth) => {
  const notifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
  
  return notifications.filter(n => {
    if (n.recipientRole !== role) return false;
    
    // Check if user matches criteria (e.g., same state)
    for (let key in n.criteria) {
      if (userAuth[key] !== n.criteria[key]) return false;
    }
    return true;
  });
};

export const clearNotification = (id) => {
  const notifications = JSON.parse(localStorage.getItem('dashboardNotifications') || '[]');
  const updated = notifications.filter(n => n.id !== id);
  localStorage.setItem('dashboardNotifications', JSON.stringify(updated));
};

