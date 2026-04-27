// src/services/hr-services/leave-dashboard.service.js
import { apiClient } from "@/lib/api";

export const leaveDashboardService = {
  /* =========================
     LEAVE DASHBOARD APIs
  ========================= */

  // Get Complete Dashboard Data
  // Returns all dashboard data in one call including:
  // - stats: Leave statistics (requests to approve, approved/rejected this month)
  // - nextHoliday: Next upcoming holiday
  // - weeklyAnalytics: Weekly leave analytics data
  // - upcomingHolidays: List of upcoming holidays
  // - recentRequests: Recent leave requests
  // - departmentDistribution: Department-wise leave distribution
  // Query Parameters:
  // - analyticsPeriod (optional): Period for analytics ('thisWeek', 'lastWeek', 'thisMonth'), defaults to 'thisWeek'
  // - holidaysLimit (optional): Limit for upcoming holidays, defaults to 5, max 50
  // - recentRequestsLimit (optional): Limit for recent requests, defaults to 5, max 50
  getCompleteDashboard: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-dashboard", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch complete dashboard data"
      );
    }
  },

  /* =========================
     LEAVE STATISTICS (STATS CARDS) APIs
  ========================= */

  // Get Leave Statistics
  // Returns statistics for dashboard cards:
  // - requestsToApprove: Count of pending leave requests with comparison (e.g., "+2 from yesterday")
  // - approvedThisMonth: Count of approved leaves this month with percentage comparison (e.g., "+5.2%")
  // - rejectedThisMonth: Count of rejected leaves this month with percentage comparison (e.g., "-2.1%")
  // Each stat includes:
  //   - value: The count number
  //   - comparison: Comparison text (e.g., "+2 from yesterday", "+5.2%")
  //   - trend: 'up' or 'down'
  getStats: async () => {
    try {
      const response = await apiClient.get("/leave-dashboard/stats");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch leave statistics"
      );
    }
  },

  /* =========================
     NEXT HOLIDAY APIs
  ========================= */

  // Get Next Holiday
  // Returns the next upcoming holiday with days remaining
  // Returns:
  // - id: Holiday ID
  // - publicId: Public ID
  // - name: Holiday name
  // - date: Date in ISO format (YYYY-MM-DD)
  // - dateFormatted: Formatted date string (e.g., "January 1, 2025")
  // - daysLeft: Number of days until the holiday
  // - type: Holiday type
  // - description: Holiday description (optional)
  getNextHoliday: async () => {
    try {
      const response = await apiClient.get("/leave-dashboard/next-holiday");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch next holiday"
      );
    }
  },

  /* =========================
     WEEKLY LEAVE ANALYTICS APIs
  ========================= */

  // Get Weekly Leave Analytics
  // Returns weekly/monthly analytics data for the chart
  // Query Parameters:
  // - period (optional): Period type ('thisWeek', 'lastWeek', 'thisMonth'), defaults to 'thisWeek'
  // Returns:
  // - period: The selected period
  // - startDate: Start date in ISO format
  // - endDate: End date in ISO format
  // - data: Array of analytics data with:
  //   - name: Day name (Mon-Sun) or Week number
  //   - approved: Count of approved leaves
  //   - rejected: Count of rejected leaves
  //   - pending: Count of pending leaves
  getWeeklyAnalytics: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-dashboard/weekly-analytics", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch weekly analytics"
      );
    }
  },

  /* =========================
     UPCOMING HOLIDAYS APIs
  ========================= */

  // Get Upcoming Holidays
  // Returns list of upcoming holidays with days remaining
  // Query Parameters:
  // - limit (optional): Number of holidays to return, defaults to 5, max 50
  // Returns:
  // - Array of holiday objects with:
  //   - id: Holiday ID
  //   - publicId: Public ID
  //   - name: Holiday name
  //   - date: Date in ISO format (YYYY-MM-DD)
  //   - dateFormatted: Formatted date string (e.g., "January 1, 2025")
  //   - daysLeft: Number of days until the holiday
  //   - type: Holiday type
  //   - description: Holiday description (optional)
  getUpcomingHolidays: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-dashboard/upcoming-holidays", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch upcoming holidays"
      );
    }
  },

  /* =========================
     RECENT LEAVE REQUESTS APIs
  ========================= */

  // Get Recent Leave Requests
  // Returns recent leave requests for dashboard table
  // Query Parameters:
  // - limit (optional): Number of requests to return, defaults to 5, max 50
  // Returns:
  // - Array of leave request objects with:
  //   - id: Request ID
  //   - publicId: Public ID
  //   - employee: Employee details (id, employeeId, name, email, profileImage, department, designation)
  //   - type: Leave type name
  //   - startDate: Start date in ISO format
  //   - endDate: End date in ISO format
  //   - duration: Formatted duration string (e.g., "2025-01-15 to 2025-01-17")
  //   - days: Number of days
  //   - status: Leave status (lowercase: 'pending', 'approved', 'rejected')
  //   - createdAt: Creation timestamp
  getRecentRequests: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-dashboard/recent-requests", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch recent leave requests"
      );
    }
  },

  /* =========================
     DEPARTMENT LEAVE DISTRIBUTION APIs
  ========================= */

  // Get Department Leave Distribution
  // Returns department-wise leave distribution for donut chart
  // Query Parameters:
  // - startDate (optional): Start date in ISO format (YYYY-MM-DD), defaults to start of current month
  // - endDate (optional): End date in ISO format (YYYY-MM-DD), defaults to end of current month
  // Returns:
  // - distribution: Array of department objects with:
  //   - id: Department ID
  //   - name: Department name
  //   - count: Number of leave requests
  // - total: Total number of leave requests
  // - startDate: Start date used for the query
  // - endDate: End date used for the query
  getDepartmentDistribution: async (params = {}) => {
    try {
      const response = await apiClient.get("/leave-dashboard/department-distribution", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch department distribution"
      );
    }
  },
};
