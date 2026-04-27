// src/services/payroll-role-services/payroll-automation.service.js
import { apiClient } from "@/lib/api";

export const payrollAutomationService = {
  getSettings: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/payroll-automation/settings", {
        timeout: 15000,
      });
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to fetch payroll automation settings");
      }
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch payroll automation settings"
      );
    }
  },

  updateSettings: async (payload) => {
    try {
      const response = await apiClient.put(
        "/payroll-compliance/payroll-automation/settings",
        payload,
        { timeout: 15000 }
      );
      const data = response.data;
      if (data.success === false) {
        throw new Error(data.message || "Failed to update payroll automation settings");
      }
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update payroll automation settings"
      );
    }
  },
};
