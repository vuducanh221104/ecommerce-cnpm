import * as httpRequest from "../config/httpsRequest";

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await httpRequest.get("api/v1/category/all");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching categories:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch categories",
      }
    );
  }
};

// Get category by ID
export const getCategoryById = async (categoryId) => {
  try {
    const response = await httpRequest.get(`api/v1/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching category:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch category",
      }
    );
  }
};

// Lấy danh mục theo slug
export const getCategoryBySlug = async (slug) => {
  try {
    const response = await httpRequest.get(`api/v1/category/slug/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by slug:", error);
    throw error;
  }
};

// Tạo danh mục mới
export const createCategory = async (categoryData) => {
  try {
    const response = await httpRequest.post("api/v1/category", categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

// Cập nhật danh mục
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await httpRequest.put(
      `api/v1/category/${id}`,
      categoryData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

// Xóa danh mục
export const deleteCategory = async (id) => {
  try {
    const response = await httpRequest.deleted(`api/v1/category/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
