import { apiClient } from '@/lib/api';

export const deptHeadJobRequisitionService = {
  // Get pending job requisitions for department heads
  getPendingJobRequisitions: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/job-requisitions/pending', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch pending job requisitions');
      }
      return payload;
    } catch (error) {
      console.error('Error fetching pending job requisitions', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch pending job requisitions');
    }
  },

  // Update job requisition status (approve/reject/send back)
  updateJobRequisitionStatus: async (jobId, status, comment = '') => {
    try {
      const response = await apiClient.put(`/dept-head/job-requisitions/${jobId}/status`, {
        approvalStatus: status,
        comment
      });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to update job requisition status');
      }
      return payload;
    } catch (error) {
      console.error('Error updating job requisition status', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update job requisition status');
    }
  },

  // Get approved jobs by department head
  getApprovedJobs: async (params = {}) => {
    try {
      const response = await apiClient.get('/dept-head/job-requisitions/approved', { params });
      const payload = response.data;
      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch approved jobs');
      }
      return payload;
    } catch (error) {
      console.error('Error fetching approved jobs', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch approved jobs');
    }
  }
};
