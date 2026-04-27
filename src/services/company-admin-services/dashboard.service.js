import { apiClient } from "@/lib/api";

const resolvePayload = (response) => {
  const payload = response.data;

  if (payload?.success === false) {
    throw new Error(payload.message || "Failed to fetch dashboard data");
  }

  return payload?.data || payload;
};

export const dashboardService = {
  // Get Complete Dashboard Data (using HR dashboard API)
  getCompleteDashboard: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch dashboard data"
      );
    }
  },

  // Get Headcount Summary
  getHeadcountSummary: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/headcount-summary");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch headcount summary"
      );
    }
  },

  // Get Attendance Snapshot
  getAttendanceSnapshot: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/attendance-snapshot");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch attendance snapshot"
      );
    }
  },

  // Get Leave Management Summary
  getLeaveManagement: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/leave-management");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch leave management data"
      );
    }
  },

  // Get Onboarding & Exit Status
  getOnboardingExitStatus: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/onboarding-exit-status");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch onboarding exit status"
      );
    }
  },

  // Get Document Compliance Alerts
  getDocumentComplianceAlerts: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/document-compliance");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch document compliance alerts"
      );
    }
  },

  // Get Department Distribution
  getDepartmentDistribution: async () => {
    try {
      const response = await apiClient.get("/company-admin/organization-structure/departments");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department distribution"
      );
    }
  }
};

export default dashboardService;
