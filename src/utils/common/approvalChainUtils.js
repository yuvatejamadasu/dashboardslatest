/**
 * approvalChainUtils.js
 * 
 * Reusable, fully dynamic approval-chain builder.
 * No per-role hardcoding — driven entirely by the HIERARCHY array.
 */

// ── Global hierarchy (LOW → HIGH) ────────────────────────────────────────────
export const HIERARCHY = ['store', 'hub', 'super'];

// Map each hierarchy level to its database storage key
const DB_KEY_MAP = {
  store:  'storeAccounts',
  hub:    'hubAccounts',
  super:  'approvedUsers', // Super admins
};

// Map each hierarchy level to its localStorage auth key
const AUTH_KEY_MAP = {
  store:  'storeAdminAuth',
  hub:    'hubAdminAuth',
  super:  'superAdminAuth',
};

/**
 * Check if the database for a given level has any approved users in it.
 * This determines if the level "exists" for hierarchical routing.
 */
export const collectParentIds = () => {
  const existingLevels = {};
  HIERARCHY.forEach((level) => {
    if (level === 'super') {
      existingLevels[level] = true; // Super Admin always exists
      return;
    }
    const dbKey = DB_KEY_MAP[level];
    if (!dbKey) { existingLevels[level] = false; return; }
    
    // Check if there's any admin created at this level
    const accounts = JSON.parse(sessionStorage.getItem(dbKey) || '[]');
    existingLevels[level] = accounts.length > 0;
  });
  return existingLevels;
};

/**
 * Build the approval chain for a new entity being created.
 *
 * @param {string} typeLower  - e.g. 'region', 'branch', 'hub', 'store'
 * @param {{ id: string, role: string }} createdBy - e.g. { id: '123', role: 'state' }
 * @returns {{ approvalChain: string[], status: 'pending'|'approved' }}
 */
export const buildApprovalChain = (typeLower, createdBy) => {
  const typeIdx = HIERARCHY.indexOf(typeLower);
  if (typeIdx === -1) return { approvalChain: [], status: 'approved' };

  // All levels above the created type
  const candidateLevels = HIERARCHY.slice(typeIdx + 1); // e.g. branch → ['region','state','super']

  const existingLevels = collectParentIds();

  // Keep only levels that EXIST in the DB AND are not the creator
  const chain = candidateLevels.filter((level) => {
    const exists = existingLevels[level];
    const isCreator = createdBy && createdBy.role === level;
    return exists && !isCreator;
  });

  return {
    approvalChain: chain,
    status: chain.length === 0 ? 'approved' : 'pending',
  };
};

/**
 * Get the role-label for the current admin (used to find "createdBy.role").
 * Checks all auth keys in descending hierarchy order (highest first).
 */
export const getCreatorInfo = () => {
  // Check from highest to lowest so the most-privileged session wins
  const reversed = [...HIERARCHY].reverse();
  for (const level of reversed) {
    const authKey = AUTH_KEY_MAP[level];
    if (!authKey) continue;
    const auth = JSON.parse(sessionStorage.getItem(authKey) || 'null');
    if (auth && auth.loggedIn) {
      return { id: auth.id || auth.email || '', role: level };
    }
  }
  return null;
};

/**
 * Get the valid "bypass create" options for a given admin role.
 * Returns levels BELOW the admin (i.e. the admin can create them).
 *
 * @param {string} adminRole - e.g. 'state', 'region', 'branch', 'hub', 'store'
 * @returns {string[]} Array of level names e.g. ['branch','hub','store']
 */
export const getBypassOptions = (adminRole) => {
  const roleIdx = HIERARCHY.indexOf(adminRole);
  if (roleIdx <= 0) return []; // store admin → nothing below
  // All levels below the role (excluding itself)
  return HIERARCHY.slice(0, roleIdx).reverse(); // highest-below first
};

/**
 * Map a bypass level name to its signup route.
 */
export const BYPASS_ROUTE_MAP = {
  hub:    '/hub-signup',
  store:  '/store-signup',
};
