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
} from "../redux/slices/userSlice";
import { setWishlistItems } from "../redux/slices/wishlistSlice";
const TOKEN_KEY = "achats_token";

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
      // Store token in localStorage (still needed for API calls)
      localStorage.setItem(TOKEN_KEY, response.data.accessToken);

      // Update Redux state
      store.dispatch(loginSuccess(response.data.user));
      store.dispatch(updateUserSuccess(response.data.user));

      // Update wishlist in Redux if the user has a wishlist
      if (response.data.user.wishlist) {
        store.dispatch(setWishlistItems(response.data.user.wishlist));
      }

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
      // Also trigger a cart and wishlist update
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
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
      // Clear localStorage token
      localStorage.removeItem(TOKEN_KEY);

      // Update Redux state
      store.dispatch(logOutSuccess());

      // Dispatch storage event for other components to detect
      window.dispatchEvent(new Event("storage"));
      // Also trigger a cart and wishlist update
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }

    return response.data;
  } catch (error) {
    store.dispatch(logOutFailed());
    store.dispatch(updateUserFailed());
    console.error("Logout error:", error);

    // Even if API fails, we still clear local storage
    localStorage.removeItem(TOKEN_KEY);
    store.dispatch(logOutSuccess());
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));

    return { success: true, message: "Logged out locally" };
  }
};

// Update user information
export const updateUserInfo = async (userData) => {
  try {
    const response = await httpRequest.post(`api/v1/auth/update`, userData);

    if (response.data.success) {
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
    const response = await httpRequest.delete(
      `api/v1/auth/address/${addressId}?user_id=${userId}`
    );

    if (response.data.success) {
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

// Check if user is logged in
export const isLoggedIn = () => {
  try {
    const state = store.getState();
    const user = state.user.currentUser;
    const token = getAuthToken();

    // If either the user or token is missing, user is not logged in
    if (!user || !token) {
      return false;
    }

    // Additional check for token validity could be added here
    // For now we just check if both user and token exist
    return true;
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem(TOKEN_KEY);
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
