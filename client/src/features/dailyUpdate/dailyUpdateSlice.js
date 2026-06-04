import { createSlice } from '@reduxjs/toolkit';
import { fetchTodayDailyUpdate, submitDailyUpdate } from './dailyUpdateThunks';

const initialState = {
  todayUpdate: null,
  activeGoals: [],
  completed: false,
  loading: false,
  error: '',
  success: false,
};

const dailyUpdateSlice = createSlice({
  name: 'dailyUpdate',
  initialState,
  reducers: {
    clearDailyUpdateStatus(state) {
      state.error = '';
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayDailyUpdate.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchTodayDailyUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.todayUpdate = action.payload.data || null;
        state.activeGoals = action.payload.activeGoals || [];
        state.completed = Boolean(action.payload.completed);
      })
      .addCase(fetchTodayDailyUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load daily update status.';
      })
      .addCase(submitDailyUpdate.pending, (state) => {
        state.loading = true;
        state.error = '';
        state.success = false;
      })
      .addCase(submitDailyUpdate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.completed = true;
        state.todayUpdate = action.payload.data;
      })
      .addCase(submitDailyUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to submit daily update.';
      });
  },
});

export const { clearDailyUpdateStatus } = dailyUpdateSlice.actions;
export default dailyUpdateSlice.reducer;
