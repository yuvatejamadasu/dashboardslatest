import { db } from '@/config/firebase';
import { ref, get, update, push, set, remove } from 'firebase/database';

let cache = {
  products: {}, // storeId -> list of products
  lastFetch: {}
};

const CACHE_DURATION = 30000;

export const storeAdminService = {
  getProductsByStore: async (storeId, forceRefresh = false) => {
    const now = Date.now();
    if (!forceRefresh && cache.products[storeId] && (now - (cache.lastFetch[storeId] || 0) < CACHE_DURATION)) {
      return cache.products[storeId];
    }

    const productsRef = ref(db, `products/${storeId}`);
    const snapshot = await get(productsRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const results = Object.keys(data).map(key => ({ ...data[key], id: key }));
      cache.products[storeId] = results;
      cache.lastFetch[storeId] = now;
      return results;
    }
    return [];
  },

  addProduct: async (storeId, productData) => {
    const productsRef = ref(db, `products/${storeId}`);
    const newProductRef = push(productsRef);
    const newProduct = {
      ...productData,
      createdAt: new Date().toISOString()
    };
    await set(newProductRef, newProduct);
    delete cache.products[storeId]; // Clear cache
    return { ...newProduct, id: newProductRef.key };
  },

  updateProduct: async (storeId, productId, updatedData) => {
    const productRef = ref(db, `products/${storeId}/${productId}`);
    await update(productRef, updatedData);
    delete cache.products[storeId]; // Clear cache
    return { ...updatedData, id: productId };
  },

  deleteProduct: async (storeId, productId) => {
    const productRef = ref(db, `products/${storeId}/${productId}`);
    await remove(productRef);
    delete cache.products[storeId]; // Clear cache
    return true;
  },

  getHubProducts: async (hubId) => {
    const productsRef = ref(db, 'products');
    const snapshot = await get(productsRef);
    const results = [];
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.keys(data).forEach(key => {
        const product = data[key];
        // Check both hubId and hub_id for compatibility
        const productHubId = product.hubId || product.hub_id;
        if (productHubId && String(productHubId) === String(hubId)) {
          results.push({ ...product, id: key });
        }
      });
    }
    return results;
  },

  getStoreDetails: async (storeId) => {
    const storeRef = ref(db, `stores/${storeId}`);
    const snapshot = await get(storeRef);
    if (snapshot.exists()) {
      const storeData = { ...snapshot.val(), id: storeId };
      
      // If hubName is missing, try to fetch it
      if (!storeData.hubName) {
        const hubId = storeData.hubId || storeData.hub_id;
        if (hubId) {
          const hubRef = ref(db, `hubs/${hubId}`);
          const hubSnap = await get(hubRef);
          if (hubSnap.exists()) {
            storeData.hubName = hubSnap.val().name || hubSnap.val().hubName;
          }
        }
      }
      
      return storeData;
    }
    return null;
  }
};
