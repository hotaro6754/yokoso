// src/services/hr-services/jobService.js
import { apiClient } from '@/lib/api';

export const jobService = {
  // Get pending job requisitions for department heads
  getPendingJobRequisitions: async (params = {}) => {
    try {
      const response = await apiClient.get('/jobs/pending-requisitions', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch pending job requisitions');
    }
  },

  // Update job requisition status (approve/reject/send back)
  updateJobRequisitionStatus: async (jobId, status, comment = '') => {
    try {
      const response = await apiClient.put(`/jobs/${jobId}/status`, {
        approvalStatus: status,
        comment
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update job requisition status');
    }
  },

  // Get job details
  getJobById: async (jobId) => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch job details');
    }
  }
};
