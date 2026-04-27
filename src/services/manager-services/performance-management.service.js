import { apiClient } from '@/lib/api';

export const managerPerformanceService = {
  getKpis: async () => {
    try {
      const response = await apiClient.get('/manager/performance-management/kpis');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch KPIs');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching KPIs', error);
      throw error;
    }
  },
  getKpiById: async (kpiId) => {
    try {
      const response = await apiClient.get(`/manager/performance-management/kpis/${kpiId}`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch KPI');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching KPI', error);
      throw error;
    }
  },
  createKpi: async (payload) => {
    try {
      const response = await apiClient.post('/manager/performance-management/kpis', payload);
      const data = response.data;

      if (data?.success === false) {
        throw new Error(data.message || 'Failed to create KPI');
      }

      return data?.data || data;
    } catch (error) {
      console.error('Error creating KPI', error);
      throw error;
    }
  },
  updateKpi: async (kpiId, payload) => {
    try {
      const response = await apiClient.put(`/manager/performance-management/kpis/${kpiId}`, payload);
      const data = response.data;

      if (data?.success === false) {
        throw new Error(data.message || 'Failed to update KPI');
      }

      return data?.data || data;
    } catch (error) {
      console.error('Error updating KPI', error);
      throw error;
    }
  },
  getTeamGoals: async () => {
    try {
      const response = await apiClient.get('/manager/performance-management/goals');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team goals');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team goals', error);
      throw error;
    }
  },
  getPendingAppraisals: async () => {
    try {
      const response = await apiClient.get('/manager/performance-management/appraisals');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch appraisals');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching appraisals', error);
      throw error;
    }
  },
  submitFeedback: async (payload) => {
    try {
      const response = await apiClient.post('/manager/performance-management/feedback', payload);
      const data = response.data;

      if (data?.success === false) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      return data?.data || data;
    } catch (error) {
      console.error('Error submitting feedback', error);
      throw error;
    }
  },
  createGoals: async (payload) => {
    try {
      const response = await apiClient.post('/manager/performance-management/goals', payload);
      const data = response.data;

      if (data?.success === false) {
        throw new Error(data.message || 'Failed to create goals');
      }

      return data?.data || data;
    } catch (error) {
      console.error('Error creating goals', error);
      throw error;
    }
  }
};
