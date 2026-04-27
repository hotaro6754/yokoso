// src/services/leaveRequestService.js
import { apiClient } from '@/lib/api';

export const leaveRequestService = {
  // Get all leave requests
  getAllLeaveRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/leave-requests/get-all-leave-requests', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave requests';
      throw new Error(errorMessage);
    }
  },

  // Get leave request by ID
  getLeaveRequestById: async (id) => {
    try {
      const response = await apiClient.get(`/leave-requests/get-leave-request/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave request';
      throw new Error(errorMessage);
    }
  },

  // Create new leave request
  createLeaveRequest: async (leaveRequestData) => {
    try {
      const formData = new FormData();
      
      // Append all form data
      Object.keys(leaveRequestData).forEach(key => {
        if (key === 'attachment' && leaveRequestData[key]) {
          formData.append('attachment', leaveRequestData[key]);
        } else if (key === 'cc') {
          formData.append(key, JSON.stringify(leaveRequestData[key]));
        } else if (leaveRequestData[key] !== null && leaveRequestData[key] !== undefined) {
          formData.append(key, leaveRequestData[key]);
        }
      });

      const response = await apiClient.post('/leave-requests/create-leave-request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create leave request';
      throw new Error(errorMessage);
    }
  },

  // Update leave request
  updateLeaveRequest: async (id, leaveRequestData) => {
    try {
      const formData = new FormData();
      
      Object.keys(leaveRequestData).forEach(key => {
        if (key === 'attachment' && leaveRequestData[key]) {
          formData.append('attachment', leaveRequestData[key]);
        } else if (key === 'cc') {
          formData.append(key, JSON.stringify(leaveRequestData[key]));
        } else if (leaveRequestData[key] !== null && leaveRequestData[key] !== undefined) {
          formData.append(key, leaveRequestData[key]);
        }
      });

      const response = await apiClient.put(`/leave-requests/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update leave request';
      throw new Error(errorMessage);
    }
  },

  // Approve leave request
  approveLeaveRequest: async (id) => {
    try {
      const response = await apiClient.patch(`/leave-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve leave request';
      throw new Error(errorMessage);
    }
  },

  // Reject leave request
  rejectLeaveRequest: async (id, rejectionReason) => {
    try {
      const response = await apiClient.patch(`/leave-requests/${id}/reject`, { rejectionReason });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject leave request';
      throw new Error(errorMessage);
    }
  },

  // Get leave statistics
  getLeaveStats: async () => {
    try {
      const response = await apiClient.get('/leave-requests/stats');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave statistics';
      throw new Error(errorMessage);
    }
  },

  // Get leave types for dropdown
  getLeaveTypesDropdown: async () => {
    try {
      const response = await apiClient.get('/leave-types/get-leave-types-dropdown');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch leave types';
      throw new Error(errorMessage);
    }
  }
};

export default leaveRequestService;