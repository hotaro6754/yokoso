// src/services/hr-services/workforce.service.js
import { apiClient } from "@/lib/api";

export const workforceService = {
  /* =========================
     WORK MODE (WFO / WFH / WFA) TAGGING APIs
  ========================= */

  // Set Work Mode for Employee
  // Tag an employee with a work mode (WFO - Work From Office, WFH - Work From Home, WFA - Work From Anywhere)
  setWorkMode: async (employeeId, data) => {
    try {
      const response = await apiClient.put(`/workforce/work-mode/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to set work mode"
      );
    }
  },

  // Get Work Modes
  // Get work modes for employees with filters
  getWorkModes: async (params = {}) => {
    try {
      const response = await apiClient.get("/workforce/work-modes", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch work modes"
      );
    }
  },

  // Bulk Assign Work Mode
  // Assign work mode to multiple employees at once
  bulkAssignWorkMode: async (data) => {
    try {
      const response = await apiClient.post("/workforce/bulk-work-mode", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk assign work mode"
      );
    }
  },

  /* =========================
     SHIFT ASSIGNMENT APIs
  ========================= */

  // Assign Shift to Employee
  // Assign a shift to an employee
  assignShift: async (employeeId, data) => {
    try {
      const response = await apiClient.put(`/workforce/shift/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to assign shift"
      );
    }
  },

  // Get Shift Assignments
  // Get shift assignments for employees with filters
  getShiftAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get("/workforce/shift-assignments", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch shift assignments"
      );
    }
  },

  // Bulk Assign Shift
  // Assign shift to multiple employees at once
  bulkAssignShift: async (data) => {
    try {
      const response = await apiClient.post("/workforce/bulk-shift", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to bulk assign shift"
      );
    }
  },

  /* =========================
     ROSTER PLANNING APIs
  ========================= */

  // Create Roster (Weekly Schedule)
  // Create a weekly roster/schedule for employees
  createRoster: async (data) => {
    try {
      const response = await apiClient.post("/workforce/roster", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create roster"
      );
    }
  },

  // Get Roster for Week
  // Get roster/schedule for a specific week
  getRoster: async (params = {}) => {
    try {
      const response = await apiClient.get("/workforce/roster", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch roster"
      );
    }
  },

  /* =========================
     WORKFORCE AVAILABILITY VIEW APIs
  ========================= */

  // Get Workforce Availability View
  // Get workforce availability for a specific date with leave integration
  getAvailability: async (params = {}) => {
    try {
      const response = await apiClient.get("/workforce/availability", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch workforce availability"
      );
    }
  },

  /* =========================
     BULK ROSTER MANAGEMENT APIs
  ========================= */

  // Import bulk roster
  // Expects array of assignment objects: { employeeId, date, shift, location }
  importRoster: async (assignments) => {
    try {
      const response = await apiClient.post("/workforce/bulk-shift", { assignments }, { timeout: 60000 });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to import roster"
      );
    }
  },

  // Publish roster - Triggers notifications
  publishRoster: async (selectedMonth, selectedYear) => {
    try {
      const response = await apiClient.post("/workforce/publish-roster", { 
        month: selectedMonth, 
        year: selectedYear 
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to publish roster"
      );
    }
  },
};
