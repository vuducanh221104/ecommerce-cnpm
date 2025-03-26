// Wishlist service to manage favorite products in localStorage and database
import * as httpRequest from "../config/httpsRequest";
import { store } from "../redux/store";
import {
  addToWishlistSuccess,
  removeFromWishlistSuccess,
  clearWishlistSuccess,
  setWishlistItems,
} from "../redux/slices/wishlistSlice";
import { updateUserSuccess } from "../redux/slices/userSlice";

const WISHLIST_KEY = "ducanh_wishlist";

// Helper to get current user from Redux
const getCurrentUser = () => {
  const state = store.getState();
  return state.user.currentUser;
};

// Get all wishlist items
export const getWishlistItems = async () => {
  try {
    // Check if user is logged in
    const currentUser = getCurrentUser();

    if (currentUser) {
      // Get wishlist from database for logged-in users
      try {
        const response = await httpRequest.get(
          `api/v1/wishlist/${currentUser._id}`
        );
        if (response.data.success) {
          // Update Redux store
          store.dispatch(setWishlistItems(response.data.wishlist));
          return response.data.wishlist;
        } else {
          console.error(
            "Error fetching wishlist from API:",
            response.data.message
          );
        }
      } catch (error) {
        console.error("API error getting wishlist:", error);
      }
    }

    // Fallback to localStorage or if user is not logged in
    const wishlistItems = localStorage.getItem(WISHLIST_KEY);
    const items = wishlistItems ? JSON.parse(wishlistItems) : [];

    // Update Redux store with items from localStorage
    store.dispatch(setWishlistItems(items));
    return items;
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return [];
  }
};

// Refresh wishlist count - this can be called after operations
// that might affect the wishlist count
export const refreshWishlistCount = async () => {
  await getWishlistItems();
  // Trigger a DOM event that can be listened to
  window.dispatchEvent(new Event("wishlistUpdated"));
};

// Add a product to wishlist
export const addToWishlist = async (product) => {
  if (!product || !product._id) {
    console.error("Invalid product data:", product);
    return { success: false, message: "Invalid product data" };
  }

  try {
    // Create the new wishlist item with proper category handling
    const newItem = {
      product_id: product._id,
      name: product.name || "Unknown Product",
      slug: product.slug || "",
      thumb: product.thumb || "",
      price: product.price || { original: 0, discount: 0 },
      // Store product color information if available
      color: product.color || "Gray",
      // Better handling of category information
      category_id: product.category_id || [],
      // Enhanced category_name handling
      category_name:
        product.category_name || // Use existing category_name if available
        (product.category_id &&
          Array.isArray(product.category_id) &&
          product.category_id.length > 0 &&
          // Try to access name directly if it's a string
          ((typeof product.category_id[0] === "string" &&
            product.category_id[0]) ||
            // Try to access name property if it's an object
            (typeof product.category_id[0] === "object" &&
              product.category_id[0] &&
              product.category_id[0].name))) ||
        "N/A", // Default to N/A if no category name is found
      addedAt: new Date().toISOString(),
    };

    // Check if user is logged in
    const currentUser = getCurrentUser();

    if (currentUser) {
      // Save to database for logged-in users
      try {
        const response = await httpRequest.post(
          `api/v1/wishlist/${currentUser._id}`,
          newItem
        );

        if (response.data.success) {
          // Update Redux store (both wishlist and user state)
          store.dispatch(addToWishlistSuccess(newItem));

          // Update user's wishlist in Redux if it was returned in the response
          if (response.data.wishlist) {
            const updatedUser = { ...currentUser };
            updatedUser.wishlist = response.data.wishlist;
            store.dispatch(updateUserSuccess(updatedUser));
          }

          // Refresh wishlist count
          await refreshWishlistCount();
          return { success: true, message: "Product added to wishlist" };
        } else {
          return {
            success: false,
            message:
              response.data.message || "Failed to add product to wishlist",
          };
        }
      } catch (error) {
        console.error("API error adding to wishlist:", error);
      }
    }

    // For non-logged in users or if API call fails, use localStorage
    // Get current wishlist items
    const wishlistItems = localStorage.getItem(WISHLIST_KEY);
    const items = wishlistItems ? JSON.parse(wishlistItems) : [];

    // Check if the product is already in the wishlist
    const existingItemIndex = items.findIndex(
      (item) => item._id === product._id || item.product_id === product._id
    );

    if (existingItemIndex === -1) {
      // Need to ensure the item has _id for localStorage comparison
      const localItem = {
        ...newItem,
        _id: product._id, // Add _id field for localStorage items
      };

      // Create a new array with the new item (avoid modifying existing array)
      const updatedWishlist = [...items, localItem];

      // Save to localStorage
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));

      // Update Redux store
      store.dispatch(addToWishlistSuccess(localItem));

      // Refresh wishlist count
      await refreshWishlistCount();
      return { success: true, message: "Product added to wishlist" };
    } else {
      return { success: false, message: "Product already in wishlist" };
    }
  } catch (error) {
    console.error("Error adding product to wishlist:", error);
    return { success: false, message: "Failed to add product to wishlist" };
  }
};

