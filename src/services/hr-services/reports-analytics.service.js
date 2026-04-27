// src/services/hr-services/reports-analytics.service.js
import { apiClient } from "@/lib/api";

export const reportsAnalyticsService = {
  /* =========================
     HEADCOUNT REPORT
  ========================= */

  // Get Headcount Report
  getHeadcountReport: async (params = {}) => {
    try {
      const response = await apiClient.get("/hr-reports/headcount", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch headcount report"
      );
    }
  },

  /* =========================
     ATTRITION REPORT
  ========================= */

  // Get Attrition Report
  getAttritionReport: async (params = {}) => {
    try {
      const response = await apiClient.get("/hr-reports/attrition", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch attrition report"
      );
    }
  },

  /* =========================
     ATTENDANCE SUMMARY REPORT
  ========================= */

  // Get Attendance Summary Report
  getAttendanceSummaryReport: async (params = {}) => {
    try {
      const response = await apiClient.get("/hr-reports/attendance-summary", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch attendance summary report"
      );
    }
  },

  /* =========================
     LEAVE UTILIZATION REPORT
  ========================= */

  // Get Leave Utilization Report
  getLeaveUtilizationReport: async (params = {}) => {
    try {
      const response = await apiClient.get("/hr-reports/leave-utilization", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch leave utilization report"
      );
    }
  },
};
