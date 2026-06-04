import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import dailyUpdateReducer from '../features/dailyUpdate/dailyUpdateSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dailyUpdate: dailyUpdateReducer,
  },
});

export default store;
