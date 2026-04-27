// src/services/leaveCalendarService.js
import { apiClient } from '@/lib/api';

export const leaveCalendarService = {
  // Get all leaves with filters
  getAllLeaves: async (params = {}) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-all-leaves', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leaves';
      throw new Error(errorMessage);
    }
  },

  // Get calendar view data
  getCalendarView: async (params = {}) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-calendar-view', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch calendar view';
      throw new Error(errorMessage);
    }
  },

  // Get quick statistics
  getQuickStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-quick-stats', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch quick stats';
      throw new Error(errorMessage);
    }
  },

  // Get filter options
  getFilterOptions: async () => {
    try {
      const response = await apiClient.get('/leave-calendar/get-filter-options');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch filter options';
      throw new Error(errorMessage);
    }
  },

  // Get leave by ID
  getLeaveById: async (id) => {
    try {
      const response = await apiClient.get(`/leave-calendar/get-leave/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave';
      throw new Error(errorMessage);
    }
  },

  // Update leave status
  updateLeaveStatus: async (id, data) => {
    try {
      const response = await apiClient.put(`/leave-calendar/update-leave-status/${id}`, data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update leave status';
      throw new Error(errorMessage);
    }
  },

  // Get upcoming leaves
  getUpcomingLeaves: async (limit = 5) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-upcoming-leaves', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch upcoming leaves';
      throw new Error(errorMessage);
    }
  },

  // Get month summary
  getMonthSummary: async (month, year) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-month-summary', {
        params: { month, year }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch month summary';
      throw new Error(errorMessage);
    }
  },

  // Get leaves by date range (for specific day)
  getLeavesByDate: async (date) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-all-leaves', {
        params: { 
          startDate: date,
          endDate: date,
          limit: 100
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leaves by date';
      throw new Error(errorMessage);
    }
  },

  // Get department-wise statistics
  getDepartmentStats: async (startDate, endDate) => {
    try {
      const response = await apiClient.get('/leave-calendar/get-quick-stats', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch department stats';
      throw new Error(errorMessage);
    }
  }
};

export default leaveCalendarService;