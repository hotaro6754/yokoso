// src/services/recruiter-services/recruiter.service.js
import { apiClient } from '@/lib/api';

export const recruiterService = {
  /* =========================
     DASHBOARD APIs
  ========================= */

  // Get Dashboard Stats
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/recruiter/dashboard/stats');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch dashboard stats'
      );
    }
  },

  // Get Open Positions Summary
  getOpenPositionsSummary: async () => {
    try {
      const response = await apiClient.get('/recruiter/dashboard/open-positions');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch open positions summary'
      );
    }
  },

  // Get Candidate Pipeline Snapshot
  getCandidatePipelineSnapshot: async () => {
    try {
      const response = await apiClient.get('/recruiter/dashboard/pipeline-snapshot');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch pipeline snapshot'
      );
    }
  },

  // Get Today's Interviews
  getTodaysInterviews: async () => {
    try {
      const response = await apiClient.get('/recruiter/interviews/today');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch today\'s interviews'
      );
    }
  },

  // Get Upcoming Interviews
  getUpcomingInterviews: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/interviews/upcoming', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch upcoming interviews'
      );
    }
  },

  // Get Pending Actions
  getPendingActions: async () => {
    try {
      const response = await apiClient.get('/recruiter/dashboard/pending-actions');
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch pending actions'
      );
    }
  },

  /* =========================
     JOB REQUISITION APIs
  ========================= */

  // Get All Requisitions
  getAllRequisitions: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/requisitions', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch requisitions'
      );
    }
  },

  // Get Requisition by ID
  getRequisitionById: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/requisitions/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch requisition'
      );
    }
  },

  // Update Requisition Status
  updateRequisitionStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/recruiter/requisitions/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update requisition status'
      );
    }
  },

  /* =========================
     JOB POSTING APIs
  ========================= */

  // Get All Job Postings
  getAllJobPostings: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/job-postings', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch job postings'
      );
    }
  },

  // Get Approved Jobs from Job Table (approved by department head)
  getApprovedJobs: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/requisitions/approved', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch approved jobs'
      );
    }
  },

  // Get Job Posting by ID
  getJobPostingById: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/job-postings/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch job posting'
      );
    }
  },

  // Create Job Posting
  createJobPosting: async (jobPostingData) => {
    try {
      const response = await apiClient.post('/recruiter/job-postings', jobPostingData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create job posting'
      );
    }
  },

  // Update Job Posting
  updateJobPosting: async (id, jobPostingData) => {
    try {
      const response = await apiClient.put(`/recruiter/job-postings/${id}`, jobPostingData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update job posting'
      );
    }
  },

  // Update Job Posting Status
  updateJobPostingStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/recruiter/job-postings/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update job posting status'
      );
    }
  },

  /* =========================
     CANDIDATE MANAGEMENT APIs
  ========================= */

  // Get All Candidates
  getAllCandidates: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/candidates', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch candidates'
      );
    }
  },

  // Get Candidate by ID
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

  // Create Candidate
  createCandidate: async (candidateData) => {
    try {
      const response = await apiClient.post('/recruiter/candidates', candidateData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create candidate'
      );
    }
  },

  // Update Candidate
  updateCandidate: async (id, candidateData) => {
    try {
      const response = await apiClient.put(`/recruiter/candidates/${id}`, candidateData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update candidate'
      );
    }
  },

  // Move Candidate to Stage
  moveCandidateToStage: async (id, stage, notes) => {
    try {
      const response = await apiClient.patch(`/recruiter/candidates/${id}/stage`, { stage, notes });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to move candidate to stage'
      );
    }
  },

  // Add Candidate Note
  addCandidateNote: async (id, note) => {
    try {
      const response = await apiClient.post(`/recruiter/candidates/${id}/notes`, { note });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to add candidate note'
      );
    }
  },

  // Upload Candidate Document
  uploadCandidateDocument: async (id, file, documentType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      const response = await apiClient.post(`/recruiter/candidates/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload document'
      );
    }
  },

  // Delete Candidate
  deleteCandidate: async (id) => {
    try {
      const response = await apiClient.delete(`/recruiter/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to delete candidate'
      );
    }
  },

  // Retrigger Document Upload Email
  retriggerDocumentUpload: async (id) => {
    try {
      const response = await apiClient.post(`/recruiter/candidates/${id}/retrigger-docs`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to re-trigger document upload'
      );
    }
  },

  /* =========================
     INTERVIEW MANAGEMENT APIs
  ========================= */

  // Get All Interviews
  getAllInterviews: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/interviews', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch interviews'
      );
    }
  },

  // Get Interview by ID
  getInterviewById: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/interviews/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch interview'
      );
    }
  },

  // Schedule Interview
  scheduleInterview: async (interviewData) => {
    try {
      const response = await apiClient.post('/recruiter/interviews', interviewData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to schedule interview'
      );
    }
  },

  // Update Interview
  updateInterview: async (id, interviewData) => {
    try {
      const response = await apiClient.put(`/recruiter/interviews/${id}`, interviewData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update interview'
      );
    }
  },

  // Cancel Interview
  cancelInterview: async (id, reason) => {
    try {
      const response = await apiClient.patch(`/recruiter/interviews/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to cancel interview'
      );
    }
  },

  // Get Interview Feedback
  getInterviewFeedback: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/interviews/${id}/feedback`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch interview feedback'
      );
    }
  },

  /* =========================
     OFFER MANAGEMENT APIs
  ========================= */

  // Get All Offers
  getAllOffers: async (params = {}) => {
    try {
      const response = await apiClient.get('/recruiter/offers', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch offers'
      );
    }
  },

  // Get Offer by ID
  getOfferById: async (id) => {
    try {
      const response = await apiClient.get(`/recruiter/offers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch offer'
      );
    }
  },

  // Create Offer
  createOffer: async (offerData) => {
    try {
      const response = await apiClient.post('/recruiter/offers', offerData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create offer'
      );
    }
  },

  // Update Offer
  updateOffer: async (id, offerData) => {
    try {
      const response = await apiClient.put(`/recruiter/offers/${id}`, offerData);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update offer'
      );
    }
  },

  // Update Offer Status
  updateOfferStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/recruiter/offers/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to update offer status'
      );
    }
  },

  // Send Offer to Candidate
  sendOfferToCandidate: async (id) => {
    try {
      const response = await apiClient.post(`/recruiter/offers/${id}/send`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to send offer'
      );
    }
  },

  // Move to Onboarding
  moveToOnboarding: async (id) => {
    try {
      const response = await apiClient.post(`/recruiter/offers/${id}/move-to-onboarding`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to move to onboarding'
      );
    }
  },

  /* =========================
     TEMPLATE APIs
  ========================= */

  getTemplates: async (type) => {
    try {
      const params = type ? { type } : {};
      const response = await apiClient.get('/templates', { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch templates'
      );
    }
  },

  getTemplateById: async (id) => {
    try {
      const response = await apiClient.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch template by id'
      );
    }
  },

  uploadTemplate: async (formData) => {
    try {
      const response = await apiClient.post('/templates/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to upload template'
      );
    }
  },

  createTemplate: async (payload) => {
    try {
      const response = await apiClient.post('/templates', payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to create template'
      );
    }
  },

  extractTemplateFields: async (formData) => {
    try {
      const response = await apiClient.post('/templates/extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to extract template fields'
      );
    }
  },

  renderTemplatePreview: async (formData) => {
    try {
      const response = await apiClient.post('/templates/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to render template preview'
      );
    }
  },

  renderTemplatePdf: async (formData) => {
    try {
      const response = await apiClient.post('/templates/preview/pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'arraybuffer'
      });
      return response.data;
    } catch (error) {
      const err = new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to render template PDF'
      );
      err.status = error.response?.status;
      throw err;
    }
  },
};
