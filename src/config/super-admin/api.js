/**
 * API Configuration
 *
 * ORDERS, SELLERS, BRANDS, STATISTICS → served from /public/data/ (static JSON).
 *   db.json has empty arrays for these, so we fetch directly from /data/*.json.
 *
 * PRODUCTS  → json-server (localhost:4000)
 * REVIEWS   → json-server (localhost:4000)
 * PROFILE   → json-server (localhost:4000) — persisted via PUT on edit
 */

// Change this to your real backend server URL when ready
const BACKEND_URL = ""; 

// json-server endpoints (data lives in db.json by default)
const PRODUCTS_BASE  = "http://localhost:4000/products";
const REVIEWS_BASE   = "http://localhost:4000/reviews";
const PROFILE_BASE   = "http://localhost:4000/profile";

export const API = {
  // ── Static JSON or Backend Endpoints ──────────────────────────────────
  ORDERS:     "/data/orders.json",
  SELLERS:    "/data/sellers.json",
  BRANDS:     "/data/brands.json",
  STATISTICS: BACKEND_URL ? `${BACKEND_URL}/statistics` : "/data/statistics.json",
  STORES:     "/data/stores.json",

  // ── Endpoints for Dynamic Graphs/Charts ───────────────────────────────
  REVENUE_TREND:     BACKEND_URL ? `${BACKEND_URL}/charts/revenue`  : "/data/statistics.json",
  SALES_BY_CATEGORY: BACKEND_URL ? `${BACKEND_URL}/charts/category` : "/data/statistics.json",
  KPI_SUMMARY:       BACKEND_URL ? `${BACKEND_URL}/charts/kpi`      : "/data/statistics.json",

  // ── json-server endpoints ─────────────────────────────────────────────
  PRODUCTS: `${PRODUCTS_BASE}`,
  REVIEWS:  `${REVIEWS_BASE}`,
  PROFILE:  `${PROFILE_BASE}`,
};

// Default headers for REST endpoints
export const API_HEADERS = {
  "Content-Type": "application/json",
  // "Authorization": `Bearer ${your_token_here}`,
};
