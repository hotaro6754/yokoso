// src/services/hr-services/dashboard.service.js
import { apiClient } from "@/lib/api";

const resolvePayload = (response) => {
  const payload = response.data;

  if (payload?.success === false) {
    throw new Error(payload.message || "Failed to fetch dashboard data");
  }

  return payload?.data || payload;
};

export const dashboardService = {
  /* =========================
     HR DASHBOARD APIs
  ========================= */

  // Get Complete Dashboard Data
  // Returns all dashboard metrics including:
  // - Headcount Summary (Total employees, Active employees, New joiners, Exits)
  // - Attendance Snapshot (Present today, Absent today, Late arrivals, Attendance exceptions)
  // - Leave Management (Pending leave approvals, Employees on leave today, Low leave balance alerts)
  // - Onboarding & Exit Status (Pending onboarding cases, Employees in notice period, Pending exit tasks)
  // - Document Compliance Alerts (Missing employee documents, Expired documents)
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

  /* =========================
     HEADCOUNT SUMMARY APIs
  ========================= */

  // Get Headcount Summary
  // Returns:
  // - totalEmployees: Total number of employees in the company
  // - activeEmployees: Number of employees with ACTIVE status
  // - newJoiners: Number of employees who joined in the current month
  // - exits: Number of employees who left (TERMINATED/RESIGNED/RETIRED) in the current month
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

  /* =========================
     ATTENDANCE SNAPSHOT APIs
  ========================= */

  // Get Attendance Snapshot
  // Returns:
  // - presentToday: Number of employees present today (PRESENT or HALF_DAY status)
  // - absentToday: Number of active employees absent today
  // - lateArrivals: Number of employees who checked in after 9:30 AM
  // - attendanceExceptions: Number of attendance exceptions (LATE, EARLY_LEAVE, HALF_DAY)
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

  /* =========================
     LEAVE MANAGEMENT APIs
  ========================= */

  // Get Leave Management Summary
  // Returns:
  // - pendingLeaveApprovals: Count of leave requests with PENDING status
  // - employeesOnLeaveToday: Count of employees on approved leave today
  // - lowLeaveBalanceAlerts: Count of employees with less than 5 days remaining leave balance
  // - lowLeaveBalanceDetails: Array of employees with low leave balance (employee details, leave type, remaining leaves)
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

  /* =========================
     ONBOARDING & EXIT STATUS APIs
  ========================= */

  // Get Onboarding & Exit Status
  // Returns:
  // - pendingOnboardingCases: Count of employees with PENDING or IN_PROGRESS onboarding status
  // - employeesInNoticePeriod: Count of employees with NOTICE_PERIOD status
  // - pendingExitTasks: Count of terminated/resigned employees with incomplete onboarding
  getOnboardingExitStatus: async () => {
    try {
      const response = await apiClient.get("/hr-dashboard/onboarding-exit-status");
      return resolvePayload(response);
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch onboarding and exit status"
      );
    }
  },

  /* =========================
     DOCUMENT COMPLIANCE ALERTS APIs
  ========================= */

  // Get Document Compliance Alerts
  // Returns:
  // - missingDocumentsCount: Total count of missing required documents (AADHAAR, PAN, PHOTO)
  // - missingDocuments: Array of employees with missing documents (employee details, missing document type)
  // - expiredDocumentsCount: Total count of expired documents
  // - expiredDocuments: Array of expired documents (document details, employee details, expiry date)
  getDocumentCompliance: async () => {
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
};
