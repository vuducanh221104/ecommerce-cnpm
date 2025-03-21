import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import userReducer from "./slices/userSlice";
import wishlistReducer from "./slices/wishlistSlice";

// Redux Persist
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

// Persist config
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["currentUser", "cart"], // only persist currentUser and cart
};

const wishlistPersistConfig = {
  key: "wishlist",
  storage,
  whitelist: ["items"], // only persist items array
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedWishlistReducer = persistReducer(
  wishlistPersistConfig,
  wishlistReducer
);

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    user: persistedUserReducer,
    wishlist: persistedWishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);
