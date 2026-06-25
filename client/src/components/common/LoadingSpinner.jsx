import React from 'react';
import { Box, CircularProgress, Typography, Skeleton, Grid } from '@mui/material';

export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 2 }}>
    <CircularProgress size={48} thickness={3} sx={{ color: 'primary.main' }} />
    <Typography variant="body2" color="text.secondary">{message}</Typography>
  </Box>
);

export const CardSkeleton = () => (
  <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height={24} />
        <Skeleton variant="text" width="40%" height={18} />
      </Box>
    </Box>
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="60%" />
    <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
      <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} />
      <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 1 }} />
    </Box>
  </Box>
);

export const GridSkeleton = ({ count = 6 }) => (
  <Grid container spacing={2.5}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} key={i}>
        <CardSkeleton />
      </Grid>
    ))}
  </Grid>
);

export default LoadingSpinner;
