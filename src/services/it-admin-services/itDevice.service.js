import { apiClient } from "@/lib/api";

export const itDeviceService = {
  // Dashboard
  getDashboardStats: async () => {
    const res = await apiClient.get("/it-admin/dashboard/stats");
    return res.data;
  },

  // Devices
  getDevices: async (params = {}) => {
    const res = await apiClient.get("/it-admin/devices", { params });
    return res.data;
  },

  getAvailableDevices: async (params = {}) => {
    const res = await apiClient.get("/it-admin/devices/available", { params });
    return res.data;
  },

  getDeviceById: async (id) => {
    const res = await apiClient.get(`/it-admin/devices/${id}`);
    return res.data;
  },

  createDevice: async (data) => {
    const res = await apiClient.post("/it-admin/devices", data);
    return res.data;
  },

  updateDevice: async (id, data) => {
    const res = await apiClient.put(`/it-admin/devices/${id}`, data);
    return res.data;
  },

  // Employees (for assignment dropdown)
  getEmployees: async (params = {}) => {
    const res = await apiClient.get("/employees/get-employees", {
      params: { page: 1, limit: 200, ...params }
    });
    return res.data;
  },

  // Assignments
  getAssignments: async (params = {}) => {
    const res = await apiClient.get("/it-admin/assignments", { params });
    return res.data;
  },

  getActiveAssignments: async (params = {}) => {
    const res = await apiClient.get("/it-admin/assignments/active", { params });
    return res.data;
  },

  createAssignment: async (data) => {
    const res = await apiClient.post("/it-admin/assignments", data);
    return res.data;
  },

  returnAssignment: async (assignmentId, data) => {
    const res = await apiClient.patch(`/it-admin/assignments/${assignmentId}/return`, data);
    return res.data;
  },

  // Returns
  getReturns: async (params = {}) => {
    const res = await apiClient.get("/it-admin/returns", { params });
    return res.data;
  },

  // Maintenance
  getMaintenance: async (params = {}) => {
    const res = await apiClient.get("/it-admin/maintenance", { params });
    return res.data;
  },

  getMaintenanceById: async (id) => {
    const res = await apiClient.get(`/it-admin/maintenance/${id}`);
    return res.data;
  },

  createMaintenance: async (data) => {
    const res = await apiClient.post("/it-admin/maintenance", data);
    return res.data;
  },

  updateMaintenance: async (id, data) => {
    const res = await apiClient.put(`/it-admin/maintenance/${id}`, data);
    return res.data;
  },

  // History
  getHistory: async (params = {}) => {
    const res = await apiClient.get("/it-admin/history", { params });
    return res.data;
  },

  getDeviceHistory: async (deviceId, params = {}) => {
    const res = await apiClient.get(`/it-admin/devices/${deviceId}/history`, { params });
    return res.data;
  },

  // Missing Reports
  getMissingReports: async (params = {}) => {
    const res = await apiClient.get("/it-admin/missing-reports", { params });
    return res.data;
  },

  getMissingReportById: async (id) => {
    const res = await apiClient.get(`/it-admin/missing-reports/${id}`);
    return res.data;
  },

  createMissingReport: async (data) => {
    const res = await apiClient.post("/it-admin/missing-reports", data);
    return res.data;
  },

  updateMissingReport: async (id, data) => {
    const res = await apiClient.put(`/it-admin/missing-reports/${id}`, data);
    return res.data;
  },

  deleteMissingReport: async (id) => {
    const res = await apiClient.delete(`/it-admin/missing-reports/${id}`);
    return res.data;
  }
};

