import { apiClient } from '@/lib/api';

export const deptHeadPerformanceService = {
  getOverview: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/performance/overview', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch performance overview');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching performance overview', error);
      throw error;
    }
  }
};
