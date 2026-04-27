// src/services/payroll-role-services/salary-structure.service.js
import { apiClient } from "@/lib/api";

export const payrollSalaryStructureService = {
  /* =========================
     SALARY STRUCTURES APIs
  ========================= */

  // Get All Salary Structures
  // Returns paginated list of salary structures with employee details
  // 
  // Query Parameters (optional):
  // - page: Integer (min: 1) - Page number (default: 1)
  // - limit: Integer (min: 1, max: 100) - Items per page (default: 10)
  // - status: String - Filter by status (e.g., "ACTIVE", "INACTIVE")
  getAllSalaryStructures: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/salary-structure", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          status: params.status,
          search: params.search,
          employeeId: params.employeeId,
        },
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch salary structures');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Salary structures API timeout, returning empty array");
        return {
          success: true,
          data: {
            salaryStructures: [],
            pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }
          }
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structures"
      );
    }
  },

  // Create New Salary Structure
  // Creates a new salary structure with components
  // 
  // Request Body:
  // - name: String (required) - Structure name
  // - description: String (optional) - Structure description
  // - ctcRange: String (optional) - CTC range (e.g., "₹5L - ₹10L")
  // - band: String (optional) - Salary band
  // - effectiveFrom: Date (optional) - Effective date
  // - status: String (optional) - Status ("ACTIVE" or "INACTIVE")
  // - components: Array (optional) - Salary components
  createSalaryStructure: async (structureData) => {
    try {
      const response = await apiClient.post("/payroll-compliance/salary-structure", structureData, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to create salary structure');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create salary structure"
      );
    }
  },

  // Update Salary Structure
  // Updates an existing salary structure
  // 
  // Path Parameters:
  // - id: Integer - Salary structure ID
  // 
  // Request Body: Same as create structure (all fields optional)
  updateSalaryStructure: async (id, updateData) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/salary-structure/${id}`, updateData, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to update salary structure');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update salary structure"
      );
    }
  },

  // Delete Salary Structure
  // Deletes a salary structure by ID
  // 
  // Path Parameters:
  // - id: Integer - Salary structure ID
  deleteSalaryStructure: async (id) => {
    try {
      const response = await apiClient.delete(`/payroll-compliance/salary-structure/${id}`, {
        timeout: 15000,
      });
      const data = response.data;
      console.log('data', data)

      if (data.success === false) {
        throw new Error(data.message || 'Failed to delete salary structure');
      }

      return data;
    } catch (error) {
      const serverError = error.response?.data;
      const errorMessage = serverError?.error || serverError?.message || error.message || "Failed to delete salary structure";
      throw new Error(errorMessage);
    }
  },

  /* =========================
     SALARY STRUCTURE STATISTICS APIs
  ========================= */

  // Get Salary Structure Statistics
  // Returns statistics about salary structures:
  // - Total structures
  // - Active structures
  // - Employees with structures
  // - Average CTC, etc.
  getSalaryStructureStats: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/salary-structure/stats", {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch salary structure statistics');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structure statistics"
      );
    }
  },

  /* =========================
     GET SALARY STRUCTURE BY ID APIs
  ========================= */

  // Get Salary Structure by ID
  // Returns detailed information about a specific salary structure including:
  // - Structure details (CTC, components, effective date)
  // - Employee information
  // - Salary components breakdown
  // 
  // Path Parameters:
  // - id: Integer - Salary structure ID
  getSalaryStructureById: async (id) => {
    try {
      const response = await apiClient.get(`/payroll-compliance/salary-structure/${id}`, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch salary structure');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary structure"
      );
    }
  },

  // Get Salary History
  getSalaryHistory: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/salary-structure/history", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          employeeId: params.employeeId,
          search: params.search
        },
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch salary history');
      }

      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch salary history"
      );
    }
  },
  // Get Salary Revisions
  getRevisions: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/revisions", {
        params,
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) throw new Error(data.message || 'Failed to fetch salary revisions');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch salary revisions");
    }
  },

  // Create Salary Revision
  createRevision: async (data) => {
    try {
      const response = await apiClient.post("/payroll-compliance/revisions", data, {
        timeout: 15000,
      });
      const resData = response.data;
      if (resData.success === false) throw new Error(resData.message || 'Failed to create salary revision');
      return resData;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to create salary revision");
    }
  },

  // Update Salary Revision Status
  updateRevisionStatus: async (id, action) => {
    try {
      const response = await apiClient.patch(`/payroll-compliance/revisions/${id}/status`, { action }, {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) throw new Error(data.message || 'Failed to update salary revision status');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update salary revision status");
    }
  },
  // Update Salary Revision Status (Bulk)
  bulkUpdateRevisionStatus: async (ids, action) => {
    try {
      const response = await apiClient.patch('/payroll-compliance/revisions/bulk-status', { ids, action }, {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) throw new Error(data.message || 'Failed to update salary revisions');
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update salary revisions");
    }
  },
};
