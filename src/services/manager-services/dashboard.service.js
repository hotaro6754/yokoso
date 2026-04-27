import { apiClient } from '@/lib/api';

export const managerDashboardService = {
  getDashboardSummary: async () => {
    try {
      const response = await apiClient.get('/manager/dashboard/summary');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch manager dashboard');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching manager dashboard summary', error);
      throw error;
    }
  }
};
