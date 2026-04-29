import api from "@/utils/common/api";

const JSON_SERVER_BASE = 'http://localhost:4000';
const LOCAL_PROFILE_URL = '/data/profile.json';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safe fetch wrapper using axios — returns { data } or { error } */
const safeFetch = async (config) => {
  try {
    const response = await api(config);
    return { data: response.data };
  } catch (err) {
    return { error: err.response?.data?.message || err.message || 'Unknown error' };
  }
};

// ─── Profile API ─────────────────────────────────────────────────────────────

/**
 * GET /profile/1 from json-server.
 * Falls back to /data/profile.json if json-server is unavailable.
 */
export const getProfile = async () => {
  // Try json-server first
  const result = await safeFetch({ url: `${JSON_SERVER_BASE}/profile/1` });
  if (!result.error) return result;

  // Fallback: static public JSON
  console.warn('[apiService] json-server unreachable, falling back to /data/profile.json');
  try {
    const res = await fetch(LOCAL_PROFILE_URL);
    if (!res.ok) throw new Error('Fallback failed');
    const data = await res.json();
    return { data };
  } catch (err) {
    return { error: 'Both API and fallback failed.' };
  }
};

/**
 * PUT /profile/1 — persist updated profile to json-server.
 * json-server writes the change to its source db.json automatically.
 *
 * @param {Object} profileData — full profile object to persist
 */
export const updateProfile = async (profileData) => {
  const result = await safeFetch({
    url: `${JSON_SERVER_BASE}/profile/1`,
    method: 'PUT',
    data: profileData,
  });

  if (result.error) {
    console.warn('[apiService] PUT /profile/1 failed:', result.error);
  }

  return result;
};

/**
 * PATCH /profile/1 — partial update (only changed fields).
 *
 * @param {Object} partial — subset of profile fields to update
 */
export const patchProfile = async (partial) => {
  const result = await safeFetch({
    url: `${JSON_SERVER_BASE}/profile/1`,
    method: 'PATCH',
    data: partial,
  });

  if (result.error) {
    console.warn('[apiService] PATCH /profile/1 failed:', result.error);
  }

  return result;
};
