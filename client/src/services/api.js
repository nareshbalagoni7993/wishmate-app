/**
 * WHY: Centralizes all HTTP configuration. Base URL, auth header injection,
 *      token refresh on 401, error normalization — done ONCE here, not in every slice.
 * HOW: Axios request interceptor attaches Bearer token from localStorage.
 *      Response interceptor catches 401, silently refreshes token, retries request.
 *      This is the "silent refresh" pattern — user never sees a re-login prompt.
 * PRODUCTION STANDARD: Never manually add Authorization headers in individual API calls.
 * INTERVIEW Q: Why Axios over fetch()?
 *   Axios: automatic JSON parsing, interceptors, timeout support, better error objects.
 *   fetch: native, no bundle size, but more verbose for the same features.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor: attach access token ──────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wishmate_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: silent token refresh on 401 ────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue other requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('wishmate_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const newToken = data.data.accessToken;
        const newRefresh = data.data.refreshToken;

        localStorage.setItem('wishmate_token', newToken);
        localStorage.setItem('wishmate_refresh_token', newRefresh);

        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Refresh failed — force logout
        localStorage.removeItem('wishmate_token');
        localStorage.removeItem('wishmate_refresh_token');
        localStorage.removeItem('wishmate_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
