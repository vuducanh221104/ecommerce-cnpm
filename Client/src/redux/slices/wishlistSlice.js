import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    isFetching: false,
    error: false,
  },
  reducers: {
    // Add item to wishlist
    addToWishlistStart: (state) => {
      state.isFetching = true;
    },
    addToWishlistSuccess: (state, action) => {
      state.isFetching = false;
      state.items = [...state.items, action.payload];
      state.error = false;
    },
    addToWishlistFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Remove item from wishlist
    removeFromWishlistStart: (state) => {
      state.isFetching = true;
    },
    removeFromWishlistSuccess: (state, action) => {
      state.isFetching = false;

      // Handle both _id and product_id for comparison
      state.items = state.items.filter((item) => {
        // Convert both IDs to strings for comparison
        const itemId = (item._id || "").toString();
        const itemProductId = (item.product_id || "").toString();
        const payloadId = (action.payload || "").toString();

        // Remove if either _id or product_id matches
        return itemId !== payloadId && itemProductId !== payloadId;
      });

      state.error = false;
    },
    removeFromWishlistFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Clear wishlist
    clearWishlistStart: (state) => {
      state.isFetching = true;
    },
    clearWishlistSuccess: (state) => {
      state.isFetching = false;
      state.items = [];
      state.error = false;
    },
    clearWishlistFailed: (state) => {
      state.isFetching = false;
      state.error = true;
    },

    // Set wishlist items (for initial load)
    setWishlistItems: (state, action) => {
      state.items = action.payload;
    },
  },
});

export const {
  addToWishlistStart,
  addToWishlistSuccess,
  addToWishlistFailed,
  removeFromWishlistStart,
  removeFromWishlistSuccess,
  removeFromWishlistFailed,
  clearWishlistStart,
  clearWishlistSuccess,
  clearWishlistFailed,
  setWishlistItems,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
