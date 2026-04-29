import axios from 'axios';

/**
 * Default Axios instance for the project.
 * This can be used to set base URLs relative to the environment,
 * add common headers, and implement interceptors for auth/logging.
 */
const api = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can add interceptors here later if needed:
// api.interceptors.request.use(config => { ... });
// api.interceptors.response.use(response => { ... }, error => { ... });

export default api;
