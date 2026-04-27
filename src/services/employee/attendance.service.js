import { apiClient } from '@/lib/api';

export const employeeAttendanceService = {
  getTodayStatus: async () => {
    const response = await apiClient.get('/employee/attendance/status');
    return response.data?.data || response.data;
  },

  getMyAttendanceRecords: async (params = {}) => {
    const response = await apiClient.get('/employee/attendance/records', { params });
    return response.data;
  },

  punchIn: async () => {
    const response = await apiClient.post('/employee/attendance/punch-in');
    return response.data?.data || response.data;
  },

  punchOut: async () => {
    const response = await apiClient.post('/employee/attendance/punch-out');
    return response.data?.data || response.data;
  }
};
