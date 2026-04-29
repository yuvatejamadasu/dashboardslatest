import { db } from '@/config/firebase';
import { ref, push, set, onValue, off, update, remove } from 'firebase/database';

export const deliveryPartnerService = {
  // Add new delivery partner
  addPartner: async (partnerData) => {
    const partnersRef = ref(db, 'delivery_partners');
    const newPartnerRef = push(partnersRef);
    const partner = {
      ...partnerData,
      id: `DP-${newPartnerRef.key.slice(-4).toUpperCase()}`,
      status: 'Active',
      rating: 5.0,
      delivered: 0,
      pending: 0,
      failed: 0,
      earnings: 'KES 0',
      createdAt: new Date().toISOString()
    };
    await set(newPartnerRef, partner);
    return { ...partner, firebaseKey: newPartnerRef.key };
  },

  // Get all partners
  getPartners: (callback) => {
    const partnersRef = ref(db, 'delivery_partners');
    const listener = onValue(partnersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const partners = Object.keys(data).map(key => ({
          ...data[key],
          firebaseKey: key
        }));
        callback(partners);
      } else {
        callback([]);
      }
    });
    return () => off(partnersRef, 'value', listener);
  },

  // Update partner status
  updatePartnerStatus: async (partnerKey, status) => {
    const partnerRef = ref(db, `delivery_partners/${partnerKey}`);
    await update(partnerRef, { status });
    return true;
  }
};
