/**
 * WHY: Friends data is the primary app state. Caching it in Redux avoids
 *      re-fetching on navigation within the session.
 * WHAT: CRUD operations for friends with local cache, pagination metadata.
 * HOW: createAsyncThunk wraps API calls. Immer mutations make state updates readable.
 * PERFORMANCE: friends stored as array with a currentFriend for detail view.
 *   RTK Query would be even better for caching, but createAsyncThunk is sufficient.
 * INTERVIEW Q: RTK vs RTK Query?
 *   RTK = manual async thunks (you control everything).
 *   RTK Query = automatic caching, deduplication, refetch-on-focus.
 *   Use RTK Query for data-fetching-heavy apps.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchFriends = createAsyncThunk(
  'friends/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/friends', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch friends');
    }
  }
);

export const fetchFriendById = createAsyncThunk(
  'friends/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/friends/${id}`);
      return data.data.friend;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Friend not found');
    }
  }
);

export const createFriend = createAsyncThunk(
  'friends/create',
  async (friendData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/friends', friendData);
      return data.data.friend;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create friend');
    }
  }
);

export const updateFriend = createAsyncThunk(
  'friends/update',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/friends/${id}`, updates);
      return data.data.friend;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update friend');
    }
  }
);

export const deleteFriend = createAsyncThunk(
  'friends/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/friends/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete friend');
    }
  }
);

export const restoreFriend = createAsyncThunk(
  'friends/restore',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/friends/${id}/restore`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to restore friend');
    }
  }
);

export const permanentDeleteFriend = createAsyncThunk(
  'friends/permanentDelete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/friends/${id}/permanent`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to permanently delete');
    }
  }
);

export const fetchRecycleBin = createAsyncThunk(
  'friends/recycleBin',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/friends/recycle-bin');
      return data.data.friends;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch recycle bin');
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'friends/toggleFavorite',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/friends/${id}/favorite`);
      return { id, isFavorite: data.data.isFavorite };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle favorite');
    }
  }
);

export const toggleArchive = createAsyncThunk(
  'friends/toggleArchive',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/friends/${id}/archive`);
      return { id, isArchived: data.data.isArchived };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to toggle archive');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const friendsSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    currentFriend: null,
    recycleBin: [],
    pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
    filters: { search: '', gender: '', relationship: '', isFavorite: '', isArchived: '' },
    sortBy: 'name',
    order: 'asc',
    loading: false,
    loadingDetail: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    resetFilters: (state) => {
      state.filters = { search: '', gender: '', relationship: '', isFavorite: '', isArchived: '' };
    },
    setSortBy: (state, action) => { state.sortBy = action.payload; },
    setOrder: (state, action) => { state.order = action.payload; },
    setCurrentFriend: (state, action) => { state.currentFriend = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all friends
      .addCase(fetchFriends.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload.data.friends;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      })

      // Fetch by ID
      .addCase(fetchFriendById.pending, (state) => { state.loadingDetail = true; })
      .addCase(fetchFriendById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.currentFriend = action.payload;
      })
      .addCase(fetchFriendById.rejected, (state, action) => {
        state.loadingDetail = false; state.error = action.payload;
      })

      // Create
      .addCase(createFriend.fulfilled, (state, action) => {
        state.friends.unshift(action.payload);
        state.pagination.total += 1;
      })

      // Update
      .addCase(updateFriend.fulfilled, (state, action) => {
        const idx = state.friends.findIndex((f) => f._id === action.payload._id);
        if (idx !== -1) state.friends[idx] = action.payload;
        if (state.currentFriend?._id === action.payload._id) {
          state.currentFriend = action.payload;
        }
      })

      // Delete (soft)
      .addCase(deleteFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter((f) => f._id !== action.payload);
        state.pagination.total -= 1;
      })

      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { id, isFavorite } = action.payload;
        const f = state.friends.find((f) => f._id === id);
        if (f) f.isFavorite = isFavorite;
        if (state.currentFriend?._id === id) state.currentFriend.isFavorite = isFavorite;
      })

      // Toggle archive
      .addCase(toggleArchive.fulfilled, (state, action) => {
        const { id, isArchived } = action.payload;
        state.friends = state.friends.filter((f) => f._id !== id);
        if (state.currentFriend?._id === id) state.currentFriend.isArchived = isArchived;
      })

      // Recycle bin
      .addCase(fetchRecycleBin.fulfilled, (state, action) => {
        state.recycleBin = action.payload;
      })
      .addCase(restoreFriend.fulfilled, (state, action) => {
        state.recycleBin = state.recycleBin.filter((f) => f._id !== action.payload);
      })
      .addCase(permanentDeleteFriend.fulfilled, (state, action) => {
        state.recycleBin = state.recycleBin.filter((f) => f._id !== action.payload);
      });
  },
});

export const {
  setFilters, resetFilters, setSortBy, setOrder, setCurrentFriend, clearError,
} = friendsSlice.actions;

export const selectFriends = (state) => state.friends.friends;
export const selectCurrentFriend = (state) => state.friends.currentFriend;
export const selectFriendsPagination = (state) => state.friends.pagination;
export const selectFriendsLoading = (state) => state.friends.loading;
export const selectFriendsFilters = (state) => state.friends.filters;
export const selectRecycleBin = (state) => state.friends.recycleBin;

export default friendsSlice.reducer;
