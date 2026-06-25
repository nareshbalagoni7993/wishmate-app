/**
 * WHY: Reusable stats card used on both Dashboard and sub-pages.
 * HOW: Gradient icon box + count + label + optional trend percentage.
 */

import React from 'react';
import { Card, CardContent, Box, Typography, alpha, useTheme } from '@mui/material';
import { MdTrendingUp, MdTrendingDown } from 'react-icons/md';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = '#6C63FF', trend, delay = 0 }) => {
  const theme = useTheme();

  return (
    <Card
      className="fade-in-up"
      sx={{
        height: '100%',
        animationDelay: `${delay}ms`,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, rgba(255,255,255,0.9) 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          top: -20,
          width: 100,
          height: 100,
          borderRadius: '50%',
          background: alpha(color, 0.08),
          pointerEvents: 'none',
        }}
      />

      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color, lineHeight: 1.1, my: 0.5 }}>
              {value ?? '—'}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {trend >= 0 ? (
                  <MdTrendingUp style={{ color: '#4CAF50', fontSize: '1rem' }} />
                ) : (
                  <MdTrendingDown style={{ color: '#FF5252', fontSize: '1rem' }} />
                )}
                <Typography variant="caption" sx={{ color: trend >= 0 ? '#4CAF50' : '#FF5252', fontWeight: 600 }}>
                  {Math.abs(trend)}% this month
                </Typography>
              </Box>
            )}
          </Box>

          {Icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                flexShrink: 0,
              }}
            >
              <Icon style={{ fontSize: '1.5rem', color: '#fff' }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
