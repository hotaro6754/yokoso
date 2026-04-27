// src/services/payroll-role-services/dashboard.service.js
import { apiClient } from "@/lib/api";

export const payrollDashboardService = {
  /* =========================
     PAYROLL COMPLIANCE DASHBOARD APIs
  ========================= */

  // Get Payroll Compliance Dashboard
  // Returns complete dashboard data including:
  // - Payroll Status (Current Month): Status, employees processed vs total, total payroll
  // - Payroll Exceptions: Missing attendance, missing salary structure, on-hold employees
  // - Statutory Compliance Status: PF, Gratuity, ESI, PT, LWF, TDS calculation status
  // - Upcoming Actions: Payroll run due date, statutory filing reminders
  // 
  // Query Parameters (optional):
  // - month: Integer (1-12) - Month to filter (defaults to current month)
  // - year: Integer (2000-2100) - Year to filter (defaults to current year)
  getDashboard: async (params = {}) => {
    try {
      const response = await apiClient.get("/payroll-compliance/dashboard", {
        params: {
          month: params.month,
          year: params.year,
        },
        timeout: 15000,
      });
      const data = response.data;

      if (data.success === false) {
        throw new Error(data.message || 'Failed to fetch payroll compliance dashboard');
      }

      return data;
    } catch (error) {
      // Handle timeout errors gracefully
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.warn("Dashboard API timeout, returning empty data");
        // Return empty structure so UI doesn't break
        return {
          success: true,
          data: {
            payrollStatus: "NOT_STARTED",
            employeesProcessed: 0,
            totalEmployees: 0,
            missingAttendance: 0,
            missingSalaryStructure: 0,
            onHoldEmployees: 0,
            compliance: {
              pf: "PENDING",
              gratuity: "PENDING",
              esi: "PENDING",
              tds: "PENDING",
            },
            payrollRunDueDate: null,
            filingReminders: [],
          },
        };
      }
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch payroll compliance dashboard"
      );
    }
  },
};
