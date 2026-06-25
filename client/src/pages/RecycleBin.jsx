import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, Avatar, Typography, Button, Chip,
  IconButton, Tooltip, useTheme, alpha,
} from '@mui/material';
import { MdRestore, MdDeleteForever } from 'react-icons/md';
import {
  fetchRecycleBin, restoreFriend, permanentDeleteFriend, selectRecycleBin,
} from '../features/friends/friendsSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import PageHeader from '../components/common/PageHeader';
import EmptyState from '../components/common/EmptyState';
import { formatDate, timeAgo } from '../utils/dateUtils';

const RecycleBin = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const recycleBin = useSelector(selectRecycleBin);

  useEffect(() => { dispatch(fetchRecycleBin()); }, [dispatch]);

  const handleRestore = async (id, name) => {
    await dispatch(restoreFriend(id));
    dispatch(showSnackbar({ message: `${name} restored successfully`, severity: 'success' }));
  };

  const handlePermanentDelete = async (id, name) => {
    if (window.confirm(`Permanently delete "${name}"? This cannot be undone.`)) {
      await dispatch(permanentDeleteFriend(id));
      dispatch(showSnackbar({ message: `${name} permanently deleted`, severity: 'warning' }));
    }
  };

  return (
    <Box>
      <PageHeader
        title="Recycle Bin"
        subtitle={`${recycleBin.length} friends in recycle bin`}
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Recycle Bin' }]}
      />

      {recycleBin.length === 0 ? (
        <EmptyState icon="🗑️" title="Recycle bin is empty" description="Deleted friends will appear here for recovery" />
      ) : (
        <Grid container spacing={2.5}>
          {recycleBin.map((friend) => (
            <Grid item xs={12} sm={6} md={4} key={friend._id}>
              <Card sx={{ border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`, bgcolor: alpha(theme.palette.error.main, 0.03) }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                      src={friend.photo}
                      sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #FF5252, #FF1744)', fontWeight: 700, opacity: 0.7 }}
                    >
                      {friend.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ opacity: 0.7 }}>{friend.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Deleted {timeAgo(friend.deletedAt)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small" variant="outlined" color="success" startIcon={<MdRestore />}
                      onClick={() => handleRestore(friend._id, friend.name)} sx={{ flex: 1 }}
                    >
                      Restore
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error" startIcon={<MdDeleteForever />}
                      onClick={() => handlePermanentDelete(friend._id, friend.name)} sx={{ flex: 1 }}
                    >
                      Delete Forever
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default RecycleBin;
