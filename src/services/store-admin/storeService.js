import axios from 'axios';

const BACKEND_URL = ""; // e.g. "https://api.yourdomain.com"

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({ name: month, Sales: rand(5, 35), Visitors: rand(8, 40), Products: rand(5, 37) }));
};

const generateRevenueData = () => {
  const categories = ['900', '1200', '1400', '1600'];
  return categories.map(cat => ({ name: cat, US: rand(150, 900), Europe: rand(200, 750), Asian: rand(150, 650), Africa: rand(80, 350) }));
};

export const fetchSalesData = async (endpoint = '/api/store/sales') => {
  if (BACKEND_URL) {
    try {
      const res = await axios.get(`${BACKEND_URL}${endpoint}`);
      return res.data;
    } catch (e) {
      console.warn('Backend reach failed for store sales, falling back to mock data');
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(generateSalesData()), rand(300, 800)));
};

export const fetchRevenueData = async (endpoint = '/api/store/revenue') => {
  if (BACKEND_URL) {
    try {
      const res = await axios.get(`${BACKEND_URL}${endpoint}`);
      return res.data;
    } catch (e) {
      console.warn('Backend reach failed for store revenue, falling back to mock data');
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(generateRevenueData()), rand(300, 800)));
};

export const API_ENDPOINTS = {
  sales: [
    { label: 'Store Default Sales', url: '/api/store/sales/default' },
    { label: 'Store Q1 Report', url: '/api/store/sales/q1' },
    { label: 'Store Q2 Report', url: '/api/store/sales/q2' },
    { label: 'Store Annual Report', url: '/api/store/sales/annual' },
  ],
  revenue: [
    { label: 'Store All Regions', url: '/api/store/revenue/all' },
    { label: 'Store High Revenue', url: '/api/store/revenue/high' },
    { label: 'Store Low Revenue', url: '/api/store/revenue/low' },
    { label: 'Store Projected', url: '/api/store/revenue/projected' },
  ],
};
