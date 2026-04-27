import { apiClient } from '@/lib/api';

export const managerTeamReportsService = {
  getSummary: async () => {
    try {
      const response = await apiClient.get('/manager/team-reports/summary');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch report summary');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team report summary', error);
      throw error;
    }
  },
  getReports: async () => {
    try {
      const response = await apiClient.get('/manager/team-reports/reports');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch reports');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team reports', error);
      throw error;
    }
  },
  getPreview: async (reportId) => {
    try {
      const response = await apiClient.get(`/manager/team-reports/${reportId}/preview`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch report preview');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching report preview', error);
      throw error;
    }
  }
};
