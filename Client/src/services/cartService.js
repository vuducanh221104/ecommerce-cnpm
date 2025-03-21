import * as httpRequest from "../config/httpsRequest";

// Refresh cart count - trigger update events for components listening for cart changes
export const refreshCartCount = () => {
  // Dispatch an event that can be listened to by other components
  window.dispatchEvent(new Event("cartUpdated"));
};

// Get user's cart
export const getUserCart = async (userId) => {
  try {
    const response = await httpRequest.get(`api/v1/cart/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add item to cart
export const addToCart = async (userId, cartItem) => {
  try {
    const response = await httpRequest.post(`api/v1/cart/${userId}`, cartItem);
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    throw error;
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
    const response = await httpRequest.put(`api/v1/cart/${userId}/item`, {
      product_id: productId,
      color,
      size,
      quantity,
    });
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (userId, productId, color, size) => {
  try {
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

    console.log("Remove item API response:", response.data);
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    console.error("API error when removing item:", error);
    throw error;
  }
};

// Clear cart
export const clearCart = async (userId) => {
  try {
    const response = await httpRequest.deleted(`api/v1/cart/${userId}/clear`);
    refreshCartCount(); // Refresh the cart count
    return response.data;
  } catch (error) {
    throw error;
  }
};
