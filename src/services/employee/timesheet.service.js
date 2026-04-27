import { apiClient } from '@/lib/api';

export const employeeTimesheetService = {
  getMyTimesheets: async (params = {}) => {
    const response = await apiClient.get('/employee/timesheets', { params });
    return response.data?.data || [];
  },

  createTimesheet: async (payload) => {
    const response = await apiClient.post('/employee/timesheets', payload);
    return response.data?.data || response.data;
  },

  updateTimesheet: async (id, payload) => {
    const response = await apiClient.put(`/employee/timesheets/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteTimesheet: async (id) => {
    const response = await apiClient.delete(`/employee/timesheets/${id}`);
    return response.data?.data || response.data;
  }
};
