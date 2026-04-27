import apiClient from '@/lib/api';

export const hrOfferService = {
  // Get pending offers
  getPendingOffers: async (params = {}) => {
    try {
      const response = await apiClient.get('/hr/offers/pending', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch pending offers'
      );
    }
  },

  // Get offer by ID
  getOfferById: async (id) => {
    try {
      const response = await apiClient.get(`/hr/offers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch offer'
      );
    }
  },

  // Approve offer and send email
  approveOffer: async (id, uploadDocsLink) => {
    try {
      const response = await apiClient.post(`/hr/offers/${id}/approve`, {
        uploadDocsLink
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to approve offer'
      );
    }
  },

  // Reject offer
  rejectOffer: async (id, rejectionReason) => {
    try {
      const response = await apiClient.post(`/hr/offers/${id}/reject`, {
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to reject offer'
      );
    }
  },

  // Get candidate pipeline (view only) - returns candidates grouped by stage for Kanban view
  getCandidatePipeline: async (params = {}) => {
    try {
      const response = await apiClient.get('/hr/offers/candidates/pipeline', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch candidate pipeline'
      );
    }
  },

  // Move candidate to stage (e.g. SELECTED)
  moveCandidate: async (id, stage) => {
    try {
      const response = await apiClient.post(`/hr/offers/candidates/${id}/move`, {
        stage
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to move candidate'
      );
    }
  },

  // Get candidate by ID
  getCandidateById: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch candidate'
      );
    }
  },

  // Retrigger Offer Email
  retriggerOfferEmail: async (id) => {
    try {
      const response = await apiClient.post(`/hr/offers/${id}/retrigger-email`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to re-trigger offer email'
      );
    }
  }
};
