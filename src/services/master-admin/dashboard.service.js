import { apiClient } from '@/lib/api';

export const masterAdminDashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/master-admin/dashboard/stats');

      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
      }

      return response?.data?.data || response?.data || response;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentTransactions: async () => {
    try {
      const response = await apiClient.get('/master-admin/dashboard/transactions');
      console.log('Recent Transactions Response:', response);

      if (response?.data?.success === false) {
        throw new Error(response.data.message || 'Failed to fetch recent transactions');
      }

      return response?.data?.data || response?.data || response;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  }
};