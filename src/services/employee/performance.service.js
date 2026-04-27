// src/services/employee/performance.service.js
import { apiClient } from "@/lib/api";

export const employeePerformanceService = {
  // Get current active appraisal cycles (employee can see which cycles are available)
  getCurrentAppraisal: async () => {
    try {
      const response = await apiClient.get("/performance/appraisals/current");
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch current appraisal"
      );
    }
  },

  // Submit self-assessment (this would need to be implemented in backend)
  submitSelfAssessment: async (appraisalId, data) => {
    try {
      const response = await apiClient.post("/performance/appraisals", {
        appraisalCycleId: appraisalId,
        assessmentData: data
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to submit self-assessment"
      );
    }
  },

  // Save draft of self-assessment
  saveDraft: async (appraisalId, data) => {
    try {
      const response = await apiClient.put(`/performance/appraisals/${appraisalId}/draft`, {
        assessmentData: data
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to save draft"
      );
    }
  },

  // Get appraisal history for employee
  getAppraisalHistory: async () => {
    try {
      const response = await apiClient.get("/performance/appraisals/history");
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal history"
      );
    }
  },

  // Get specific appraisal details
  getAppraisalDetails: async (appraisalId) => {
    try {
      const response = await apiClient.get(`/performance/appraisals/my/${appraisalId}`);
      return response.data.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch appraisal details"
      );
    }
  },

  // Get employee's goals (using existing endpoint if available)
  getGoals: async () => {
    try {
      // This might use existing endpoints or need new ones
      const response = await apiClient.get("/performance/goals/overview");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch goals"
      );
    }
  },

  // Update goals (using existing endpoint if available)
  updateGoals: async (goalId, data) => {
    try {
      const response = await apiClient.put(`/performance/goals/${goalId}/progress`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update goals"
      );
    }
  },

  // Get feedback for employee (using existing endpoint if available)
  getFeedback: async () => {
    try {
      const response = await apiClient.get("/performance/feedback");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch feedback"
      );
    }
  },

  // Get employee KPIs (using existing endpoint if available)
  getKPIs: async () => {
    try {
      const response = await apiClient.get("/performance/kpi-assignments");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch KPIs"
      );
    }
  },

  // Update KPI progress (using existing endpoint if available)
  updateKPIProgress: async (kpiId, data) => {
    try {
      const response = await apiClient.put(`/performance/kpi-assignments/${kpiId}`, data);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update KPI progress"
      );
    }
  },

  // Get skills assessment (placeholder - would need backend implementation)
  getSkillsAssessment: async () => {
    try {
      // Placeholder - would need backend endpoint
      return {
        technicalSkills: 4.0,
        softSkills: 3.8,
        leadershipSkills: 3.5,
        communicationSkills: 4.2
      };
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch skills assessment"
      );
    }
  },

  // Update skills assessment (placeholder - would need backend implementation)
  updateSkillsAssessment: async (data) => {
    try {
      // Placeholder - would need backend endpoint
      console.log("Updating skills assessment:", data);
      return { success: true };
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update skills assessment"
      );
    }
  },

  // Get training records (placeholder - would need backend implementation)
  getTrainingRecords: async () => {
    try {
      // Placeholder - would need backend endpoint
      return [
        {
          id: 1,
          name: "Leadership Training",
          status: "Completed",
          completionDate: "2025-12-15",
          certificate: true
        },
        {
          id: 2,
          name: "Technical Skills Workshop",
          status: "In Progress",
          completionDate: null,
          certificate: false
        }
      ];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch training records"
      );
    }
  },

  // Get recognition/awards (placeholder - would need backend implementation)
  getRecognition: async () => {
    try {
      // Placeholder - would need backend endpoint
      return [
        {
          id: 1,
          type: "Employee of the Month",
          date: "2025-11-01",
          description: "Outstanding performance in Q3 2025"
        },
        {
          id: 2,
          type: "Innovation Award",
          date: "2025-09-15",
          description: "Implemented new process automation"
        }
      ];
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch recognition"
      );
    }
  }
};
