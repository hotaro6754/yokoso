import { apiClient } from '@/lib/api';

export const deptHeadDashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/dept-head/dashboard/stats');

      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
      }

      return response?.data?.data || response?.data || response;
    } catch (error) {
      console.error('Error fetching department head dashboard stats:', error);
      throw error;
    }
  },

  getDepartmentEmployees: async () => {
    try {
      const response = await apiClient.get('/dept-head/dashboard/employees');
      console.log('Department Employees Response:', response);

      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch department employees');
      }

      return response?.data?.data || response?.data || response;
    } catch (error) {
      console.error('Error fetching department employees:', error);
      throw error;
    }
  }
};