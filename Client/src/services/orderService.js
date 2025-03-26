import * as httpRequest from "../config/httpsRequest";

// Create a new order
export const createOrder = async (orderData) => {
  try {
    // Đảm bảo có thông tin email người dùng
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    const orderWithEmail = {
      ...orderData,
      customer_email: userData.email || orderData.customer_email || null,
    };

    const res = await httpRequest.post("api/v1/order/create", orderWithEmail);
    return res.data;
  } catch (error) {
    console.error("Create order error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to create order",
      }
    );
  }
};

// Get all orders for a user
export const getUserOrders = async (userId) => {
  try {
    const res = await httpRequest.get(`api/v1/order/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get user orders error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get user orders",
      }
    );
  }
};

// Get order details by ID
export const getOrderById = async (orderId) => {
  try {
    const res = await httpRequest.get(`api/v1/order/${orderId}`);
    return res.data;
  } catch (error) {
    console.error("Get order details error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get order details",
      }
    );
  }
};

// Cancel order
export const cancelOrder = async (orderId, userId) => {
  try {
    const res = await httpRequest.patch(`api/v1/order/cancel/${orderId}`, {
      user_id: userId,
    });
    return res.data;
  } catch (error) {
    console.error("Cancel order error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to cancel order",
      }
    );
  }
};

// Get all orders for admin with pagination and filters
export const getAllOrders = async (page = 1, limit = 10, filters = {}) => {
  try {
    let queryParams = `page=${page}&limit=${limit}`;

    // Add filters if available
    if (filters.status) queryParams += `&status=${filters.status}`;
    if (filters.search) queryParams += `&search=${filters.search}`;
    if (filters.fromDate) queryParams += `&fromDate=${filters.fromDate}`;
    if (filters.toDate) queryParams += `&toDate=${filters.toDate}`;
    if (filters.paymentMethod)
      queryParams += `&paymentMethod=${filters.paymentMethod}`;
    if (filters.paymentStatus)
      queryParams += `&paymentStatus=${filters.paymentStatus}`;

    const res = await httpRequest.get(`api/v1/order/admin?${queryParams}`);
    return res.data;
  } catch (error) {
    console.error("Get all orders error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get orders",
      }
    );
  }
};

// Update order (status, shipping info, etc.)
export const updateOrder = async (orderId, updateData) => {
  try {
    const res = await httpRequest.patch(
      `api/v1/order/admin/${orderId}`,
      updateData
    );
    return res.data;
  } catch (error) {
    console.error("Update order error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update order",
      }
    );
  }
};
