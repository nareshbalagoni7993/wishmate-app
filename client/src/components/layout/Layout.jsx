import React from 'react';
import { Box, useTheme, useMediaQuery, Snackbar, Alert, Fab, Tooltip } from '@mui/material';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MdAdd } from 'react-icons/md';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileBottomNav from './MobileBottomNav';
import { DRAWER_WIDTH } from './Sidebar';
import { selectSnackbar, hideSnackbar } from '../../features/ui/uiSlice';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const snackbar = useSelector(selectSnackbar);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Fixed top Navbar */}
      <Navbar />

      {/* Sidebar (permanent on desktop, drawer on mobile) */}
      <Sidebar />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: '64px',
          ml: isMobile ? 0 : `${DRAWER_WIDTH}px`,
          minHeight: '100vh',
          width: isMobile ? '100%' : `calc(100% - ${DRAWER_WIDTH}px)`,
          transition: 'margin-left 0.3s ease',
          overflow: 'auto',
        }}
      >
        <Box
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            maxWidth: 1400,
            mx: 'auto',
            // Extra bottom padding on mobile so content isn't hidden behind bottom nav
            pb: { xs: '80px', md: 3 },
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Mobile bottom navigation */}
      <MobileBottomNav />

      {/* FAB — Add Friend (mobile only) */}
      {isMobile && (
        <Tooltip title="Add Friend">
          <Fab
            color="primary"
            size="medium"
            onClick={() => navigate('/friends/add')}
            sx={{
              position: 'fixed',
              bottom: 76, // above bottom nav
              right: 16,
              zIndex: (t) => t.zIndex.drawer + 1,
              background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
              boxShadow: '0 4px 20px rgba(108,99,255,0.5)',
              '&:hover': { opacity: 0.9 },
            }}
          >
            <MdAdd style={{ fontSize: '1.5rem' }} />
          </Fab>
        </Tooltip>
      )}

      {/* Global Snackbar — top-center on mobile, bottom-right on desktop */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={
          isMobile
            ? { vertical: 'top', horizontal: 'center' }
            : { vertical: 'bottom', horizontal: 'right' }
        }
        sx={{ mb: isMobile ? 0 : 0 }}
      >
        <Alert
          onClose={() => dispatch(hideSnackbar())}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, fontWeight: 500, width: { xs: '90vw', sm: 'auto' } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Layout;
