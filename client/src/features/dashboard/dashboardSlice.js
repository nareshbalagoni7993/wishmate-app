import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load dashboard');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    genderStats: [],
    relationshipStats: [],
    birthdayByMonth: [],
    upcomingBirthdays: [],
    upcomingAnniversaries: [],
    todayBirthdays: [],
    recentFriends: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.genderStats = action.payload.genderStats;
        state.relationshipStats = action.payload.relationshipStats;
        state.birthdayByMonth = action.payload.birthdayByMonth;
        state.upcomingBirthdays = action.payload.upcomingBirthdays;
        state.upcomingAnniversaries = action.payload.upcomingAnniversaries;
        state.todayBirthdays = action.payload.todayBirthdays;
        state.recentFriends = action.payload.recentFriends;
        state.lastFetched = Date.now();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const selectDashboardStats = (state) => state.dashboard.stats;
export const selectGenderStats = (state) => state.dashboard.genderStats;
export const selectBirthdayByMonth = (state) => state.dashboard.birthdayByMonth;
export const selectUpcomingBirthdays = (state) => state.dashboard.upcomingBirthdays;
export const selectUpcomingAnniversaries = (state) => state.dashboard.upcomingAnniversaries;
export const selectTodayBirthdays = (state) => state.dashboard.todayBirthdays;
export const selectRecentFriends = (state) => state.dashboard.recentFriends;
export const selectDashboardLoading = (state) => state.dashboard.loading;

export default dashboardSlice.reducer;
