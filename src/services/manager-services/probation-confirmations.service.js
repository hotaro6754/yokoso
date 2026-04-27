import { apiClient } from '@/lib/api';

export const managerProbationService = {
  getList: async () => {
    try {
      const response = await apiClient.get('/manager/probation-confirmations/list');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching probation list', error);
      throw error;
    }
  },

  getDetails: async (probationPeriodId) => {
    try {
      const response = await apiClient.get(`/manager/probation-confirmations/${probationPeriodId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error fetching probation details', error);
      throw error;
    }
  },

  initiateGoals: async (probationPeriodId, goals) => {
    try {
      // goals: [{ title, description, kpiType, targetValue, weightage, dueStage }]
      const response = await apiClient.post('/manager/probation-confirmations/initiate-goals', {
        probationPeriodId,
        goals
      });
      return response.data;
    } catch (error) {
      console.error('Error initiating goals', error);
      throw error;
    }
  },

  submitReview: async (probationPeriodId, reviewData) => {
    try {
      // reviewData: { reviewStage, performanceRating, potentialRating, comments }
      const response = await apiClient.post('/manager/probation-confirmations/submit-review', {
        probationPeriodId,
        ...reviewData
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting review', error);
      throw error;
    }
  },

  submitDecision: async (probationPeriodId, decisionData) => {
    try {
      // decisionData: { action, extendWeeks, notes }
      const response = await apiClient.post('/manager/probation-confirmations/submit-decision', {
        probationPeriodId,
        ...decisionData
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting decision', error);
      throw error;
    }
  }
};
