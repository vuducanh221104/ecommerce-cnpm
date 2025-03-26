import * as httpRequest from "../config/httpsRequest";
import { store } from "../redux/store";
import { updateCartSuccess } from "../redux/slices/userSlice";

const CART_STORAGE_KEY = "cart_items";

// Helper để lấy thông tin user hiện tại từ Redux
const getCurrentUser = () => {
  const state = store.getState();
  return state.user.currentUser;
};

// Get cart items from localStorage
export const getCartItems = () => {
  const cartItems = localStorage.getItem(CART_STORAGE_KEY);
  return cartItems ? JSON.parse(cartItems) : [];
};

// Get user's cart
export const getUserCart = async (userId) => {
  try {
    // Nếu không có userId, thử lấy từ Redux store
    if (!userId) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser._id) {
        userId = currentUser._id;
      } else {
        return { success: false, message: "User not found", cart: [] };
      }
    }

    const response = await httpRequest.get(`api/v1/cart/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return { success: false, message: "Failed to fetch cart", cart: [] };
  }
};

// Add item to cart
export const addToCart = async (cartItem) => {
  try {
    // Kiểm tra người dùng đã đăng nhập chưa
    const currentUser = getCurrentUser();

    if (currentUser && currentUser._id) {
      // Nếu đã đăng nhập, thêm vào giỏ hàng trên server
      const response = await httpRequest.post(
        `api/v1/cart/${currentUser._id}`,
        cartItem
      );

      // Cập nhật Redux store với giỏ hàng mới
      if (response.data.success && response.data.cart) {
        store.dispatch(updateCartSuccess(response.data.cart));
      }

      refreshCartCount(); // Refresh the cart count
      return response.data;
    } else {
      // Xử lý trường hợp chưa đăng nhập - có thể lưu vào localStorage
      // để đồng bộ sau khi đăng nhập
      console.warn("User not logged in. Please login to add items to cart.");
      return {
        success: false,
        message: "Please login to add items to cart",
        redirectToLogin: true,
      };
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      message: "Failed to add item to cart",
    };
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (
  userId,
  productId,
  color,
  size,
  quantity
) => {
  try {
    console.log("CartService - updateCartItemQuantity called with:", {
      userId,
      productId,
      color,
      size,
      quantity,
      productIdType: typeof productId,
    });

    // Kiểm tra userId hoặc lấy từ Redux
    if (!userId) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser._id) {
        userId = currentUser._id;
      } else {
        return { success: false, message: "User not found" };
      }
    }

    // Ensure productId is a string for consistency
    const product_id =
      productId && typeof productId === "object" && productId.toString
        ? productId.toString()
        : productId;

    const response = await httpRequest.put(`api/v1/cart/${userId}/item`, {
      product_id,
      color,
      size,
      quantity,
    });

    // Cập nhật Redux store
    if (response.data.success && response.data.cart) {
      store.dispatch(updateCartSuccess(response.data.cart));
    }

    console.log("CartService - update response:", response.data);
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    console.error(
      "CartService - update error:",
      error.response?.data || error.message
    );
    return { success: false, message: "Failed to update cart item" };
  }
};

// Remove item from cart
export const removeFromCart = async (userId, productId, color, size) => {
  try {
    // Kiểm tra userId hoặc lấy từ Redux
    if (!userId) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser._id) {
        userId = currentUser._id;
      } else {
        return { success: false, message: "User not found" };
      }
    }

    console.log("Sending remove item request:", {
      userId,
      product_id: productId,
      color,
      size,
    });

    const response = await httpRequest.deleted(`api/v1/cart/${userId}/item`, {
      data: {
        product_id: productId,
        color,
        size,
      },
    });

    // Cập nhật Redux store
    if (response.data.success && response.data.cart) {
      store.dispatch(updateCartSuccess(response.data.cart));
    }

    console.log("Remove item API response:", response.data);
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    console.error("API error when removing item:", error);
    return { success: false, message: "Failed to remove item from cart" };
  }
};

// Clear cart
export const clearCart = async (userId) => {
  try {
    // Kiểm tra userId hoặc lấy từ Redux
    if (!userId) {
      const currentUser = getCurrentUser();
      if (currentUser && currentUser._id) {
        userId = currentUser._id;
      } else {
        return { success: false, message: "User not found" };
      }
    }

    const response = await httpRequest.deleted(`api/v1/cart/${userId}/clear`);

    // Cập nhật Redux store
    if (response.data.success) {
      store.dispatch(updateCartSuccess([]));
    }

    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, message: "Failed to clear cart" };
  }
};

// Refresh cart count - trigger update events for components listening for cart changes
export const refreshCartCount = () => {
  // Dispatch an event that can be listened to by other components
  window.dispatchEvent(new Event("cartUpdated"));
};
