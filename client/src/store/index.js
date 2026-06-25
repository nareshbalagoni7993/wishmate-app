/**
 * WHY: Redux Toolkit (RTK) replaces verbose redux boilerplate.
 *      configureStore() includes Redux DevTools, Immer, Thunk by default.
 * WHAT: Central store combining auth, friends, dashboard, ui slices.
 * HOW: Each feature has its own slice file (single responsibility).
 * PRODUCTION STANDARD: Use RTK's createSlice + createAsyncThunk, not raw actions.
 * PERFORMANCE: RTK uses Immer for immutable updates — no spread operator needed.
 * INTERVIEW Q: Why Redux over Context API?
 *   Context re-renders entire subtree on any state change.
 *   Redux uses selector memoization — only subscribed components re-render.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import friendsReducer from '../features/friends/friendsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import uiReducer from '../features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    friends: friendsReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['friends/setCurrentFriend'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;
