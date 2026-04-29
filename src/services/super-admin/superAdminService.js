import { db } from '@/config/firebase';
import { ref, get, set, push, update, remove } from 'firebase/database';

/**
 * Super Admin Service - Firebase Realtime Database Implementation
 */
let cache = {
  hubs: null,
  stores: null,
  admins: null,
  lastFetch: {
    hubs: 0,
    stores: 0,
    admins: 0
  }
};

const CACHE_DURATION = 5000; // 5 seconds for near real-time sync

const generateUniqueId = (prefix) => {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${random}`;
};

// Kenya Mobile Validation: Exactly 9 digits (excluding prefix)
export const validateKenyaMobile = (mobile) => {
  if (!mobile) return false;
  // Kenya mobile should be exactly 9 digits (e.g. 712345678)
  return /^\d{9}$/.test(mobile);
};

export const superAdminService = {
  // --- Hubs ---
  getHubs: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cache.hubs && (now - cache.lastFetch.hubs < CACHE_DURATION)) {
      return cache.hubs;
    }

    const hubsRef = ref(db, 'hubs');
    const snapshot = await get(hubsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      cache.hubs = Object.keys(data).map(key => ({ ...data[key], id: key }));
      cache.lastFetch.hubs = now;
      return cache.hubs;
    }
    return [];
  },

  getHubById: async (id) => {
    const hubRef = ref(db, `hubs/${id}`);
    const snapshot = await get(hubRef);
    if (snapshot.exists()) {
      return { ...snapshot.val(), id };
    }
    return null;
  },

  createHub: async (hubData) => {
    const hubsRef = ref(db, 'hubs');
    const newHubRef = push(hubsRef);
    const newHub = {
      ...hubData,
      hubCustomId: generateUniqueId('HUB'),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    await set(newHubRef, newHub);

    // Create a corresponding hub_admin user
    const usersRef = ref(db, 'users');
    const newUserRef = push(usersRef);
    await set(newUserRef, {
      uid: newUserRef.key,
      email: hubData.email.toLowerCase(),
      fullName: hubData.ownerName,
      role: 'hub_admin',
      status: 'Active', // Default user status to active so they can log in once hub is approved
      hubId: newHubRef.key,
      createdAt: new Date().toISOString()
    });

    cache.hubs = null; // Clear cache
    return { ...newHub, id: newHubRef.key };
  },

  updateHubStatus: async (id, status) => {
    const hubRef = ref(db, `hubs/${id}`);
    await update(hubRef, { status });
    cache.hubs = null; // Clear cache
    return { id, status };
  },

  updateHub: async (id, updatedData) => {
    const hubRef = ref(db, `hubs/${id}`);
    await update(hubRef, updatedData);

    // Also update the associated hub_admin user if email/ownerName/password changed
    const usersRef = ref(db, 'users');
    const usersSnap = await get(usersRef);
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      const adminId = Object.keys(users).find(key => users[key].hubId === id);
      if (adminId) {
        const userUpdate = {};
        if (updatedData.email) userUpdate.email = updatedData.email.toLowerCase();
        if (updatedData.ownerName || updatedData.managerName) userUpdate.fullName = updatedData.ownerName || updatedData.managerName;
        if (updatedData.password) userUpdate.password = updatedData.password;
        if (Object.keys(userUpdate).length > 0) {
          await update(ref(db, `users/${adminId}`), userUpdate);
        }
      }
    }

    return { ...updatedData, id };
  },

  deleteHub: async (id) => {
    const hubRef = ref(db, `hubs/${id}`);
    const snapshot = await get(hubRef);
    if (snapshot.exists()) {
      const hubData = snapshot.val();
      
      // Also find and delete associated hub_admin user
      const usersRef = ref(db, 'users');
      const usersSnap = await get(usersRef);
      
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        const adminId = Object.keys(users).find(key => users[key].hubId === id);
        
        if (adminId) {
          const userData = users[adminId];
          await superAdminService.moveToTrash(userData, 'Admin');
          await remove(ref(db, `users/${adminId}`));
        }
      }

      await superAdminService.moveToTrash(hubData, 'Hub');
      await remove(hubRef);
      cache.hubs = null; // Clear cache
      cache.admins = null;
      return true;
    }
    throw new Error('Hub not found');
  },

  // --- Stores ---
  getStores: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cache.stores && (now - cache.lastFetch.stores < CACHE_DURATION)) {
      return cache.stores;
    }

    const storesRef = ref(db, 'stores');
    const snapshot = await get(storesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      cache.stores = Object.keys(data).map(key => ({ ...data[key], id: key }));
      cache.lastFetch.stores = now;
      return cache.stores;
    }
    return [];
  },

  getStoreById: async (id) => {
    const storeRef = ref(db, `stores/${id}`);
    const snapshot = await get(storeRef);
    if (snapshot.exists()) {
      return { ...snapshot.val(), id };
    }
    return null;
  },

  createStore: async (storeData) => {
    const storesRef = ref(db, 'stores');
    const newStoreRef = push(storesRef);
    const newStore = {
      ...storeData,
      storeCustomId: generateUniqueId('STR'),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    await set(newStoreRef, newStore);

    // Create a corresponding store_admin user
    const usersRef = ref(db, 'users');
    const newUserRef = push(usersRef);
    await set(newUserRef, {
      uid: newUserRef.key,
      email: storeData.email.toLowerCase(),
      fullName: storeData.ownerName,
      role: 'store_admin',
      status: 'Pending',
      storeId: newStoreRef.key,
      hubId: storeData.hubId,
      createdAt: new Date().toISOString()
    });

    cache.stores = null; // Clear cache
    return { ...newStore, id: newStoreRef.key };
  },

  updateStoreStatus: async (id, status) => {
    const storeRef = ref(db, `stores/${id}`);
    await update(storeRef, { status });

    // Also update the associated store_admin user status
    const usersRef = ref(db, 'users');
    const usersSnap = await get(usersRef);
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      const adminId = Object.keys(users).find(key => users[key].storeId === id);
      if (adminId) {
        await update(ref(db, `users/${adminId}`), { status });
      }
    }

    cache.stores = null; // Clear cache
    return { id, status };
  },

  updateStore: async (id, updatedData) => {
    const storeRef = ref(db, `stores/${id}`);
    await update(storeRef, updatedData);

    // Also update the associated store_admin user
    const usersRef = ref(db, 'users');
    const usersSnap = await get(usersRef);
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      const adminId = Object.keys(users).find(key => users[key].storeId === id);
      if (adminId) {
        const userUpdate = {};
        if (updatedData.email) userUpdate.email = updatedData.email.toLowerCase();
        if (updatedData.ownerName || updatedData.owner_name) userUpdate.fullName = updatedData.ownerName || updatedData.owner_name;
        if (updatedData.password) userUpdate.password = updatedData.password;
        if (Object.keys(userUpdate).length > 0) {
          await update(ref(db, `users/${adminId}`), userUpdate);
        }
      }
    }

    return { ...updatedData, id };
  },

  deleteStore: async (id) => {
    const storeRef = ref(db, `stores/${id}`);
    const snapshot = await get(storeRef);
    if (snapshot.exists()) {
      const storeData = snapshot.val();

      // Also find and delete associated store_admin user
      const usersRef = ref(db, 'users');
      const usersSnap = await get(usersRef);
      
      if (usersSnap.exists()) {
        const users = usersSnap.val();
        const adminId = Object.keys(users).find(key => users[key].storeId === id);
        
        if (adminId) {
          const userData = users[adminId];
          await superAdminService.moveToTrash(userData, 'Admin');
          await remove(ref(db, `users/${adminId}`));
        }
      }

      await superAdminService.moveToTrash(storeData, 'Store');
      await remove(storeRef);
      cache.stores = null; // Clear cache
      cache.admins = null;
      return true;
    }
    throw new Error('Store not found');
  },

  // --- Admins (Mapped to /users path) ---
  getAdmins: async (forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cache.admins && (now - cache.lastFetch.admins < CACHE_DURATION)) {
      return cache.admins;
    }

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    const admins = [];
    if (snapshot.exists()) {
      const allUsers = snapshot.val();
      Object.entries(allUsers).forEach(([id, val]) => {
        if (val.role === 'hub_admin' || val.role === 'store_admin') {
          admins.push({ ...val, id });
        }
      });
    }
    
    cache.admins = admins;
    cache.lastFetch.admins = now;
    return admins;
  },

  updateAdminStatus: async (id, status) => {
    const userRef = ref(db, `users/${id}`);
    await update(userRef, { status });
    return { id, status };
  },

  createAdmin: async (adminData) => {
    const usersRef = ref(db, 'users');
    const newUserRef = push(usersRef);
    const role = adminData.entityType === 'Hub' ? 'hub_admin' : 'store_admin';
    
    const newUser = {
      uid: newUserRef.key,
      email: adminData.email.toLowerCase(),
      fullName: adminData.name,
      role: role,
      status: 'Active',
      password: adminData.password || Math.random().toString(36).slice(-8),
      createdAt: new Date().toISOString()
    };

    if (adminData.entityType === 'Hub') {
      newUser.hubId = adminData.entityId;
    } else {
      newUser.storeId = adminData.entityId;
      // Also find the hubId for this store to link them correctly
      const storeRef = ref(db, `stores/${adminData.entityId}`);
      const storeSnap = await get(storeRef);
      if (storeSnap.exists()) {
        newUser.hubId = storeSnap.val().hubId;
      }
    }
    
    await set(newUserRef, newUser);
    cache.admins = null; // Clear cache
    return { ...newUser, id: newUserRef.key };
  },

  updateAdmin: async (id, updatedData) => {
    const adminRef = ref(db, `users/${id}`);
    await update(adminRef, updatedData);
    cache.admins = null;
    return { ...updatedData, id };
  },

  deleteAdmin: async (id) => {
    const userRef = ref(db, `users/${id}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      await superAdminService.moveToTrash(userData, 'Admin');
      await remove(userRef);
      cache.admins = null; // Clear cache
      return true;
    }
    throw new Error('Admin not found');
  },

  // --- Super Admins ---
  getSuperAdmins: async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data)
        .filter(key => data[key].role === 'super_admin')
        .map(key => ({ ...data[key], id: key }));
    }
    return [];
  },

  createSuperAdmin: async (adminData) => {
    const usersRef = ref(db, 'users');
    const newAdminRef = push(usersRef);
    const newAdmin = {
      ...adminData,
      role: 'super_admin',
      createdAt: new Date().toISOString()
    };
    await set(newAdminRef, newAdmin);
    cache.admins = null; // Clear cache
    return { ...newAdmin, id: newAdminRef.key };
  },

  updateSuperAdminStatus: async (id, status) => {
    const adminRef = ref(db, `users/${id}`);
    await update(adminRef, { status });
    cache.admins = null; // Clear cache
    return { id, status };
  },

  updateSuperAdmin: async (id, updatedData) => {
    const adminRef = ref(db, `users/${id}`);
    await update(adminRef, updatedData);
    cache.admins = null; // Clear cache
    return { ...updatedData, id };
  },

  deleteSuperAdmin: async (id) => {
    const adminRef = ref(db, `users/${id}`);
    const snapshot = await get(adminRef);
    if (snapshot.exists()) {
      const adminData = snapshot.val();
      await superAdminService.moveToTrash(adminData, 'Admin');
      await remove(adminRef);
      cache.admins = null; // Clear cache
      return true;
    }
    throw new Error('Super Admin not found');
  },

  updateSuperAdminPassword: async (userId, newPassword) => {
    const userRef = ref(db, `users/${userId}`);
    await update(userRef, { 
      password: newPassword, 
      needsPasswordChange: false 
    });
    return true;
  },

  // --- Trash ---
  getTrashedAdmins: async () => {
    const trashRef = ref(db, 'trash');
    const snapshot = await get(trashRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const allTrashed = Object.keys(data).map(key => ({ ...data[key], id: key }));
      
      // Auto-cleanup: Delete items older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const validTrashed = [];
      for (const item of allTrashed) {
        const deletedAt = new Date(item.deletedAt);
        if (deletedAt < thirtyDaysAgo) {
          // Permanent delete automatically
          await remove(ref(db, `trash/${item.id}`));
        } else {
          validTrashed.push(item);
        }
      }
      
      return validTrashed;
    }
    return [];
  },

  moveToTrash: async (item, type) => {
    const trashRef = ref(db, 'trash');
    const newItemRef = push(trashRef);
    await set(newItemRef, {
      ...item,
      name: item.name || item.fullName || item.hubName || item.storeName || 'N/A',
      deletedAt: new Date().toISOString(),
      type: type
    });
  },

  restoreAdmin: async (id, type) => {
    const trashItemRef = ref(db, `trash/${id}`);
    const snapshot = await get(trashItemRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const restored = { ...data };
      delete restored.deletedAt;
      delete restored.type;
      delete restored.id;

      let targetPath = 'users';
      if (type === 'Hub') targetPath = 'hubs';
      if (type === 'Store') targetPath = 'stores';

      const targetRef = ref(db, `${targetPath}/${id}`);
      await set(targetRef, restored);
      await remove(trashItemRef);
      
      // Invalidate caches
      cache.hubs = null;
      cache.stores = null;
      cache.admins = null;
      
      return true;
    }
    throw new Error('Item not found in trash');
  },

  permanentDeleteAdmin: async (id) => {
    const trashItemRef = ref(db, `trash/${id}`);
    await remove(trashItemRef);
    return true;
  },

  checkEmailExists: async (email) => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      return Object.values(users).some(u => u.email.toLowerCase() === email.toLowerCase());
    }
    return false;
  }
};
