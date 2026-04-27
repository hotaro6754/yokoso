import { apiClient } from "@/lib/api";

export const jobService = {
  getJobs: async (params = {}) => {
    try {
      const response = await apiClient.get("/jobs", { params });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch jobs"
      );
    }
  },
  getJobById: async (jobId) => {
    try {
      const response = await apiClient.get(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch job"
      );
    }
  },
  createJob: async (payload) => {
    try {
      const response = await apiClient.post("/jobs", payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create job"
      );
    }
  },
  updateJob: async (jobId, payload) => {
    try {
      const response = await apiClient.put(`/jobs/${jobId}`, payload);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update job"
      );
    }
  },
  deleteJob: async (jobId) => {
    try {
      const response = await apiClient.delete(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete job"
      );
    }
  }
};
