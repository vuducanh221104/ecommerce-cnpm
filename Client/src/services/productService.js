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
