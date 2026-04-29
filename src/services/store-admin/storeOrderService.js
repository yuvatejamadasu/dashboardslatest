import { db } from '@/config/firebase';
import { ref, get, update, onValue, off } from 'firebase/database';

export const storeOrderService = {
  // Get orders for a specific store
  getOrdersByStore: (storeId, callback) => {
    const ordersRef = ref(db, 'orders');
    
    // Listen for real-time updates
    const listener = onValue(ordersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const orders = Object.keys(data)
          .map(key => ({ ...data[key], id: key }))
          .filter(order => String(order.storeId) === String(storeId));
        
        // Sort by date (newest first)
        orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        callback(orders);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("Error fetching orders:", error);
      callback([]);
    });

    return () => off(ordersRef, 'value', listener);
  },

  // Get a single order by ID
  getOrderById: async (orderId) => {
    const orderRef = ref(db, `orders/${orderId}`);
    const snapshot = await get(orderRef);
    if (snapshot.exists()) {
      return { ...snapshot.val(), id: orderId };
    }
    return null;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, { status });
    return true;
  }
};
