import { db } from '@/config/firebase';
import { ref, get, update, push, set } from 'firebase/database';

let cache = {
  stores: {}, // storeId -> list of products
  hubStores: {}, // hubId -> list of stores
  products: {}, // hubId -> list of products
  lastFetch: {}
};

const CACHE_DURATION = 5000; // 5 seconds

const generateUniqueId = (prefix) => {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const hubAdminService = {
  getStoresByHub: async (hubId, forceRefresh = false) => {
    const now = Date.now();
    const cacheKey = `hub_${hubId}`;
    if (!forceRefresh && cache.hubStores[cacheKey] && (now - (cache.lastFetch[cacheKey] || 0) < CACHE_DURATION)) {
      return cache.hubStores[cacheKey];
    }

    const storesRef = ref(db, 'stores');
    const snapshot = await get(storesRef);
    
    const results = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        const store = data[key];
        // Check both hubId and hub_id for compatibility
        if (String(store.hubId) === String(hubId) || String(store.hub_id) === String(hubId)) {
          results.push({ ...store, id: key });
        }
      });
    }

    cache.hubStores[cacheKey] = results;
    cache.lastFetch[cacheKey] = now;
    return results;
  },

  updateStoreStatus: async (storeId, status) => {
    const storeRef = ref(db, `stores/${storeId}`);
    await update(storeRef, { status });
    return { id: storeId, status };
  },

  updateStore: async (storeId, updatedData) => {
    const storeRef = ref(db, `stores/${storeId}`);
    await update(storeRef, updatedData);
    // Invalidate caches that might contain this store
    Object.keys(cache.hubStores).forEach(key => delete cache.hubStores[key]);
    return { ...updatedData, id: storeId };
  },

  getProducts: async (hubId, forceRefresh = false) => {
    const now = Date.now();
    const cacheKey = `products_${hubId}`;
    if (!forceRefresh && cache.products[cacheKey] && (now - (cache.lastFetch[cacheKey] || 0) < CACHE_DURATION)) {
      return cache.products[cacheKey];
    }

    // Get all stores for this hub first to know which storeIds to include
    const hubStores = await hubAdminService.getStoresByHub(hubId);
    const storeIds = hubStores.map(s => s.id);
    const storeMap = {};
    hubStores.forEach(s => {
      storeMap[s.id] = s.storeName || s.name || 'Unknown Store';
    });

    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    
    const results = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        const item = data[key];
        
        // 1. Direct products (added by hub)
        if (item.hubId && String(item.hubId) === String(hubId)) {
          results.push({ ...item, id: key, storeName: 'Hub', type: 'hub' });
        }
        
        // 2. Store products (if this key is one of the hub's stores)
        if (storeIds.includes(key)) {
          const storeProducts = item;
          // StoreProducts is a map of productId -> productData
          if (typeof storeProducts === 'object' && storeProducts !== null) {
            Object.keys(storeProducts).forEach(pId => {
              // Ensure we don't treat hubId property as a product map if it somehow got here
              if (pId !== 'hubId' && pId !== 'id') {
                results.push({ 
                  ...storeProducts[pId], 
                  id: pId, 
                  storeId: key, 
                  storeName: storeMap[key],
                  type: 'store'
                });
              }
            });
          }
        }
      });
    }

    cache.products[cacheKey] = results;
    cache.lastFetch[cacheKey] = now;
    return results;
  },

  addProducts: async (hubId, products) => {
    const productsRef = ref(db, 'products');
    const promises = products.map(product => {
      const newProductRef = push(productsRef);
      return set(newProductRef, {
        ...product,
        hubId,
        createdAt: new Date().toISOString()
      });
    });
    
    await Promise.all(promises);
    delete cache.products[`products_${hubId}`];
    return true;
  },

  deleteProduct: async (productId, hubId, storeId = null) => {
    const path = storeId ? `products/${storeId}/${productId}` : `products/${productId}`;
    const productRef = ref(db, path);
    await set(productRef, null);
    delete cache.products[`products_${hubId}`];
    return true;
  },

  getBrands: async (hubId, forceRefresh = false) => {
    const now = Date.now();
    const cacheKey = `brands_${hubId}`;
    if (!forceRefresh && cache.brands?.[cacheKey] && (now - (cache.lastFetch[cacheKey] || 0) < CACHE_DURATION)) {
      return cache.brands[cacheKey];
    }

    const brandsRef = ref(db, 'brands');
    const snapshot = await get(brandsRef);
    
    const results = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        const brand = data[key];
        if (String(brand.hubId) === String(hubId)) {
          results.push({ ...brand, id: key });
        }
      });
    }

    if (!cache.brands) cache.brands = {};
    cache.brands[cacheKey] = results;
    cache.lastFetch[cacheKey] = now;
    return results;
  },

  addBrand: async (hubId, brandData) => {
    const brandsRef = ref(db, 'brands');
    const newBrandRef = push(brandsRef);
    const newBrand = {
      name: brandData.name,
      image: brandData.image || null,
      hubId,
      createdAt: new Date().toISOString()
    };
    await set(newBrandRef, newBrand);
    if (cache.brands) delete cache.brands[`brands_${hubId}`];
    return { ...newBrand, id: newBrandRef.key };
  },

  updateBrand: async (brandId, updatedData) => {
    const brandRef = ref(db, `brands/${brandId}`);
    await update(brandRef, updatedData);
    // Invalidate brands cache
    if (cache.brands) cache.brands = {};
    return { ...updatedData, id: brandId };
  },

  deleteBrand: async (brandId, hubId) => {
    const brandRef = ref(db, `brands/${brandId}`);
    await set(brandRef, null);
    if (cache.brands) delete cache.brands[`brands_${hubId}`];
    return true;
  },

  getDeliveryPartners: async (hubId) => {
    const partnersRef = ref(db, 'delivery_partners');
    const snapshot = await get(partnersRef);
    const results = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        const partner = data[key];
        if (String(partner.hubId) === String(hubId)) {
          results.push({ ...partner, id: key });
        }
      });
    }
    return results;
  },

  addDeliveryPartner: async (hubId, partnerData) => {
    const partnersRef = ref(db, 'delivery_partners');
    const newPartnerRef = push(partnersRef);
    const newPartner = {
      ...partnerData,
      hubId,
      createdAt: new Date().toISOString()
    };
    await set(newPartnerRef, newPartner);
    return { ...newPartner, id: newPartnerRef.key };
  },

  getHubByEmail: async (email) => {
    const hubsRef = ref(db, 'hubs');
    const snapshot = await get(hubsRef);
    if (snapshot.exists()) {
      const hubs = snapshot.val();
      const hubId = Object.keys(hubs).find(key => hubs[key].email?.toLowerCase() === email.toLowerCase());
      if (hubId) {
        return { ...hubs[hubId], id: hubId };
      }
    }
    return null;
  },

  updateHub: async (hubId, updatedData) => {
    const hubRef = ref(db, `hubs/${hubId}`);
    await update(hubRef, updatedData);
    // Invalidate caches
    cache.hubStores = {};
    return true;
  },

  checkEmailExists: async (email) => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      return Object.values(users).some(u => u.email?.toLowerCase() === email.toLowerCase());
    }
    return false;
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

    // Invalidate cache
    delete cache.hubStores[`hub_${storeData.hubId}`];
    
    return { ...newStore, id: newStoreRef.key };
  },

  getStoreById: async (id) => {
    const storeRef = ref(db, `stores/${id}`);
    const snapshot = await get(storeRef);
    if (snapshot.exists()) {
      return { ...snapshot.val(), id };
    }
    return null;
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
          await set(ref(db, `users/${adminId}`), null);
        }
      }

      await set(storeRef, null);
      // Invalidate caches
      Object.keys(cache.hubStores).forEach(key => delete cache.hubStores[key]);
      return true;
    }
    return false;
  },

  getAdmins: async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data)
        .map(key => ({ ...data[key], id: key }))
        .filter(u => u.role === 'store_admin' || u.role === 'hub_admin');
    }
    return [];
  },

  updateAdmin: async (adminId, updatedData) => {
    const adminRef = ref(db, `users/${adminId}`);
    await update(adminRef, updatedData);
    return { ...updatedData, id: adminId };
  },

  deleteAdmin: async (adminId) => {
    const adminRef = ref(db, `users/${adminId}`);
    await set(adminRef, null);
    return true;
  }
};
