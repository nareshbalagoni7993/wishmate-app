/**
 * WHY: App.jsx is the root component. Handles theme selection, routing, and lazy loading.
 * HOW: useMemo() for theme prevents recreation on every render (only when themeMode changes).
 *      React.lazy() + Suspense = code splitting — each route is a separate JS chunk.
 *      CssBaseline normalizes browser styles + applies MUI theme background.
 * PRODUCTION STANDARD: Code splitting is critical — reduces initial bundle from ~2MB to ~200KB.
 * PERFORMANCE: Lazy loading means users only download code for pages they visit.
 * INTERVIEW Q: Why lazy load routes instead of all components?
 *   Routes are natural split points. Components within a page load together.
 *   Lazy-loading every tiny component adds HTTP round-trips that hurt more than help.
 */

import React, { lazy, Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';

import { selectThemeMode } from './features/ui/uiSlice';
import { lightTheme, darkTheme } from './theme/theme';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// ── Eagerly loaded (small + needed immediately) ───────────────────────────────
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// ── Lazy loaded (code splitting per route) ────────────────────────────────────
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Friends = lazy(() => import('./pages/Friends'));
const AddEditFriend = lazy(() => import('./pages/AddEditFriend'));
const FriendDetail = lazy(() => import('./pages/FriendDetail'));
const Reminders = lazy(() => import('./pages/Reminders'));
const Quotes = lazy(() => import('./pages/Quotes'));
const Images = lazy(() => import('./pages/Images'));
const RecycleBin = lazy(() => import('./pages/RecycleBin'));

// ── Fallback loading UI ───────────────────────────────────────────────────────
const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <CircularProgress size={48} thickness={3} sx={{ color: 'primary.main' }} />
  </Box>
);

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const themeMode = useSelector(selectThemeMode);

  // Memoize theme — only recreates when themeMode changes
  const theme = useMemo(
    () => (themeMode === 'dark' ? darkTheme : lightTheme),
    [themeMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public Auth Routes ─────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Protected App Routes ───────────────────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Friends */}
            <Route path="friends" element={<Friends />} />
            <Route path="friends/add" element={<AddEditFriend />} />
            <Route path="friends/:id" element={<FriendDetail />} />
            <Route path="friends/:id/edit" element={<AddEditFriend />} />

            {/* Features */}
            <Route path="reminders" element={<Reminders />} />
            <Route path="birthdays" element={<Reminders />} />
            <Route path="anniversaries" element={<Reminders />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="images" element={<Images />} />
            <Route path="recycle-bin" element={<RecycleBin />} />
            <Route path="archived" element={<Friends />} />

            {/* Catch-all → redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>

          {/* Root redirect when not logged in */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ThemeProvider>
  );
}

export default App;