// Remove a product from wishlist
export const removeFromWishlist = async (productId) => {
  if (!productId) {
    return { success: false, message: "Invalid product ID" };
  }

  console.log("Attempting to remove product from wishlist:", productId);
  console.log("Product ID type:", typeof productId);

  try {
    // Check if user is logged in
    const currentUser = getCurrentUser();

    if (currentUser) {
      // Remove from database for logged-in users
      try {
        console.log("Sending API request to remove from wishlist:", {
          userId: currentUser._id,
          productId: productId,
        });

        // For API calls, we need to send the product_id, not _id
        // If productId is an object, try to use the product_id or _id property
        let apiProductId = productId;
        if (typeof productId === "object" && productId !== null) {
          apiProductId = productId.product_id || productId._id || productId;
        }

        console.log("Using API product ID:", apiProductId);

        const response = await httpRequest.deleted(
          `api/v1/wishlist/${currentUser._id}/item`,
          {
            data: { product_id: apiProductId },
          }
        );

        console.log("Server response for wishlist removal:", response.data);

        if (response.data.success) {
          // Update Redux store (both wishlist and user state)
          store.dispatch(removeFromWishlistSuccess(productId));

          // Update user's wishlist in Redux if it was returned in the response
          if (response.data.wishlist) {
            const updatedUser = { ...currentUser };
            updatedUser.wishlist = response.data.wishlist;
            store.dispatch(updateUserSuccess(updatedUser));
          }

          // Refresh wishlist count
          await refreshWishlistCount();
          return { success: true, message: "Product removed from wishlist" };
        } else {
          return {
            success: false,
            message:
              response.data.message || "Failed to remove product from wishlist",
          };
        }
      } catch (error) {
        console.error("API error removing from wishlist:", error);
      }
    }

    // For non-logged in users or if API call fails, use localStorage
    let wishlistItems = localStorage.getItem(WISHLIST_KEY);
    const items = wishlistItems ? JSON.parse(wishlistItems) : [];
    const initialLength = items.length;

    console.log("Checking localStorage wishlist items:", items.length);

    // Determine which ID field to check against
    const localStorageProductId =
      typeof productId === "object" && productId !== null
        ? productId.product_id || productId._id
        : productId;

    console.log("Using localStorage product ID:", localStorageProductId);

    // Create a new filtered array instead of modifying the original
    const updatedWishlist = items.filter((item) => {
      // For localStorage items, check both _id and product_id if available
      const itemProductId = item.product_id || item._id;
      const match = String(itemProductId) !== String(localStorageProductId);
      console.log(
        `Comparing localStorage: ${itemProductId} vs ${localStorageProductId}, keeping: ${match}`
      );
      return match;
    });

    if (updatedWishlist.length !== initialLength) {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updatedWishlist));

      // Update Redux store
      store.dispatch(removeFromWishlistSuccess(localStorageProductId));

      // Refresh wishlist count
      await refreshWishlistCount();
      return { success: true, message: "Product removed from wishlist" };
    } else {
      return { success: false, message: "Product not found in wishlist" };
    }
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return {
      success: false,
      message: "Failed to remove product from wishlist",
    };
  }
};

// Check if a product is in the wishlist
export const isInWishlist = (productId) => {
  if (!productId) return false;

  try {
    // Get items from Redux store for faster check
    const state = store.getState();
    const items = state.wishlist.items;

    return items.some((item) => item._id === productId);
  } catch (error) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

// Clear the entire wishlist
export const clearWishlist = async () => {
  try {
    // Check if user is logged in
    const currentUser = getCurrentUser();

    if (currentUser) {
      // Clear from database for logged-in users
      try {
        const response = await httpRequest.deleted(
          `api/v1/wishlist/${currentUser._id}/clear`
        );

        if (response.data.success) {
          // Update Redux store (both wishlist and user state)
          store.dispatch(clearWishlistSuccess());

          // Update user's wishlist in Redux if it was returned in the response
          if (response.data.wishlist !== undefined) {
            const updatedUser = { ...currentUser };
            updatedUser.wishlist = response.data.wishlist;
            store.dispatch(updateUserSuccess(updatedUser));
          }

          // Refresh wishlist count
          await refreshWishlistCount();
          return { success: true, message: "Wishlist cleared" };
        } else {
          return {
            success: false,
            message: response.data.message || "Failed to clear wishlist",
          };
        }
      } catch (error) {
        console.error("API error clearing wishlist:", error);
      }
    }

    // For non-logged in users or if API call fails, use localStorage
    localStorage.removeItem(WISHLIST_KEY);

    // Update Redux store
    store.dispatch(clearWishlistSuccess());

    // Refresh wishlist count
    await refreshWishlistCount();
    return { success: true, message: "Wishlist cleared" };
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    return { success: false, message: "Failed to clear wishlist" };
  }
};
