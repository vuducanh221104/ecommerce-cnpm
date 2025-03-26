import * as httpRequest from "../config/httpsRequest";
import axios from "axios";

export const getAllProducts = async () => {
  try {
    const res = await httpRequest.get("api/v1/product", {});
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const res = await httpRequest.get(`api/v1/product/${slug}`, {});
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getProductById = async (id) => {
  try {
    const res = await httpRequest.get(`api/v1/product/${id}`, {});
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const searchProductsByQuery = async (query, limit = 0) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("q", query);

    if (limit > 0) {
      queryParams.append("limit", limit);
    }

    const res = await httpRequest.get(
      `api/v1/product/search/query?${queryParams.toString()}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

export const getProductsByCategory = async (categorySlug, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add filter parameters
    if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
    if (filters.sortBy) queryParams.append("sortBy", filters.sortBy);

    const res = await httpRequest.get(
      `api/v1/product/category/${categorySlug}?${queryParams.toString()}`,
      {}
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    throw error;
  }
};

export const searchProducts = async (params = {}) => {
  try {
    const res = await httpRequest.get("api/v1/product/search/filter", {
      params,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getFeaturedProducts = async () => {
  try {
    const res = await httpRequest.get("api/v1/product/featured/list", {});
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// Get comments for a product
export const getProductComments = async (productId, page = 1, limit = 10) => {
  try {
    const response = await httpRequest.get(
      `api/v1/product/${productId}/comments`,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching product comments:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch comments",
      }
    );
  }
};

// Add a new comment to a product
export const addProductComment = async (productId, commentData) => {
  try {
    const response = await httpRequest.post(
      `api/v1/product/${productId}/comment`,
      commentData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error adding comment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to add comment",
      }
    );
  }
};

// Reply to a comment
export const replyToComment = async (productId, commentId, replyData) => {
  try {
    const response = await httpRequest.post(
      `api/v1/product/${productId}/comment/${commentId}/reply`,
      replyData
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error replying to comment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || { success: false, message: "Failed to add reply" }
    );
  }
};

// Like a comment
export const likeComment = async (productId, commentId, data = {}) => {
  try {
    const response = await httpRequest.post(
      `api/v1/product/${productId}/comment/${commentId}/like`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error liking comment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to like comment",
      }
    );
  }
};

// Unlike a comment
export const unlikeComment = async (productId, commentId, data = {}) => {
  try {
    const response = await httpRequest.post(
      `api/v1/product/${productId}/comment/${commentId}/unlike`,
      data
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error unliking comment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to unlike comment",
      }
    );
  }
};

// Check user liked comments
export const getUserLikedComments = async (productId, userId) => {
  try {
    const response = await httpRequest.get(
      `api/v1/product/${productId}/liked-comments`,
      {
        params: { user_id: userId },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error getting liked comments:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to get liked comments",
      }
    );
  }
};

// ADMIN SERVICES FOR PRODUCT MANAGEMENT

// Get products with pagination
export const getProductsWithPagination = async (page = 1, limit = 10) => {
  try {
    const response = await httpRequest.get("api/v1/product", {
      params: {
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (productData) => {
  try {
    const response = await httpRequest.post("api/v1/product", productData);
    return response.data;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId, productData) => {
  try {
    const response = await httpRequest.put(
      `api/v1/product/${productId}`,
      productData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (productId) => {
  try {
    const response = await httpRequest.deleted(`api/v1/product/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Get all comments from all products (for admin)
export const getAllProductComments = async (
  page = 1,
  limit = 10,
  filters = {}
) => {
  try {
    let queryParams = `page=${page}&limit=${limit}`;

    // Add filters if they exist
    if (filters.productId) queryParams += `&productId=${filters.productId}`;
    if (filters.rating) queryParams += `&rating=${filters.rating}`;
    if (filters.search) queryParams += `&search=${filters.search}`;
    if (filters.fromDate) queryParams += `&fromDate=${filters.fromDate}`;
    if (filters.toDate) queryParams += `&toDate=${filters.toDate}`;

    const response = await httpRequest.get(
      `api/v1/product/comments/all?${queryParams}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all product comments:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch all comments",
      }
    );
  }
};

// Update comment status (approve/hide)
export const updateCommentStatus = async (productId, commentId, status) => {
  try {
    const response = await httpRequest.patch(
      `api/v1/product/${productId}/comment/${commentId}/status`,
      { status }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating comment status:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to update comment status",
      }
    );
  }
};

// Delete comment
export const deleteComment = async (productId, commentId) => {
  try {
    console.log(
      `Sending DELETE request to: api/v1/product/${productId}/comment/${commentId}`
    );

    if (!productId || !commentId) {
      throw new Error("Missing productId or commentId");
    }

    const response = await httpRequest.deleted(
      `api/v1/product/${productId}/comment/${commentId}`
    );

    console.log("Delete comment response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting comment:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: error.message || "Failed to delete comment",
      }
    );
  }
};
