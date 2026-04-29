import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_HEADERS } from "@/config/super-admin/api";

/**
 * Generic data-fetching hook.
 *
 * Priority:
 *   1. Fetch from `url` (API endpoint) with standard headers.
 *   2. If the request fails AND a `fallback` local path is provided,
 *      silently retry against the local JSON file in /public/data/.
 *
 * @param {string} url       - Primary API URL, e.g. API.PRODUCTS
 * @param {string} [fallback]- Optional local path, e.g. '/data/products.json'
 * @param {object} [options] - Extra fetch options (method, headers override…)
 * @returns {{ data, loading, error }}
 */
const useFetch = (url, fallback = null, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const doFetch = (target, isRetry = false) => {
      const config = isRetry
        ? { url: target }
        : {
            url: target,
            headers: { ...API_HEADERS, ...options.headers },
            ...options
          };

      return axios(config).then(res => res.data);
    };

    setLoading(true);
    setError(null);

    doFetch(url)
      .catch((primaryErr) => {
        // Primary API failed — try local fallback if provided
        if (fallback) {
          return doFetch(fallback, true);
        }
        throw primaryErr;
      })
      .then((data) => {
        if (!cancelled) {
          setData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);   // re-run only if url changes

  return { data, loading, error };
};

export default useFetch;
