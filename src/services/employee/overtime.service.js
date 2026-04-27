import { apiClient } from '@/lib/api';

export const employeeOvertimeService = {
  getMyRecords: async (params = {}) => {
    const response = await apiClient.get('/employee/overtime/my-records', { params });
    return response.data;
  },

  requestOvertime: async (payload) => {
    const response = await apiClient.post('/employee/overtime/request', payload);
    return response.data;
  }
};
