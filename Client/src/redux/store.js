import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./slices/sidebarSlice";
import userReducer from "./slices/userSlice";
import wishlistReducer from "./slices/wishlistSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Configure persist options
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user", "wishlist"], // Chỉ lưu state của user và wishlist
};

// Create persisted reducers
const persistedUserReducer = persistReducer(
  { ...persistConfig, key: "user" },
  userReducer
);

const persistedWishlistReducer = persistReducer(
  { ...persistConfig, key: "wishlist" },
  wishlistReducer
);

// Configure store
export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    user: persistedUserReducer,
    wishlist: persistedWishlistReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);
