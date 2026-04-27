import { apiClient } from "@/lib/api";

const projectService = {
  /**
   * Get all projects (filtered by role on backend)
   */
  getAllProjects: async (params = {}) => {
    const response = await apiClient.get("/projects", { params });
    return response.data;
  },

  /**
   * Get project by public ID
   */
  getProjectById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  createProject: async (projectData) => {
    const response = await apiClient.post("/projects", projectData);
    return response.data;
  },

  /**
   * Update an existing project
   */
  updateProject: async (id, projectData) => {
    const response = await apiClient.put(`/projects/${id}`, projectData);
    return response.data;
  },

  assignLeadership: async (id, payload) => {
    const response = await apiClient.post(`/projects/${id}/assign`, payload);
    return response.data;
  },

  getWorkSchedule: async (id) => {
    const response = await apiClient.get(`/projects/${id}/schedule`);
    return response.data;
  },

  saveWorkSchedule: async (id, payload) => {
    const response = await apiClient.put(`/projects/${id}/schedule`, payload);
    return response.data;
  },

  submitResourcePlan: async (id) => {
    const response = await apiClient.post(`/projects/${id}/submit`);
    return response.data;
  },

  getPendingApprovals: async () => {
    const response = await apiClient.get('/projects/approvals/pending');
    return response.data;
  },

  approveProject: async (id, payload = {}) => {
    const response = await apiClient.post(`/projects/${id}/approve`, payload);
    return response.data;
  },

  rejectProject: async (id, payload = {}) => {
    const response = await apiClient.post(`/projects/${id}/reject`, payload);
    return response.data;
  },

  requestChanges: async (id, payload = {}) => {
    const response = await apiClient.post(`/projects/${id}/request-changes`, payload);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await apiClient.get('/projects/dashboard/summary');
    return response.data;
  },

  saveAllocation: async (payload) => {
    const response = await apiClient.post('/allocations', payload);
    return response.data;
  },

  getProjectAllocations: async (id) => {
    const response = await apiClient.get(`/allocations/project/${id}`);
    return response.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  },
};

export default projectService;
