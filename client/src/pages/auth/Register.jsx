import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, CardContent, TextField, Button, Typography, InputAdornment,
  IconButton, Alert, CircularProgress, useTheme, alpha,
} from '@mui/material';
import { MdPerson, MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { registerUser, selectAuthLoading, selectAuthError, selectIsAuthenticated, clearError } from '../../features/auth/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
    return () => dispatch(clearError());
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setFormError('Passwords do not match'); return; }
    if (form.password.length < 8) { setFormError('Password must be at least 8 characters'); return; }
    setFormError('');
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #0A0A1A 0%, #1A1A3A 100%)'
          : 'linear-gradient(135deg, #F0EFFF 0%, #FFF0F5 100%)',
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, boxShadow: '0 24px 64px rgba(108,99,255,0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🎉</Typography>
            <Typography variant="h5" fontWeight={800}>Create Account</Typography>
            <Typography variant="body2" color="text.secondary">Join WishMate for free</Typography>
          </Box>

          {(error || formError) && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{formError || error}</Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth label="Full Name" value={form.name} required sx={{ mb: 2 }}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><MdPerson style={{ color: '#6B7280' }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Email Address" type="email" value={form.email} required sx={{ mb: 2 }}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><MdEmail style={{ color: '#6B7280' }} /></InputAdornment> }}
            />
            <TextField
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={form.password} required sx={{ mb: 2 }}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              helperText="Minimum 8 characters"
              InputProps={{
                startAdornment: <InputAdornment position="start"><MdLock style={{ color: '#6B7280' }} /></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth label="Confirm Password" type={showPassword ? 'text' : 'password'} value={form.confirm} required sx={{ mb: 3 }}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><MdLock style={{ color: '#6B7280' }} /></InputAdornment> }}
            />
            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ py: 1.5 }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mt: 3 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
