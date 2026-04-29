/**
 * fakeApi.js — Hybrid service for Hub Admin Dashboard
 * 
 * To make charts dynamic, simply set BACKEND_URL to your server address.
 * It will automatically try to fetch from the backend and fallback to 
 * generated data if the server is unreachable or URL is empty.
 */

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

export const fetchSalesData = async (endpoint = '/api/sales') => {
  if (BACKEND_URL) {
    try {
      const { data } = await axios.get(`${BACKEND_URL}${endpoint}`);
      return data;
    } catch (e) {
      console.warn('Backend reach failed for sales, falling back to mock data');
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(generateSalesData()), rand(300, 800)));
};

export const fetchRevenueData = async (endpoint = '/api/revenue') => {
  if (BACKEND_URL) {
    try {
      const { data } = await axios.get(`${BACKEND_URL}${endpoint}`);
      return data;
    } catch (e) {
      console.warn('Backend reach failed for revenue, falling back to mock data');
    }
  }
  return new Promise(resolve => setTimeout(() => resolve(generateRevenueData()), rand(300, 800)));
};

export const API_ENDPOINTS = {
  sales: [
    { label: 'Default Sales', url: '/api/sales/default' },
    { label: 'Q1 Report', url: '/api/sales/q1' },
    { label: 'Q2 Report', url: '/api/sales/q2' },
    { label: 'Annual Report', url: '/api/sales/annual' },
  ],
  revenue: [
    { label: 'All Regions', url: '/api/revenue/all' },
    { label: 'High Revenue', url: '/api/revenue/high' },
    { label: 'Low Revenue', url: '/api/revenue/low' },
    { label: 'Projected', url: '/api/revenue/projected' },
  ],
};
