import { apiClient } from '@/lib/api';

export const deptHeadReportsService = {
  getOverview: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/reports/overview', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch reports overview');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching department reports', error);
      throw error;
    }
  }
};
