/**
 * WHY: The Friends list is the most used page — full search, filter, sort, pagination.
 * HOW: Reads query params from URL so filters are bookmarkable / shareable.
 *      Debounced search prevents an API call on every keystroke.
 * PERFORMANCE: Grid skeleton shown while loading. React.memo on FriendCard prevents
 *   unnecessary re-renders when pagination changes but individual cards didn't change.
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Grid, Box, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, InputAdornment, Pagination, ToggleButtonGroup, ToggleButton,
  Typography, Chip, Menu, MenuItem as MuiMenuItem, Divider, Card,
  CardContent, alpha, useTheme, Tooltip, IconButton,
} from '@mui/material';
import {
  MdSearch, MdFilterList, MdSort, MdAdd, MdGridView, MdList,
  MdFileDownload, MdRefresh, MdClose,
} from 'react-icons/md';
import {
  fetchFriends, selectFriends, selectFriendsPagination, selectFriendsLoading,
  setFilters, selectFriendsFilters, toggleFavorite, deleteFriend,
} from '../features/friends/friendsSlice';
import { showSnackbar } from '../features/ui/uiSlice';
import FriendCard from '../components/friends/FriendCard';
import { GridSkeleton } from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { exportToPDF, exportToExcel } from '../utils/exportUtils';

const RELATIONSHIPS = ['friend', 'best friend', 'colleague', 'family', 'cousin', 'neighbor', 'classmate', 'mentor', 'relative', 'other'];
const GENDERS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }];

const Friends = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const friends = useSelector(selectFriends);
  const pagination = useSelector(selectFriendsPagination);
  const loading = useSelector(selectFriendsLoading);
  const filters = useSelector(selectFriendsFilters);

  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [sortAnchor, setSortAnchor] = useState(null);
  const [exportAnchor, setExportAnchor] = useState(null);
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null, name: '' });

  // Sync URL search param
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchInput(urlSearch);
      dispatch(setFilters({ search: urlSearch }));
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setFilters({ search: searchInput }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, dispatch]);

  // Fetch whenever filters/page/sort changes
  useEffect(() => {
    dispatch(fetchFriends({
      search: filters.search,
      gender: filters.gender,
      relationship: filters.relationship,
      isFavorite: filters.isFavorite,
      isArchived: filters.isArchived || 'false',
      page,
      limit: 12,
      sortBy,
      order,
    }));
  }, [dispatch, filters, page, sortBy, order]);

  const handleFilterChange = useCallback((key) => (e) => {
    dispatch(setFilters({ [key]: e.target.value }));
    setPage(1);
  }, [dispatch]);

  const clearFilters = () => {
    setSearchInput('');
    dispatch(setFilters({ search: '', gender: '', relationship: '', isFavorite: '' }));
    setPage(1);
  };

  const activeFilterCount = [filters.gender, filters.relationship, filters.isFavorite].filter(Boolean).length;

  const handleExportPDF = () => {
    setExportAnchor(null);
    exportToPDF(friends);
    dispatch(showSnackbar({ message: 'PDF exported successfully!', severity: 'success' }));
  };

  const handleExportExcel = () => {
    setExportAnchor(null);
    exportToExcel(friends);
    dispatch(showSnackbar({ message: 'Excel exported successfully!', severity: 'success' }));
  };

  const confirmDelete = (id, name) => setDeleteDialog({ open: true, id, name });
  const handleDelete = () => {
    dispatch(deleteFriend(deleteDialog.id));
    setDeleteDialog({ open: false, id: null, name: '' });
    dispatch(showSnackbar({ message: 'Friend moved to recycle bin', severity: 'info' }));
  };

  return (
    <Box>
      <PageHeader
        title="Friends"
        subtitle={`${pagination.total} friends in your network`}
        breadcrumbs={[{ label: 'Dashboard', path: '/' }, { label: 'Friends' }]}
        actions={
          <>
            <Button variant="outlined" startIcon={<MdFileDownload />} onClick={(e) => setExportAnchor(e.currentTarget)}>
              Export
            </Button>
            <Button variant="contained" startIcon={<MdAdd />} onClick={() => navigate('/friends/add')}>
              Add Friend
            </Button>
          </>
        }
      />

      {/* Filters Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <TextField
              placeholder="Search by name, city, occupation..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              sx={{ flex: 1, minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch style={{ color: '#6B7280' }} />
                  </InputAdornment>
                ),
                endAdornment: searchInput && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchInput('')}>
                      <MdClose style={{ fontSize: '1rem' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Gender Filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel>Gender</InputLabel>
              <Select value={filters.gender} label="Gender" onChange={handleFilterChange('gender')}>
                <MenuItem value=""><em>All Genders</em></MenuItem>
                {GENDERS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Relationship Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Relationship</InputLabel>
              <Select value={filters.relationship} label="Relationship" onChange={handleFilterChange('relationship')}>
                <MenuItem value=""><em>All Types</em></MenuItem>
                {RELATIONSHIPS.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
              </Select>
            </FormControl>

            {/* Favorites Toggle */}
            <Chip
              label="⭐ Favorites"
              onClick={() => { dispatch(setFilters({ isFavorite: filters.isFavorite === 'true' ? '' : 'true' })); setPage(1); }}
              color={filters.isFavorite === 'true' ? 'primary' : 'default'}
              variant={filters.isFavorite === 'true' ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600 }}
            />

            {/* Sort */}
            <Tooltip title="Sort options">
              <IconButton onClick={(e) => setSortAnchor(e.currentTarget)}>
                <MdSort />
              </IconButton>
            </Tooltip>

            {/* View Mode */}
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
              <ToggleButton value="grid"><MdGridView style={{ fontSize: '1.1rem' }} /></ToggleButton>
              <ToggleButton value="list"><MdList style={{ fontSize: '1.1rem' }} /></ToggleButton>
            </ToggleButtonGroup>

            {/* Clear Filters */}
            {(activeFilterCount > 0 || searchInput) && (
              <Button size="small" onClick={clearFilters} color="error" variant="outlined" startIcon={<MdClose />}>
                Clear {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <GridSkeleton count={12} />
      ) : friends.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No friends found"
          description={filters.search || activeFilterCount > 0
            ? "Try adjusting your search or filters"
            : "Add your first friend to get started!"}
          actionLabel={filters.search || activeFilterCount > 0 ? undefined : "Add Friend"}
          onAction={() => navigate('/friends/add')}
        />
      ) : (
        <>
          <Grid container spacing={2.5}>
            {friends.map((friend) => (
              <Grid
                key={friend._id}
                item
                xs={12}
                sm={viewMode === 'grid' ? 6 : 12}
                md={viewMode === 'grid' ? 4 : 12}
                lg={viewMode === 'grid' ? 3 : 12}
              >
                <FriendCard friend={friend} onDelete={() => confirmDelete(friend._id, friend.name)} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Sort Menu */}
      <Menu anchorEl={sortAnchor} open={Boolean(sortAnchor)} onClose={() => setSortAnchor(null)}>
        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
          SORT BY
        </Typography>
        {[['name', 'Name A-Z'], ['createdAt', 'Recently Added'], ['dateOfBirth', 'Birthday']].map(([field, label]) => (
          <MuiMenuItem key={field} onClick={() => { setSortBy(field); setOrder('asc'); setSortAnchor(null); }}
            selected={sortBy === field}
          >
            {label}
          </MuiMenuItem>
        ))}
        <Divider />
        <Typography variant="caption" sx={{ px: 2, py: 0.5, display: 'block', color: 'text.secondary', fontWeight: 600 }}>
          ORDER
        </Typography>
        <MuiMenuItem onClick={() => { setOrder('asc'); setSortAnchor(null); }} selected={order === 'asc'}>Ascending</MuiMenuItem>
        <MuiMenuItem onClick={() => { setOrder('desc'); setSortAnchor(null); }} selected={order === 'desc'}>Descending</MuiMenuItem>
      </Menu>

      {/* Export Menu */}
      <Menu anchorEl={exportAnchor} open={Boolean(exportAnchor)} onClose={() => setExportAnchor(null)}>
        <MuiMenuItem onClick={handleExportPDF}>📄 Export as PDF</MuiMenuItem>
        <MuiMenuItem onClick={handleExportExcel}>📊 Export as Excel</MuiMenuItem>
      </Menu>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null, name: '' })}
        onConfirm={handleDelete}
        title="Delete Friend"
        message={`Are you sure you want to delete "${deleteDialog.name}"? They will be moved to the recycle bin.`}
      />
    </Box>
  );
};

export default Friends;
