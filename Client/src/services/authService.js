import axios from "axios";
import * as httpRequest from "../config/httpsRequest";
import { store } from "../redux/store";
import {
  loginSuccess,
  loginFailed,
  logOutSuccess,
  logOutFailed,
  updateUserSuccess,
  updateUserFailed,
  updateCartSuccess,
} from "../redux/slices/userSlice";
import { setWishlistItems } from "../redux/slices/wishlistSlice";
const USER_KEY = "ducanh_user";
const TOKEN_KEY = "ducanh_token";

// Check if user is already logged in
export const checkAuthState = async () => {
  try {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedUser && storedToken) {
      const user = JSON.parse(storedUser);

      // Update Redux state
      store.dispatch(loginSuccess(user));
      store.dispatch(updateUserSuccess(user));

      // Update wishlist in Redux if the user has a wishlist
      if (user.wishlist) {
        store.dispatch(setWishlistItems(user.wishlist));
      }

      // Cập nhật giỏ hàng trong Redux store
      try {
        const cartResponse = await httpRequest.get(`api/v1/cart/${user._id}`);
        if (cartResponse.data.success) {
          store.dispatch(updateCartSuccess(cartResponse.data.cart || []));
          // Trigger cart updated event
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch (cartError) {
        console.error("Error fetching cart during auth check:", cartError);
      }

      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking auth state:", error);
    return false;
  }
};

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw (
      error.response?.data || { success: false, message: "Registration failed" }
    );
  }
};

// Login user
export const loginUser = async (usernameOrEmail, password) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/login`, {
      usernameOrEmail,
      password,
    });

    if (response.data.success) {
      // Store token in localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
      localStorage.setItem(TOKEN_KEY, response.data.accessToken);

      // Update Redux state
      store.dispatch(loginSuccess(response.data.user));
      store.dispatch(updateUserSuccess(response.data.user));

      // Update wishlist in Redux if the user has a wishlist
      if (response.data.user.wishlist) {
        store.dispatch(setWishlistItems(response.data.user.wishlist));
      }

      // Cập nhật giỏ hàng trong Redux store
      try {
        const cartResponse = await httpRequest.get(
          `api/v1/cart/${response.data.user._id}`
        );
        if (cartResponse.data.success) {
          store.dispatch(updateCartSuccess(cartResponse.data.cart || []));
          // Trigger cart updated event
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } catch (cartError) {
        console.error("Error fetching cart after login:", cartError);
      }

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(loginFailed());
    store.dispatch(updateUserFailed());
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || { success: false, message: "Login failed" };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await httpRequest.post(`api/v1/auth/logout`);

    if (response.data.success) {
      // Clear localStorage
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);

      // Update Redux state
      store.dispatch(logOutSuccess());
      store.dispatch(updateUserSuccess(null));

      // Reload wishlist from localStorage after logout
      const localWishlist = localStorage.getItem("_wishlist");
      if (localWishlist) {
        store.dispatch(setWishlistItems(JSON.parse(localWishlist)));
      } else {
        store.dispatch(setWishlistItems([]));
      }

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(logOutFailed());
    store.dispatch(updateUserFailed());
    console.error("Logout error:", error);

    // Even if API fails, we still clear local storage
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event("storage"));

    return { success: true, message: "Logged out locally" };
  }
};

// Update user information
export const updateUserInfo = async (userData) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/update`, userData);

    if (response.data.success) {
      // Update localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      // Update Redux state
      store.dispatch(updateUserSuccess(response.data.user));

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(updateUserFailed());
    console.error("Update user error:", error.response?.data || error.message);
    throw error.response?.data || { success: false, message: "Update failed" };
  }
};

// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/change-password`, {
      _id: userId,
      current_password: currentPassword,
      new_password: newPassword,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Change password error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Password change failed",
      }
    );
  }
};

// Add address
export const addAddress = async (addressData) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/address`, addressData);

    if (response.data.success) {
      // Update localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      // Update Redux state
      store.dispatch(updateUserSuccess(response.data.user));

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(updateUserFailed());
    console.error("Add address error:", error.response?.data || error.message);
    throw (
      error.response?.data || {
        success: false,
        message: "Adding address failed",
      }
    );
  }
};

// Update address
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await httpRequest.put(
      `api/v1/auth/address/${addressId}`,
      addressData
    );

    if (response.data.success) {
      // Update localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      // Update Redux state
      store.dispatch(updateUserSuccess(response.data.user));

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(updateUserFailed());
    console.error(
      "Update address error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Updating address failed",
      }
    );
  }
};

// Remove address
export const removeAddress = async (addressId, userId) => {
  try {
    const response = await httpRequest.deleted(
      `api/v1/auth/address/${addressId}?user_id=${userId}`
    );

    if (response.data.success) {
      // Update localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));

      // Update Redux state
      store.dispatch(updateUserSuccess(response.data.user));

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(updateUserFailed());
    console.error(
      "Remove address error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Removing address failed",
      }
    );
  }
};

// Get user addresses
export const getUserAddresses = async (userId) => {
  try {
    const response = await httpRequest.get(
      `api/v1/auth/address?user_id=${userId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Get addresses error:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Getting addresses failed",
      }
    );
  }
};

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

// Check if user is logged in
export const isLoggedIn = () => {
  return !!getCurrentUser() && !!getAuthToken();
};

// Setup auth header for axios
export const setupAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Initialize auth header
setupAuthHeader();
