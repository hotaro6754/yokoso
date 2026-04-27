import { apiClient } from '@/lib/api';

export const employeeRequestsService = {
  getMyRequests: async (params = {}) => {
    try {
      const response = await apiClient.get('/employee/requests', { params });
      const payload = response.data || {};
      return {
        data: payload.data || [],
        pagination: payload.pagination || {}
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch requests');
    }
  },

  createRequest: async (formData) => {
    try {
      const response = await apiClient.post('/employee/requests', formData);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit request');
    }
  },

  getRequestById: async (id) => {
    try {
      const response = await apiClient.get(`/employee/requests/${id}`);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch request');
    }
  }
};
