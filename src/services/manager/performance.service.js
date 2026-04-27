// src/services/manager/performance.service.js
import { apiClient } from "@/lib/api";

export const managerPerformanceService = {
  // Get team appraisals for current manager
  getTeamAppraisals: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const response = await apiClient.get(`/performance/manager/team-appraisals?${params}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch team appraisals"
      );
    }
  },

  // Get specific employee appraisal details
  getEmployeeAppraisal: async (appraisalId) => {
    try {
      const response = await apiClient.get(`/performance/manager/appraisals/${appraisalId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal details"
      );
    }
  },

  // Submit manager review for employee appraisal
  submitManagerReview: async (appraisalId, reviewData) => {
    try {
      const response = await apiClient.post(`/performance/manager/appraisals/${appraisalId}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to submit manager review"
      );
    }
  },

  // Save manager review as draft
  saveReviewDraft: async (appraisalId, reviewData) => {
    try {
      const response = await apiClient.put(`/performance/manager/appraisals/${appraisalId}/draft`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save review draft"
      );
    }
  },

  // Get appraisal statistics for manager's team
  getTeamAppraisalStats: async () => {
    try {
      const response = await apiClient.get('/performance/manager/team-stats');
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch team statistics"
      );
    }
  }
};
