// src/services/leaveTypeService.js
import { apiClient } from '@/lib/api';

export const leaveTypeService = {
  // Get all leave types
  getAllLeaveTypes: async (params = {}) => {
    try {
      const response = await apiClient.get('/leave-types/get-all-leave-types', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave types';
      throw new Error(errorMessage);
    }
  },

  // Get leave type by ID
  getLeaveTypeById: async (id) => {
    try {
      const response = await apiClient.get(`/leave-types/get-leave-type/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave type';
      throw new Error(errorMessage);
    }
  },

  // Create new leave type
  createLeaveType: async (leaveTypeData) => {
    try {
      const response = await apiClient.post('/leave-types/create-leave-type', leaveTypeData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create leave type';
      throw new Error(errorMessage);
    }
  },

  // Update leave type
  updateLeaveType: async (id, leaveTypeData) => {
    try {
      const response = await apiClient.put(`/leave-types/update-leave-type/${id}`, leaveTypeData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update leave type';
      throw new Error(errorMessage);
    }
  },

  // Delete leave type
  deleteLeaveType: async (id) => {
    try {
      const response = await apiClient.delete(`/leave-types/delete-leave-type/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete leave type';
      throw new Error(errorMessage);
    }
  },

  // Get leave types for dropdown
  getLeaveTypesDropdown: async () => {
    try {
      const response = await apiClient.get('/leave-types/get-leave-types-dropdown');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave types dropdown';
      throw new Error(errorMessage);
    }
  }
};

export default leaveTypeService;