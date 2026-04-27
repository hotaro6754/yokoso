// src/services/attendanceService.js
import { apiClient } from '@/lib/api';

export const attendanceService = {
  // Get dashboard statistics
  getDashboardStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-dashboard-stats', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard statistics';
      throw new Error(errorMessage);
    }
  },

  // Get attendance records with filters
  getAttendanceRecords: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-attendance-records', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance records';
      throw new Error(errorMessage);
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id) => {
    try {
      const response = await apiClient.get(`/attendance/get-attendance/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance record';
      throw new Error(errorMessage);
    }
  },

  // Create attendance record
  createAttendance: async (data) => {
    try {
      const response = await apiClient.post('/attendance/create-attendance', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create attendance record';
      throw new Error(errorMessage);
    }
  },

  // Update attendance record
  updateAttendance: async (id, data) => {
    try {
      const response = await apiClient.put(`/attendance/update-attendance/${id}`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update attendance record';
      throw new Error(errorMessage);
    }
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    try {
      const response = await apiClient.delete(`/attendance/delete-attendance/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete attendance record';
      throw new Error(errorMessage);
    }
  },

  // Bulk create attendance records
  bulkCreateAttendance: async (records) => {
    try {
      const response = await apiClient.post('/attendance/bulk-create-attendance', { records });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to bulk create attendance records';
      throw new Error(errorMessage);
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await apiClient.get('/attendance/get-filter-options');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch filter options';
      throw new Error(errorMessage);
    }
  },

  // Get employee attendance
  getEmployeeAttendance: async (employeeId, params = {}) => {
    try {
      const response = await apiClient.get(`/attendance/get-employee-attendance/${employeeId}`, { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch employee attendance';
      throw new Error(errorMessage);
    }
  },

  // Regularize attendance
  regularizeAttendance: async (id, notes) => {
    try {
      const response = await apiClient.put(`/attendance/regularize-attendance/${id}`, { notes });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to regularize attendance';
      throw new Error(errorMessage);
    }
  },

  // Get attendance summary report
  getAttendanceSummary: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-attendance-summary', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance summary';
      throw new Error(errorMessage);
    }
  },

  // Get today's attendance
  getTodayAttendance: async (params = {}) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/attendance/get-attendance-records', {
        params: {
          startDate: today,
          endDate: today,
          limit: 100,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch today\'s attendance';
      throw new Error(errorMessage);
    }
  },

  // Get attendance by date range
  getAttendanceByDateRange: async (startDate, endDate, params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-attendance-records', {
        params: {
          startDate,
          endDate,
          limit: 100,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance by date range';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     DAILY ATTENDANCE VIEW APIs
  ========================= */

  // Get Daily Attendance View
  // Returns complete daily attendance view for all employees
  // Query Parameters:
  // - date (optional): Date in ISO format (YYYY-MM-DD), defaults to today
  getDailyAttendanceView: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-daily-attendance-view', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch daily attendance view';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     ATTENDANCE CORRECTIONS APIs
  ========================= */

  // Correct Attendance Record
  // Path Parameters: id - Attendance record ID
  // Request Body: checkIn, checkOut, status, totalHours, reason (required)
  correctAttendance: async (id, data) => {
    try {
      const response = await apiClient.put(`/attendance/correct-attendance/${id}`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to correct attendance';
      throw new Error(errorMessage);
    }
  },

  // Get Attendance Corrections History
  // Query Parameters: page, limit, startDate, endDate, employeeId
  getAttendanceCorrections: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-attendance-corrections', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch attendance corrections';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     LATE / EARLY TRACKING APIs
  ========================= */

  // Get Late Arrivals
  // Query Parameters: page, limit, startDate, endDate, departmentId
  getLateArrivals: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-late-arrivals', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch late arrivals';
      throw new Error(errorMessage);
    }
  },

  // Get Early Leaves
  // Query Parameters: page, limit, startDate, endDate, departmentId
  getEarlyLeaves: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-early-leaves', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch early leaves';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     OVERTIME VISIBILITY APIs
  ========================= */

  // Get Overtime Records
  // Query Parameters: page, limit, startDate, endDate, departmentId, employeeId
  getOvertimeRecords: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-overtime-records', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch overtime records';
      throw new Error(errorMessage);
    }
  },

  // Get Overtime Summary
  // Query Parameters: startDate, endDate, groupBy ('employee' or 'department')
  getOvertimeSummary: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/get-overtime-summary', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch overtime summary';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     BIOMETRIC SYNC MONITORING APIs (VIEW-ONLY)
  ========================= */

  // Get Biometric Sync Status
  // Returns biometric integration status and sync monitoring (view-only)
  getBiometricSyncStatus: async () => {
    try {
      const response = await apiClient.get('/attendance/get-biometric-sync-status');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch biometric sync status';
      throw new Error(errorMessage);
    }
  },

  /* =========================
     LOP (LOSS OF PAY) APIs
  ========================= */

  /**
   * POST /attendance/process-lop
   * Trigger Missing Log Logic for a specific date:
   * No biometric log + No approved Leave/WFH = Auto LOP
   * @param {{ date: string }} data - ISO date string (YYYY-MM-DD)
   */
  processLOP: async (data) => {
    try {
      const response = await apiClient.post('/attendance/process-lop', data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process LOP';
      throw error;
    }
  },

  /**
   * GET /attendance/lop-summary
   * Retrieve LOP-marked records for HR review.
   * @param {{ startDate?, endDate?, page?, limit? }} params
   */
  getLOPSummary: async (params = {}) => {
    try {
      const response = await apiClient.get('/attendance/lop-summary', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch LOP summary';
      throw new Error(errorMessage);
    }
  }
};

export default attendanceService;
