import * as httpRequest from "../config/httpsRequest";

// Get all materials
export const getAllMaterials = async () => {
  try {
    const response = await httpRequest.get("api/v1/material/all");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching materials:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch materials",
      }
    );
  }
};

// Get material by ID
export const getMaterialById = async (materialId) => {
  try {
    const response = await httpRequest.get(`api/v1/material/${materialId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching material:",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        success: false,
        message: "Failed to fetch material",
      }
    );
  }
};

// Tạo chất liệu mới
export const createMaterial = async (materialData) => {
  try {
    const response = await httpRequest.post("api/v1/material", materialData);
    return response.data;
  } catch (error) {
    console.error("Error creating material:", error);
    throw error;
  }
};

// Cập nhật chất liệu
export const updateMaterial = async (id, materialData) => {
  try {
    const response = await httpRequest.put(
      `api/v1/material/${id}`,
      materialData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating material:", error);
    throw error;
  }
};

// Xóa chất liệu
export const deleteMaterial = async (id) => {
  try {
    const response = await httpRequest.deleted(`api/v1/material/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting material:", error);
    throw error;
  }
};
