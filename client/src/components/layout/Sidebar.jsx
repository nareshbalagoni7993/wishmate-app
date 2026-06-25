import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Typography, Avatar, Divider, Chip, useTheme, useMediaQuery, alpha,
} from '@mui/material';
import {
  MdDashboard, MdPeople, MdFavorite, MdArchive,
  MdDelete, MdFormatQuote, MdImage, MdSettings, MdNotifications,
} from 'react-icons/md';
import { FaBirthdayCake, FaRing } from 'react-icons/fa';
import { selectUser } from '../../features/auth/authSlice';
import { selectSidebarOpen, setSidebarOpen } from '../../features/ui/uiSlice';

const DRAWER_WIDTH = 260;

const NAV_ITEMS = [
  { label: 'Dashboard',    icon: MdDashboard,    path: '/',             badge: null },
  { label: 'Friends',      icon: MdPeople,       path: '/friends',      badge: null },
  { label: 'Reminders',    icon: MdNotifications, path: '/reminders',   badge: 'new' },
  { label: 'Birthdays',    icon: FaBirthdayCake, path: '/birthdays',    badge: null },
  { label: 'Anniversaries',icon: FaRing,         path: '/anniversaries',badge: null },
  { label: 'Quotes',       icon: MdFormatQuote,  path: '/quotes',       badge: null },
  { label: 'Images',       icon: MdImage,        path: '/images',       badge: null },
];

const SECONDARY_ITEMS = [
  { label: 'Favorites',   icon: MdFavorite, path: '/friends?isFavorite=true' },
  { label: 'Archived',    icon: MdArchive,  path: '/archived' },
  { label: 'Recycle Bin', icon: MdDelete,   path: '/recycle-bin' },
  { label: 'Settings',    icon: MdSettings, path: '/settings' },
];

const NavItem = ({ item, isActive, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const Icon = item.icon;

  const handleClick = () => {
    navigate(item.path);
    onClose?.(); // auto-close on mobile
  };

  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={handleClick}
        sx={{
          mx: 1,
          borderRadius: 2,
          py: 1.2,
          background: isActive
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #8B5CF6 100%)`
            : 'transparent',
          color: isActive ? '#fff' : theme.palette.text.secondary,
          '&:hover': {
            background: isActive
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #8B5CF6 100%)`
              : alpha(theme.palette.primary.main, 0.08),
            color: isActive ? '#fff' : theme.palette.primary.main,
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& svg': { fontSize: '1.3rem' } }}>
          <Icon />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: isActive ? 600 : 500 }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            color={isActive ? 'default' : 'primary'}
            sx={{
              height: 18, fontSize: '0.65rem',
              bgcolor: isActive ? 'rgba(255,255,255,0.3)' : undefined,
              color: isActive ? '#fff' : undefined,
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const DrawerContent = ({ onClose }) => {
  const theme = useTheme();
  const location = useLocation();
  const user = useSelector(selectUser);

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'WM';

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Box
          sx={{
            width: 40, height: 40, borderRadius: 2,
            background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
          }}
        >
          🎉
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            WishMate
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            Never miss a moment
          </Typography>
        </Box>
      </Box>

      {/* User Profile */}
      {user && (
        <Box
          sx={{
            mx: 2, my: 2, p: 1.5, borderRadius: 2,
            background: alpha(theme.palette.primary.main, 0.08),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}
        >
          <Avatar
            src={user.avatar}
            sx={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #6C63FF 0%, #FF6584 100%)',
              fontSize: '0.85rem', fontWeight: 700,
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user.role}</Typography>
          </Box>
        </Box>
      )}

      {/* Main Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <Typography
          variant="caption"
          sx={{ px: 2.5, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}
        >
          Main Menu
        </Typography>
        <List dense sx={{ mt: 0.5 }}>
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              onClose={onClose}
              isActive={
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path.split('?')[0])
              }
            />
          ))}
        </List>

        <Divider sx={{ my: 1.5, mx: 2 }} />

        <Typography
          variant="caption"
          sx={{ px: 2.5, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.65rem' }}
        >
          More
        </Typography>
        <List dense sx={{ mt: 0.5 }}>
          {SECONDARY_ITEMS.map((item) => (
            <NavItem
              key={item.path}
              item={item}
              onClose={onClose}
              isActive={location.pathname === item.path.split('?')[0]}
            />
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}` }}>
        <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
          WishMate v1.0.0 — Made with ❤️
        </Typography>
      </Box>
    </Box>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const sidebarOpen = useSelector(selectSidebarOpen);

  const handleClose = () => dispatch(setSidebarOpen(false));

  return (
    <>
      {/* Desktop — permanent */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              top: 64,
              height: 'calc(100vh - 64px)',
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      )}

      {/* Mobile — temporary slide-in, closes on nav tap */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={handleClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent onClose={handleClose} />
        </Drawer>
      )}
    </>
  );
};

export { DRAWER_WIDTH };
export default Sidebar;
