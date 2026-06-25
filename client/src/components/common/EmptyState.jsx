import React from 'react';
import { Box, Typography, Button } from '@mui/material';

const EmptyState = ({ icon = '🔍', title, description, actionLabel, onAction }) => (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Typography sx={{ fontSize: '4rem', lineHeight: 1 }}>{icon}</Typography>
    <Typography variant="h6" fontWeight={700} color="text.primary">
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
