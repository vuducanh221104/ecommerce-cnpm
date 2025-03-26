/**
 * Các hằng số định nghĩa vai trò (role) trong hệ thống
 */

// Người dùng thông thường (khách hàng)
export const ROLE_USER = 0;

// Quản lý (manager)
export const ROLE_MANAGER = 1;

// Quản trị viên (admin)
export const ROLE_ADMIN = 2;

/**
 * Kiểm tra xem người dùng có quyền quản lý (manager trở lên) không
 * @param {Object} user - Đối tượng user từ getCurrentUser()
 * @returns {boolean} - true nếu là manager trở lên, false nếu không phải
 */
export const isManager = (user) => {
  if (!user) return false;
  return user.role >= ROLE_MANAGER;
};

/**
 * Kiểm tra xem người dùng có quyền admin không
 * @param {Object} user - Đối tượng user từ getCurrentUser()
 * @returns {boolean} - true nếu là admin, false nếu không phải
 */
export const isAdmin = (user) => {
  if (!user) return false;
  return user.role >= ROLE_ADMIN;
};

/**
 * Lấy tên vai trò theo mã số
 * @param {number} roleCode - Mã số vai trò
 * @returns {string} - Tên vai trò
 */
export const getRoleName = (roleCode) => {
  switch (roleCode) {
    case ROLE_ADMIN:
      return "Admin";
    case ROLE_MANAGER:
      return "Quản lý";
    case ROLE_USER:
      return "User";
    default:
      return "Unknown";
  }
};

/**
 * Kiểm tra người dùng có quyền truy cập vào khu vực admin không
 * @param {Object} user - Đối tượng user từ getCurrentUser()
 * @returns {boolean} - true nếu có quyền truy cập, false nếu không
 */
export const hasAdminAccess = (user) => {
  return isManager(user);
};

export default {
  ROLE_USER,
  ROLE_MANAGER,
  ROLE_ADMIN,
  isManager,
  isAdmin,
  getRoleName,
  hasAdminAccess,
};
