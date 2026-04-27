import { apiClient } from '@/lib/api';

export const deptHeadLeaveService = {
  getLeaveRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/leave-approvals', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch leave requests');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching leave requests', error);
      throw error;
    }
  },
  getLeaveRequestById: async (id) => {
    try {
      const response = await apiClient.get(`/dept-head/leave-approvals/${id}`);
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch leave request');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching leave request', error);
      throw error;
    }
  },
  updateLeaveStatus: async (id, status, comment) => {
    try {
      const response = await apiClient.patch(`/dept-head/leave-approvals/${id}/status`, { status, comment });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to update leave request');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error updating leave request', error);
      throw error;
    }
  }
};
