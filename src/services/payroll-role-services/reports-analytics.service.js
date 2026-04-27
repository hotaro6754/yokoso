// src/services/payroll-role-services/reports-analytics.service.js
import { apiClient } from "@/lib/api";

export const payrollReportsAnalyticsService = {
  /* =========================
     PAYROLL REPORTS APIs
  ========================= */

  // Get Payroll Reports
  // Returns paginated list of generated payroll reports
  // 
  // Query Parameters (optional):
  // - page: Integer (min: 1) - Page number (default: 1)
  // - limit: Integer (min: 1, max: 100) - Items per page (default: 10)
  // - type: String - Filter by report type (e.g., "payroll-summary", "tax-report", "department-wise")
  // - period: String - Filter by period (e.g., "January 2026", "Q4 2025")
  // 
  // Returns:
  // - reports: Array of report objects with:
  //   - id, name, type, period
  //   - generatedDate, format, size
  //   - generatedBy employee details
  // - pagination: Pagination metadata
  getPayrollReports: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/reports-analytics/reports", {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          type: params.type,
          period: params.period,
        },
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch payroll reports');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Payroll reports API timeout, returning empty array");
        return { 
          success: true, 
          data: { 
            reports: [], 
            pagination: { currentPage: 1, totalPages: 0, totalItems: 0 } 
          } 
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll reports"
      );
    }
  },

  /* =========================
     PAYROLL ANALYTICS APIs
  ========================= */

  // Get Payroll Analytics
  // Returns high-level analytics about payroll reports:
  // - totalReports: Integer - Total number of reports generated
  // - reportsThisMonth: Integer - Number of reports generated this month
  // - totalDistributed: Float - Total amount distributed across all payrolls
  // 
  // This provides summary statistics for dashboard widgets
  getPayrollAnalytics: async () => {
    try {
      const response = await apiClient.get("/payroll-compliance/reports-analytics/analytics", {
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch payroll analytics');
      }

      return data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Payroll analytics API timeout, returning default values");
        return { 
          success: true, 
          data: { 
            totalReports: 0, 
            reportsThisMonth: 0, 
            totalDistributed: 0 
          } 
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll analytics"
      );
    }
  },
};
