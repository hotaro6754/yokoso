import { apiClient } from '@/lib/api';

export const deptHeadTeamService = {
  getManagers: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/team-management', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team managers');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team managers', error);
      throw error;
    }
  },
  getManagerById: async (id) => {
    try {
      const response = await apiClient.get(`/dept-head/team-management/${id}`);
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch manager');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching manager', error);
      throw error;
    }
  },
  updateManagerStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/dept-head/team-management/${id}`, { status });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to update manager');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error updating manager', error);
      throw error;
    }
  },
  getManagerLeaveBalances: async (id) => {
    try {
      const response = await apiClient.get(`/dept-head/team-management/${id}/leaves`);
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch leave balances');
      }
      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching manager leaves', error);
      throw error;
    }
  }
};
