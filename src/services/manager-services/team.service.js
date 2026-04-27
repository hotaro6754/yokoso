import { apiClient } from '@/lib/api';

export const managerTeamService = {
  getTeamOverview: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get('/manager/team', {
        params: { page, limit }
      });
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch manager team');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching manager team overview', error);
      throw error;
    }
  },
  getTeamMemberProfile: async (employeeId) => {
    try {
      const response = await apiClient.get(`/manager/team/${employeeId}/profile`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team member profile');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team member profile', error);
      throw error;
    }
  },
  getTeamMemberAttendance: async (employeeId) => {
    try {
      const response = await apiClient.get(`/manager/team/${employeeId}/attendance`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team member attendance');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team member attendance', error);
      throw error;
    }
  },
  getTeamMemberLeave: async (employeeId) => {
    try {
      const response = await apiClient.get(`/manager/team/${employeeId}/leave`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team member leave summary');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team member leave summary', error);
      throw error;
    }
  },
  getTeamMemberPerformance: async (employeeId) => {
    try {
      const response = await apiClient.get(`/manager/team/${employeeId}/performance`);
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch team member performance');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching team member performance', error);
      throw error;
    }
  }
};
