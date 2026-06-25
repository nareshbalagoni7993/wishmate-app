import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useTheme, alpha } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MdDashboard, MdPeople, MdNotifications, MdFormatQuote, MdMenu } from 'react-icons/md';
import { setSidebarOpen } from '../../features/ui/uiSlice';

const BOTTOM_TABS = [
  { label: 'Home',      icon: <MdDashboard style={{ fontSize: '1.4rem' }} />, path: '/' },
  { label: 'Friends',   icon: <MdPeople style={{ fontSize: '1.4rem' }} />,    path: '/friends' },
  { label: 'Reminders', icon: <MdNotifications style={{ fontSize: '1.4rem' }} />, path: '/reminders' },
  { label: 'Quotes',    icon: <MdFormatQuote style={{ fontSize: '1.4rem' }} />, path: '/quotes' },
  { label: 'More',      icon: <MdMenu style={{ fontSize: '1.4rem' }} />,      path: '__more__' },
];

const MobileBottomNav = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const activeTab = BOTTOM_TABS.find((t) =>
    t.path !== '__more__' &&
    (t.path === '/' ? location.pathname === '/' : location.pathname.startsWith(t.path))
  )?.path ?? false;

  const handleChange = (_, newPath) => {
    if (newPath === '__more__') {
      dispatch(setSidebarOpen(true));
    } else {
      navigate(newPath);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.drawer + 2,
        display: { xs: 'block', md: 'none' },
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        borderRadius: '16px 16px 0 0',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        background: theme.palette.mode === 'dark'
          ? alpha('#1E1E3A', 0.95)
          : alpha('#ffffff', 0.95),
        // Safe area for iOS home indicator
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <BottomNavigation
        value={activeTab}
        onChange={handleChange}
        showLabels
        sx={{
          height: 60,
          bgcolor: 'transparent',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            px: 0.5,
            color: theme.palette.text.secondary,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              color: theme.palette.primary.main,
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.65rem',
            fontWeight: 600,
            '&.Mui-selected': { fontSize: '0.65rem' },
          },
        }}
      >
        {BOTTOM_TABS.map((tab) => (
          <BottomNavigationAction
            key={tab.path}
            label={tab.label}
            value={tab.path}
            icon={tab.icon}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
