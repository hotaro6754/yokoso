// src/services/payroll-role-services/statutory-compliance.service.js
import { apiClient } from "@/lib/api";

export const statutoryComplianceService = {
  /* =========================
     STATUTORY COMPLIANCE OVERVIEW APIs
  ========================= */

  // Get Statutory Compliance Overview
  // Returns comprehensive overview of all statutory compliance statuses:
  // - PF (Provident Fund): Employees covered, total contribution, calculation status
  // - Gratuity: Status, employees covered, basic calculation info
  // - ESI (Employee State Insurance): Employees covered, total contribution, calculation status
  // - PT (Professional Tax): Employees covered, total deduction, calculation status
  // - LWF (Labour Welfare Fund): Employees covered, total contribution, calculation status
  // - TDS (Tax Deducted at Source): Employees covered, total deduction, calculation status
  // 
  // Each compliance type includes:
  // - configured: Boolean - Whether compliance is configured for the company
  // - employeesCovered: Integer - Number of employees covered
  // - totalAmount: Float - Total contribution/deduction amount
  // - lastCalculated: Date - Last calculation date (if available)
  // - status: String - Calculation status
  getComplianceOverview: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/statutory-compliance/overview", {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch statutory compliance overview');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Compliance overview API timeout, returning default structure");
        return {
          success: true,
          data: {
            pf: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
            gratuity: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
            esi: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
            pt: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
            lwf: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
            tds: { configured: false, employeesCovered: 0, totalAmount: 0, status: "PENDING" },
          },
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch statutory compliance overview"
      );
    }
  },

  // Get compliance module data for tabs (calculation/registers/reports/challan)
  getComplianceModuleData: async (type) => {
    try {
      const response = await apiClient.get(`/payroll-compliance/statutory-compliance/${type}/module-data`, {
        timeout: 15000,
      });
      const data = response.data;
      console.log('stg data', data)

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch statutory compliance module data');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Compliance module data API timeout, returning empty data");
        return {
          success: true,
          data: {
            calculation: { stats: { employeesCovered: 0, totalAmount: 0, lastCalculated: null }, rows: [] },
            registers: [],
            reports: { list: [], trend: { labels: [], contribution: [], deduction: [] } },
            challans: { series: [0, 0, 0], items: [] }
          }
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch statutory compliance module data"
      );
    }
  },

  // Run Statutory Calculation for a specific compliance type
  runCalculation: async (type) => {
    try {
      const response = await apiClient.post(`/payroll-compliance/statutory-compliance/${type}/run-calculation`, {});
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to run statutory compliance calculation"
      );
    }
  },
};
