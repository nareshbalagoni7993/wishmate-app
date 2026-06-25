import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem,
  Tooltip, Badge, InputBase, useTheme, alpha, Divider, ListItemIcon,
  Slide, Paper, useMediaQuery,
} from '@mui/material';
import {
  MdMenu, MdSearch, MdNotifications, MdDarkMode, MdLightMode,
  MdPerson, MdSettings, MdLogout, MdAdd, MdClose,
} from 'react-icons/md';
import { toggleTheme, toggleSidebar, selectThemeMode } from '../../features/ui/uiSlice';
import { logoutUser, selectUser } from '../../features/auth/authSlice';
import { DRAWER_WIDTH } from './Sidebar';

const Navbar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const themeMode = useSelector(selectThemeMode);
  const user = useSelector(selectUser);

  const [anchorEl, setAnchorEl] = useState(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'WM';

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logoutUser());
    navigate('/login');
  };

  const handleMobileSearch = (e) => {
    if (e.target.value.length > 1) navigate(`/friends?search=${e.target.value}`);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ gap: 0.5, minHeight: '64px !important' }}>

        {/* Hamburger — mobile only */}
        <IconButton
          onClick={() => dispatch(toggleSidebar())}
          sx={{ display: { md: 'none' }, mr: 0.5 }}
          color="inherit"
        >
          <MdMenu />
        </IconButton>

        {/* Logo — mobile only (desktop shows it in sidebar) */}
        <Typography
          variant="h6"
          sx={{
            display: { xs: 'block', md: 'none' },
            fontWeight: 800,
            background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-0.02em',
          }}
        >
          WishMate
        </Typography>

        <Box sx={{ flex: 1 }} />

        {/* Desktop Search Bar */}
        {!isMobile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.8,
              borderRadius: 3,
              border: `1.5px solid ${searchFocused
                ? theme.palette.primary.main
                : alpha(theme.palette.divider, 1)}`,
              background: alpha(theme.palette.background.paper, 0.8),
              transition: 'all 0.2s ease',
              width: searchFocused ? 280 : 200,
            }}
          >
            <MdSearch style={{ color: theme.palette.text.secondary, fontSize: '1.1rem' }} />
            <InputBase
              placeholder="Search friends..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={(e) => {
                if (e.target.value.length > 1) navigate(`/friends?search=${e.target.value}`);
              }}
              sx={{ fontSize: '0.875rem', flex: 1 }}
            />
          </Box>
        )}

        {/* Mobile Search Icon */}
        {isMobile && (
          <IconButton color="inherit" onClick={() => setMobileSearchOpen(true)}>
            <MdSearch style={{ fontSize: '1.3rem' }} />
          </IconButton>
        )}

        {/* Add Friend — desktop only (mobile uses FAB) */}
        {!isMobile && (
          <Tooltip title="Add Friend">
            <IconButton
              onClick={() => navigate('/friends/add')}
              sx={{
                background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                color: '#fff',
                width: 36,
                height: 36,
                '&:hover': { opacity: 0.9, transform: 'scale(1.05)' },
                transition: 'all 0.2s ease',
              }}
            >
              <MdAdd style={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Tooltip>
        )}

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton color="inherit" onClick={() => navigate('/reminders')}>
            <Badge badgeContent={3} color="error">
              <MdNotifications style={{ fontSize: '1.3rem' }} />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Theme Toggle — hidden on xs to save space */}
        <Tooltip title={themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}>
          <IconButton
            onClick={() => dispatch(toggleTheme())}
            color="inherit"
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            {themeMode === 'dark'
              ? <MdLightMode style={{ fontSize: '1.3rem', color: '#FFB347' }} />
              : <MdDarkMode style={{ fontSize: '1.3rem' }} />
            }
          </IconButton>
        </Tooltip>

        {/* Profile Avatar */}
        <Tooltip title="Profile">
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              src={user?.avatar}
              sx={{
                width: 34,
                height: 34,
                background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {getInitials(user?.name)}
            </Avatar>
          </IconButton>
        </Tooltip>

        {/* Profile Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><MdPerson style={{ fontSize: '1.1rem' }} /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><MdSettings style={{ fontSize: '1.1rem' }} /></ListItemIcon>
            Settings
          </MenuItem>
          {/* Theme toggle inside menu on xs */}
          {isXs && (
            <MenuItem onClick={() => { dispatch(toggleTheme()); setAnchorEl(null); }}>
              <ListItemIcon>
                {themeMode === 'dark'
                  ? <MdLightMode style={{ fontSize: '1.1rem', color: '#FFB347' }} />
                  : <MdDarkMode style={{ fontSize: '1.1rem' }} />
                }
              </ListItemIcon>
              {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
          )}
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><MdLogout style={{ fontSize: '1.1rem', color: 'inherit' }} /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>

      {/* Mobile full-width search overlay */}
      {mobileSearchOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 64,
            display: 'flex',
            alignItems: 'center',
            px: 2,
            gap: 1,
            bgcolor: 'background.paper',
            zIndex: 10,
          }}
        >
          <MdSearch style={{ color: theme.palette.text.secondary, fontSize: '1.3rem', flexShrink: 0 }} />
          <InputBase
            autoFocus
            fullWidth
            placeholder="Search friends..."
            onChange={handleMobileSearch}
            sx={{ fontSize: '1rem', flex: 1 }}
          />
          <IconButton size="small" onClick={() => setMobileSearchOpen(false)} color="inherit">
            <MdClose />
          </IconButton>
        </Box>
      )}
    </AppBar>
  );
};

export default Navbar;
