import apiClient from '@/lib/api';

export const myInterviewsService = {
  // Get interviews assigned to the logged-in user
  getMyInterviews: async (params = {}) => {
    try {
      const response = await apiClient.get('/my-interviews', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch your interviews'
      );
    }
  },

  getInterviewById: async (id) => {
    try {
      const response = await apiClient.get(`/my-interviews/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch interview details'
      );
    }
  },

  // Submit L1/L2/HR feedback for a given interview
  submitFeedback: async (id, feedbackData) => {
    try {
      const response = await apiClient.post(`/my-interviews/${id}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to submit feedback'
      );
    }
  }
};
