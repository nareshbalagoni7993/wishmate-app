/**
 * WHY: Premium auth page — first impression matters.
 * HOW: Split layout — left gradient hero, right form panel.
 *      Redirect to intended page after login via state.from from ProtectedRoute.
 * PRODUCTION STANDARD: No plain-text password storage, secure token handling.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, Divider, useTheme, alpha,
} from '@mui/material';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { loginUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../features/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, from, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0A0A1A 0%, #1A1A3A 100%)'
          : 'linear-gradient(135deg, #F0EFFF 0%, #FFF0F5 100%)',
      }}
    >
      {/* Left hero panel — desktop only */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              width: [200, 150, 100, 300, 80][i],
              height: [200, 150, 100, 300, 80][i],
              top: ['10%', '60%', '30%', '-10%', '75%'][i],
              left: ['-5%', '60%', '40%', '30%', '-2%'][i],
            }}
          />
        ))}

        <Box sx={{ position: 'relative', textAlign: 'center', color: '#fff' }}>
          <Typography sx={{ fontSize: '5rem', mb: 2 }}>🎉</Typography>
          <Typography variant="h3" fontWeight={800} gutterBottom>
            WishMate
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 360, lineHeight: 1.6 }}>
            Never miss a birthday, anniversary, or special moment again.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🎂 Birthdays', '💍 Anniversaries', '👥 Friends', '💌 Wishes'].map((item) => (
              <Box
                key={item}
                sx={{
                  px: 2, py: 0.8, borderRadius: 5,
                  background: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, lg: '0 0 440px' },
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          pt: { xs: 4, sm: 4 },
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 400,
            p: { xs: 0.5, sm: 2 },
            boxShadow: theme.palette.mode === 'dark'
              ? '0 24px 64px rgba(0,0,0,0.6)'
              : '0 24px 64px rgba(108,99,255,0.12)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            {/* Logo */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🎉</Typography>
              <Typography variant="h5" fontWeight={800}>
                Welcome back!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to your WishMate account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdEmail style={{ color: '#6B7280' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MdLock style={{ color: '#6B7280' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">OR</Typography>
            </Divider>

            <Typography variant="body2" textAlign="center" color="text.secondary">
              Don't have an account?{' '}
              <Link
                to="/register"
                style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'none' }}
              >
                Create one free
              </Link>
            </Typography>

            {/* Demo credentials hint */}
            <Box
              sx={{
                mt: 2, p: 1.5, borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                💡 <strong>Demo:</strong> Register a new account to get started!
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
