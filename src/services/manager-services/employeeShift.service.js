import { apiClient } from '@/lib/api';

export const employeeShiftService = {
  // Get employee shifts with filters
  getEmployeeShifts: async (filters = {}) => {
    try {
      const {
        employeeId,
        startDate,
        endDate,
        departmentId,
        page = 1,
        limit = 50
      } = filters;

      const params = new URLSearchParams();
      
      if (employeeId) params.append('employeeId', employeeId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (departmentId) params.append('departmentId', departmentId);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await apiClient.get(`/workforce/employee-shifts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Get Employee Shifts Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch employee shifts');
    }
  },

  // Assign new shift to employee
  assignEmployeeShift: async (shiftData) => {
    try {
      const response = await apiClient.post('/workforce/employee-shifts', shiftData);
      return response.data;
    } catch (error) {
      console.error('Assign Employee Shift Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign shift');
    }
  },

  // Update existing shift
  updateEmployeeShift: async (shiftId, shiftData) => {
    try {
      const response = await apiClient.put(`/workforce/employee-shifts/${shiftId}`, shiftData);
      return response.data;
    } catch (error) {
      console.error('Update Employee Shift Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update shift');
    }
  },

  // Delete shift
  deleteEmployeeShift: async (shiftId) => {
    try {
      const response = await apiClient.delete(`/workforce/employee-shifts/${shiftId}`);
      return response.data;
    } catch (error) {
      console.error('Delete Employee Shift Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete shift');
    }
  }
};
