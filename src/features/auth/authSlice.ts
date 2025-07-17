import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isAuthenticated: false,
  phoneNumber: null as string | null,
  user: null, // You can store more user details here


};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.phoneNumber = action.payload.phoneNumber;
      state.user = action.payload.user; // Store full user object if available
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.phoneNumber = null;
      state.user = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;