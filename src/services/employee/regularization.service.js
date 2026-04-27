import { apiClient } from '@/lib/api';

export const employeeRegularizationService = {
  getMyRequests: async (params = {}) => {
    const response = await apiClient.get('/employee/attendance-regularization', { params });
    return response.data;
  },

  createRequest: async (payload) => {
    const response = await apiClient.post('/employee/attendance-regularization', payload);
    return response.data;
  },

  updateRequest: async (id, payload) => {
    const response = await apiClient.put(`/employee/attendance-regularization/${id}`, payload);
    return response.data;
  }
};
