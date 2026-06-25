/**
 * WHY: Auth state must be globally accessible — any component needs to know
 *      if user is logged in (to show/hide UI, protect routes, attach auth headers).
 * WHAT: Stores user object, tokens, loading/error states.
 * HOW: createAsyncThunk handles async login/register/logout with automatic
 *      pending/fulfilled/rejected action dispatching.
 * PRODUCTION STANDARD: Access token in memory (state). Refresh token in httpOnly cookie
 *      or localStorage (we use localStorage for simplicity, httpOnly for production).
 * SECURITY NOTE: localStorage is vulnerable to XSS. For production, use httpOnly cookies.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const savedUser = JSON.parse(localStorage.getItem('wishmate_user') || 'null');
const savedToken = localStorage.getItem('wishmate_token') || null;

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', credentials);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/register', userData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Don't block logout if API fails
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('wishmate_refresh_token');
      if (!refreshToken) throw new Error('No refresh token');
      const { data } = await api.post('/auth/refresh', { refreshToken });
      return data.data;
    } catch (err) {
      return rejectWithValue('Session expired');
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/profile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: savedUser,
    accessToken: savedToken,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('wishmate_user', JSON.stringify(user));
      localStorage.setItem('wishmate_token', accessToken);
      if (refreshToken) localStorage.setItem('wishmate_refresh_token', refreshToken);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('wishmate_user');
      localStorage.removeItem('wishmate_token');
      localStorage.removeItem('wishmate_refresh_token');
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => { state.loading = true; state.error = null; };
    const setError = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(loginUser.pending, setLoading)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('wishmate_user', JSON.stringify(action.payload.user));
        localStorage.setItem('wishmate_token', action.payload.accessToken);
        localStorage.setItem('wishmate_refresh_token', action.payload.refreshToken);
      })
      .addCase(loginUser.rejected, setError)

      .addCase(registerUser.pending, setLoading)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        localStorage.setItem('wishmate_user', JSON.stringify(action.payload.user));
        localStorage.setItem('wishmate_token', action.payload.accessToken);
        localStorage.setItem('wishmate_refresh_token', action.payload.refreshToken);
      })
      .addCase(registerUser.rejected, setError)

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('wishmate_user');
        localStorage.removeItem('wishmate_token');
        localStorage.removeItem('wishmate_refresh_token');
      })

      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('wishmate_token', action.payload.accessToken);
        localStorage.setItem('wishmate_refresh_token', action.payload.refreshToken);
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        localStorage.clear();
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
      });
  },
});

export const { clearError, setCredentials, clearCredentials } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
