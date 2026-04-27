import { apiClient } from '@/lib/api';

export const deptHeadProfileService = {
  getProfile: async () => {
    try {
      const response = await apiClient.get('/dept-head/profile/get-profile');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      throw new Error(errorMessage);
    }
  },
  updateProfile: async (payload) => {
    try {
      const response = await apiClient.put('/dept-head/profile/update-profile', payload);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  }
};
