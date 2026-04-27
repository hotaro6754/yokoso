import { apiClient } from "@/lib/api";

export const payrollSalaryComponentsService = {
  getAllSalaryComponents: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/salary-components", {
        params: {
          page: params.page || 1,
          limit: params.limit || 50,
          type: params.type,
          search: params.search,
          salaryStructureId: params.salaryStructureId
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch salary components"
      );
    }
  },

  getSalaryComponentById: async (id) => {
    try {
      const response = await apiClient.get(`/payroll-compliance/salary-components/${id}`, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch salary component"
      );
    }
  },

  createSalaryComponent: async (data) => {
    try {
      const response = await apiClient.post("/payroll-compliance/salary-components", data, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create salary component"
      );
    }
  },

  updateSalaryComponent: async (id, data) => {
    try {
      const response = await apiClient.put(`/payroll-compliance/salary-components/${id}`, data, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update salary component"
      );
    }
  },

  deleteSalaryComponent: async (id) => {
    try {
      const response = await apiClient.delete(`/payroll-compliance/salary-components/${id}`, {
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete salary component"
      );
    }
  }
};
