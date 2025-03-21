import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    isFetching: false,
    error: false,
    cart: [],
    addresses: [],
  },
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },
    loginFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Logout actions
    logOutStart: (state) => {
      state.isFetching = true;
    },
    logOutSuccess: (state) => {
      state.isFetching = false;
      state.currentUser = null;
      state.cart = [];
      state.addresses = [];
      state.error = false;
    },
    logOutFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // User update actions
    updateUserStart: (state) => {
      state.isFetching = true;
    },
    updateUserSuccess: (state, action) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },
    updateUserFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Cart actions
    updateCartStart: (state) => {
      state.isFetching = true;
    },
    updateCartSuccess: (state, action) => {
      state.isFetching = false;
      state.cart = action.payload;
      state.error = false;
    },
    updateCartFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Address actions
    updateAddressesStart: (state) => {
      state.isFetching = true;
    },
    updateAddressesSuccess: (state, action) => {
      state.isFetching = false;
      state.addresses = action.payload;
      state.error = false;
    },
    updateAddressesFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailed,
  logOutStart,
  logOutSuccess,
  logOutFailed,
  updateUserStart,
  updateUserSuccess,
  updateUserFailed,
  updateCartStart,
  updateCartSuccess,
  updateCartFailed,
  updateAddressesStart,
  updateAddressesSuccess,
  updateAddressesFailed,
} = userSlice.actions;

export default userSlice.reducer;
