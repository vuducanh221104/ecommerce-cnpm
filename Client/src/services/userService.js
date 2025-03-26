import * as httpRequest from "../config/httpsRequest";

// Lấy tất cả người dùng (cho admin)
export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  try {
    let queryParams = `page=${page}&limit=${limit}`;

    // Thêm các filter nếu có
    if (filters.status) queryParams += `&status=${filters.status}`;
    if (filters.role) queryParams += `&role=${filters.role}`;
    if (filters.search) queryParams += `&search=${filters.search}`;
    if (filters.fromDate) queryParams += `&fromDate=${filters.fromDate}`;
    if (filters.toDate) queryParams += `&toDate=${filters.toDate}`;

    const res = await httpRequest.get(`api/v1/user/admin?${queryParams}`);
    return res.data;
  } catch (error) {
    console.error("Get all users error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get users",
      }
    );
  }
};

// Lấy thông tin chi tiết của một người dùng
export const getUserById = async (userId) => {
  try {
    const res = await httpRequest.get(`api/v1/user/${userId}`);
    return res.data;
  } catch (error) {
    console.error("Get user details error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get user details",
      }
    );
  }
};

// Cập nhật thông tin người dùng (cho admin)
export const updateUser = async (userId, userData) => {
  try {
    console.log("Update user API call:", userId, userData);
    const res = await httpRequest.patch(
      `api/v1/user/admin/${userId}`,
      userData
    );
    console.log("Update user API response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Update user error:", error.response || error);
    throw (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to update user",
      }
    );
  }
};

// Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
export const changeUserStatus = async (userId, isActive) => {
  try {
    const res = await httpRequest.patch(`api/v1/user/admin/${userId}/status`, {
      is_active: isActive,
    });
    return res.data;
  } catch (error) {
    console.error("Change user status error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to change user status",
      }
    );
  }
};

// Lấy lịch sử đơn hàng của người dùng
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

// Tạo người dùng mới (cho admin)
export const createUser = async (userData) => {
  try {
    const res = await httpRequest.post(`api/v1/user/admin`, userData);
    return res.data;
  } catch (error) {
    console.error("Create user error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to create user",
      }
    );
  }
};
