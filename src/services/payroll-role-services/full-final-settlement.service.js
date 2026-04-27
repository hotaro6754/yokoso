// src/services/payroll-role-services/full-final-settlement.service.js
import { apiClient } from "@/lib/api";

export const fullFinalSettlementService = {
  /* =========================
     PENDING SETTLEMENTS APIs
  ========================= */

  // Get Pending Settlements
  // Returns list of employees with pending full & final settlements
  // Includes employees with exit processes in:
  // - PENDING status
  // - IN_PROGRESS status
  // - CLEARANCE_PENDING status
  // 
  // Returns:
  // - Employee details
  // - Resignation information
  // - Exit process status
  // - Last working date
  // - Settlement status
  getPendingSettlements: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/full-final-settlement/pending", {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch pending settlements');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Pending settlements API timeout, returning empty array");
        return { success: true, data: [] };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pending settlements"
      );
    }
  },

  /* =========================
     CLEARED SETTLEMENTS APIs
  ========================= */

  // Get Cleared Settlements
  // Returns list of employees with completed full & final settlements
  // Includes employees with exit processes in COMPLETED status
  // 
  // Returns:
  // - Employee details
  // - Resignation information
  // - Exit process details
  // - Settlement amount
  // - Completion date
  getClearedSettlements: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/full-final-settlement/cleared", {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch cleared settlements');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Cleared settlements API timeout, returning empty array");
        return { success: true, data: [] };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch cleared settlements"
      );
    }
  },

  /* =========================
     CALCULATE SETTLEMENT APIs
  ========================= */

  // Calculate Full & Final Settlement
  // Calculates full & final settlement for an employee
  // 
  // Request Body:
  // - employeeId: Integer (required) - Employee ID
  // - lastWorkingDate: ISO8601 Date (optional) - Last working date (defaults to resignation lastWorkingDate)
  // 
  // Returns:
  // - lastMonthSalary: Float - Last month's salary
  // - leaveEncashment: Float - Leave encashment amount
  // - gratuity: Float - Gratuity amount (basic calculation)
  // - deductions: Float - Total deductions
  // - recoveries: Float - Total recoveries
  // - totalSettlement: Float - Total settlement amount
  // - breakdown: Object - Detailed breakdown of each component
  calculateSettlement: async (data) => {
    try {
      const response = await apiClient.post("/payroll-compliance/full-final-settlement/calculate", data, {
        timeout: 15000,
      });
      const responseData = response.data;

      if (responseData.success === false) {
        throw new Error(responseData.message || 'Failed to calculate settlement');
      }

      return responseData;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error("Request timeout. Please try again.");
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to calculate settlement"
      );
    }
  },
};
