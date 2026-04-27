// src/services/hr-services/onboarding-exit.service.js
import { apiClient } from "@/lib/api";

export const onboardingExitService = {
  /* =========================
     ONBOARDING FEATURES
  ========================= */

  // Get Pre-joining Checklist
  getOnboardingChecklist: async (employeeId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/onboarding/${employeeId}/checklist`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch onboarding checklist"
      );
    }
  },

  // Create Onboarding Task
  createOnboardingTask: async (employeeId, data) => {
    try {
      const response = await apiClient.post(`/onboarding-exit/onboarding/${employeeId}/tasks`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create onboarding task"
      );
    }
  },

  // Update Onboarding Task Status
  updateOnboardingTask: async (taskId, data) => {
    try {
      const response = await apiClient.put(`/onboarding-exit/onboarding/tasks/${taskId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update onboarding task"
      );
    }
  },

  // Get Document Collection Status
  getDocumentCollection: async (employeeId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/onboarding/${employeeId}/documents`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch document collection"
      );
    }
  },

  // Submit Onboarding Survey
  submitOnboardingSurvey: async (employeeId, data) => {
    try {
      const response = await apiClient.post(`/onboarding-exit/onboarding/${employeeId}/survey`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to submit onboarding survey"
      );
    }
  },

  // Get Onboarding Survey
  getOnboardingSurvey: async (employeeId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/onboarding/${employeeId}/survey`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch onboarding survey"
      );
    }
  },

  /* =========================
     SEPARATION/EXIT FEATURES
  ========================= */

  // Create Resignation Request
  createResignation: async (data) => {
    try {
      const response = await apiClient.post("/onboarding-exit/resignation", data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create resignation request"
      );
    }
  },

  // Get Resignation Tracking
  getResignations: async (params = {}) => {
    try {
      const response = await apiClient.get("/onboarding-exit/resignations", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch resignations"
      );
    }
  },

  // Approve/Reject Resignation
  updateResignationStatus: async (resignationId, data) => {
    try {
      const response = await apiClient.put(`/onboarding-exit/resignations/${resignationId}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update resignation status"
      );
    }
  },

  // Get Separation Checklist
  getSeparationChecklist: async (resignationId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/resignations/${resignationId}/checklist`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch separation checklist"
      );
    }
  },

  // Create Separation Checklist Item
  createSeparationChecklistItem: async (resignationId, data) => {
    try {
      const response = await apiClient.post(`/onboarding-exit/resignations/${resignationId}/checklist`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create separation checklist item"
      );
    }
  },

  // Update Separation Checklist Item Status
  updateSeparationChecklistItem: async (itemId, data) => {
    try {
      const response = await apiClient.put(`/onboarding-exit/checklist/${itemId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update separation checklist item"
      );
    }
  },

  // Get Asset & Clearance Tracking
  getAssetClearance: async (resignationId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/resignations/${resignationId}/assets`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch asset and clearance tracking"
      );
    }
  },

  // Update Separation Status
  updateSeparationStatus: async (resignationId, data) => {
    try {
      const response = await apiClient.put(`/onboarding-exit/resignations/${resignationId}/status`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update separation status"
      );
    }
  },

  // Submit Exit Interview Survey
  submitExitInterview: async (resignationId, data) => {
    try {
      const response = await apiClient.post(`/onboarding-exit/resignations/${resignationId}/survey`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to submit exit interview"
      );
    }
  },

  // Get Exit Interview Survey
  getExitInterview: async (resignationId) => {
    try {
      const response = await apiClient.get(`/onboarding-exit/resignations/${resignationId}/survey`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch exit interview"
      );
    }
  },
};
