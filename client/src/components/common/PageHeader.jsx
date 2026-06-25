import React from 'react';
import { Box, Typography, Breadcrumbs, Link, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';

const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<MdChevronRight style={{ fontSize: '1rem' }} />}
          sx={{ mb: 1, display: { xs: 'none', sm: 'block' } }}
        >
          {breadcrumbs.map((crumb, idx) =>
            crumb.path ? (
              <Link
                key={idx}
                component="button"
                variant="caption"
                onClick={() => navigate(crumb.path)}
                sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 500, '&:hover': { color: 'primary.main' } }}
              >
                {crumb.label}
              </Link>
            ) : (
              <Typography key={idx} variant="caption" color="primary" fontWeight={600}>
                {crumb.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            fontWeight={700}
            noWrap={isMobile}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
