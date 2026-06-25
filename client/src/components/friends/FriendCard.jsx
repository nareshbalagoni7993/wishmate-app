/**
 * WHY: The friend card is the most rendered component — must be fast and beautiful.
 * HOW: Memoized with React.memo to prevent re-renders when parent re-renders.
 *      Avatar initials fallback when no photo. Birthday badge computed on the fly.
 * PERFORMANCE: React.memo + useCallback for handlers prevents child re-render on parent update.
 */

import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Card, CardContent, CardActions, Avatar, Box, Typography, Chip,
  IconButton, Tooltip, alpha, useTheme,
} from '@mui/material';
import {
  MdFavorite, MdFavoriteBorder, MdEdit, MdDelete, MdWhatsapp,
  MdPhone, MdEmail, MdCake,
} from 'react-icons/md';
import { toggleFavorite, deleteFriend } from '../../features/friends/friendsSlice';
import { getBirthdayBadge, getAge, formatDate } from '../../utils/dateUtils';

const GENDER_COLORS = { male: '#6C63FF', female: '#FF6584', other: '#43D4B0', prefer_not_to_say: '#94A3B8' };

const FriendCard = memo(({ friend }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const birthdayBadge = getBirthdayBadge(friend.dateOfBirth);
  const age = getAge(friend.dateOfBirth);
  const genderColor = GENDER_COLORS[friend.gender] || '#6C63FF';

  const handleFavorite = useCallback((e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(friend._id));
  }, [dispatch, friend._id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    dispatch(deleteFriend(friend._id));
  }, [dispatch, friend._id]);

  const handleWhatsApp = useCallback((e) => {
    e.stopPropagation();
    if (friend.whatsapp || friend.mobile) {
      const num = (friend.whatsapp || friend.mobile).replace(/\D/g, '');
      window.open(`https://wa.me/${num}`, '_blank');
    }
  }, [friend]);

  return (
    <Card
      onClick={() => navigate(`/friends/${friend._id}`)}
      sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CardContent sx={{ p: 2.5, flex: 1 }}>
        {/* Header Row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
          <Box sx={{ position: 'relative', flexShrink: 0 }}>
            <Avatar
              src={friend.photo}
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${genderColor} 0%, ${alpha(genderColor, 0.6)} 100%)`,
                fontSize: '1.2rem',
                fontWeight: 700,
                border: `2px solid ${alpha(genderColor, 0.3)}`,
              }}
            >
              {friend.name?.[0]?.toUpperCase()}
            </Avatar>
            {birthdayBadge && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              >
                {birthdayBadge.icon}
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>{friend.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {friend.occupation
                ? `${friend.occupation}${friend.company ? ` · ${friend.company}` : ''}`
                : friend.city || friend.relationship || '—'}
            </Typography>
          </Box>

          <IconButton size="small" onClick={handleFavorite} sx={{ flexShrink: 0 }}>
            {friend.isFavorite
              ? <MdFavorite style={{ fontSize: '1.1rem', color: '#FF6584' }} />
              : <MdFavoriteBorder style={{ fontSize: '1.1rem', color: '#94A3B8' }} />
            }
          </IconButton>
        </Box>

        {/* Chips */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 1.5 }}>
          {friend.relationship && (
            <Chip
              label={friend.relationship}
              size="small"
              sx={{ fontSize: '0.7rem', height: 22, bgcolor: alpha(genderColor, 0.12), color: genderColor, fontWeight: 600 }}
            />
          )}
          {age !== null && (
            <Chip
              label={`${age} yrs`}
              size="small"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
          {friend.bloodGroup && (
            <Chip
              label={friend.bloodGroup}
              size="small"
              color="error"
              variant="outlined"
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Box>

        {/* Birthday row */}
        {friend.dateOfBirth && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <MdCake style={{ fontSize: '0.9rem', color: '#FF6584', flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">
              {formatDate(friend.dateOfBirth)}
            </Typography>
            {birthdayBadge && (
              <Chip
                label={birthdayBadge.label}
                size="small"
                color={birthdayBadge.color}
                sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
              />
            )}
          </Box>
        )}

        {/* City */}
        {friend.city && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            📍 {friend.city}{friend.state ? `, ${friend.state}` : ''}
          </Typography>
        )}
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 1.5, pt: 0, gap: 0.5 }}>
        {(friend.whatsapp || friend.mobile) && (
          <Tooltip title="WhatsApp">
            <IconButton size="small" onClick={handleWhatsApp} sx={{ color: '#25D366' }}>
              <MdWhatsapp style={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        )}
        {friend.mobile && (
          <Tooltip title="Call">
            <IconButton size="small" sx={{ color: '#6C63FF' }} onClick={(e) => { e.stopPropagation(); window.open(`tel:${friend.mobile}`); }}>
              <MdPhone style={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        )}
        {friend.email && (
          <Tooltip title="Email">
            <IconButton size="small" sx={{ color: '#FF6584' }} onClick={(e) => { e.stopPropagation(); window.open(`mailto:${friend.email}`); }}>
              <MdEmail style={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        )}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Edit">
          <IconButton size="small" onClick={(e) => { e.stopPropagation(); navigate(`/friends/${friend._id}/edit`); }}>
            <MdEdit style={{ fontSize: '1rem', color: '#6B7280' }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={handleDelete}>
            <MdDelete style={{ fontSize: '1rem', color: '#FF5252' }} />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
});

FriendCard.displayName = 'FriendCard';
export default FriendCard;
