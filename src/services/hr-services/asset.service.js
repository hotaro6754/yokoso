// src/services/assetService.js
import { apiClient } from "@/lib/api";

export const assetService = {
  /* =========================
     CATEGORY APIs
  ========================= */

  // Create Asset Category
  createCategory: async (data) => {
    try {
      const response = await apiClient.post(
        "/assets/create-categories",
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create category"
      );
    }
  },

  // Update Asset Category
  updateCategory: async (categoryId, data) => {
    try {
      const response = await apiClient.put(
        `/assets/update-categories/${categoryId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update category"
      );
    }
  },

  // Get all categories
  getCategories: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/get-categories",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch categories"
      );
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId) => {
    try {
      const response = await apiClient.get(
        `/assets/categories/${categoryId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch category"
      );
    }
  },

  // delete category
  deleteCategory: async (categoryId) => {
    try {
      const response = await apiClient.delete(
        `/assets/delete-categories/${categoryId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete category"
      );
    }
  },

  /* =========================
     ASSET APIs (future use)
  ========================= */

  // Create Asset
  createAsset: async (data) => {
    try {
      const response = await apiClient.post("/assets/create-asset", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create asset"
      );
    }
  },

  // Update Asset
  updateAsset: async (assetId, data) => {
    try {
      const response = await apiClient.put(`/assets/update-asset/${assetId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update asset"
      );
    }
  },

  // get all assets
  getAllAssets: async () => {
    try {
      const response = await apiClient.get("/assets/get-all-assets");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch assets"
      );
    }
  },

  // get stat's for the assets
  getAssetsStats: async () => {
    try {
      const response = await apiClient.get("/assets/assets-stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset stats"
      );
    }
  },

  // get asset by ID
  getAssetById: async (assetId) => {
    try {
      const response = await apiClient.get(`/assets/get-asset/${assetId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset"
      );
    }
  },

  // delete asset
  deleteAsset: async (assetId) => {
    try {
      const response = await apiClient.delete(`/assets/delete-asset/${assetId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete asset"
      );
    }
  },

  /* =========================
    ASSIGNMENT APIs
  ========================= */

  // get all assignments
  getAllAssignments: async () => {
    try {
      const response = await apiClient.get("/assets/get-assignments");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch assignments"
      );
    }
  },

  // get active assignments
  getActiveAssignments: async () => {
    try {
      const response = await apiClient.get("/assets/assignments/active");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch active assignments"
      );
    }
  },

  // get assignment by ID
  getAssignment: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/assets/assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch assignment"
      );
    }
  },

  // get assignment stats
  getAssignmentStats: async () => {
    try {
      const response = await apiClient.get("/assets/assignments/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch assignment stats"
      );
    }
  },

  // create assignment
  createAssignment: async (data) => {
    try {
      const response = await apiClient.post("/assets/assignments/create-assignment", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create assignment"
      );
    }
  },

  /* =========================
    Asset Maintenance APIs
  ========================= */

  // Get all maintenance records
  getAllMaintenance: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/get-all-maintenance",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch maintenance records"
      );
    }
  },

  // Get maintenance by ID
  getMaintenanceById: async (maintenanceId) => {
    try {
      const response = await apiClient.get(
        `/assets/maintenance/${maintenanceId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch maintenance record"
      );
    }
  },

  // Create maintenance record
  createMaintenance: async (data) => {
    try {
      const response = await apiClient.post("/assets/create-maintenance-record", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create maintenance record"
      );
    }
  },

  // Update maintenance record
  updateMaintenance: async (maintenanceId, data) => {
    try {
      const response = await apiClient.put(
        `/assets/update-maintenance/${maintenanceId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update maintenance record"
      );
    }
  },

  // Delete maintenance record
  deleteMaintenance: async (maintenanceId) => {
    try {
      const response = await apiClient.delete(
        `/assets/delete-maintenance/${maintenanceId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete maintenance record"
      );
    }
  },

  // Get maintenance stats
  getMaintenanceStats: async () => {
    try {
      const response = await apiClient.get("/assets/maintenance/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch maintenance stats"
      );
    }
  },

  // Get upcoming maintenance
  getUpcomingMaintenance: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/maintenance/upcoming",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch upcoming maintenance"
      );
    }
  },

  /* =========================
    Asset ReportAPIs
  ========================= */

  // Get maintenance cost report
  getMaintenanceCostReport: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/reports/maintenance-cost",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch maintenance cost report"
      );
    }
  },

  // asset Inventory report
  getAssetInventoryReport: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/reports/asset-inventory",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset inventory report"
      );
    }
  },

  // asset depreciation report
  getAssetDepreciationReport: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/reports/depreciation",
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset depreciation report"
      );
    }
  },

  // get asset inventory assignment report
  getAssetInventoryAssignmentReport: async (params = {}) => {
    try {
      const response = await apiClient.get(
        "/assets/reports/assignment-history",
        { params }
      );
      return response.data;
    }
    catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset inventory assignment report"
      );
    }
  },

};