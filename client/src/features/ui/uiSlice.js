/**
 * WHY: Global UI state (dark mode, sidebar open, snackbar) lives in Redux
 *      so any component can toggle the theme without prop drilling.
 * WHAT: Controls themeMode, sidebarOpen, snackbar notifications.
 * HOW: Persists themeMode to localStorage so preference survives page reload.
 */

import { createSlice } from '@reduxjs/toolkit';

const savedTheme = localStorage.getItem('wishmate_theme') || 'light';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    themeMode: savedTheme,
    sidebarOpen: true,
    snackbar: {
      open: false,
      message: '',
      severity: 'info', // 'success' | 'error' | 'warning' | 'info'
    },
    searchQuery: '',
    confirmDialog: {
      open: false,
      title: '',
      message: '',
      onConfirm: null,
    },
  },
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('wishmate_theme', state.themeMode);
    },
    setTheme: (state, action) => {
      state.themeMode = action.payload;
      localStorage.setItem('wishmate_theme', action.payload);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    showSnackbar: (state, action) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity || 'info',
      };
    },
    hideSnackbar: (state) => {
      state.snackbar.open = false;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
  },
});

export const {
  toggleTheme, setTheme, toggleSidebar, setSidebarOpen,
  showSnackbar, hideSnackbar, setSearchQuery,
} = uiSlice.actions;

export const selectThemeMode = (state) => state.ui.themeMode;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectSnackbar = (state) => state.ui.snackbar;
export const selectSearchQuery = (state) => state.ui.searchQuery;

export default uiSlice.reducer;
