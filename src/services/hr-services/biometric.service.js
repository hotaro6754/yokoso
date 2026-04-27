import axios from "@/lib/api";

const biometricService = {
  // Device Management
  getDevices: () => axios.get("/hr/biometric/devices"),
  createDevice: (data) => axios.post("/hr/biometric/devices", data),
  updateDevice: (id, data) => axios.put(`/hr/biometric/devices/${id}`, data),
  deleteDevice: (id) => axios.delete(`/hr/biometric/devices/${id}`),

  // Synchronization
  syncDevice: (id) => axios.post(`/hr/biometric/devices/${id}/sync`),

  // Logs
  getLogs: (params) => axios.get("/hr/biometric/logs", { params }),

  // Reprocess all unprocessed logs and fix Unknown Employee names
  reprocessLogs: () => axios.post("/hr/biometric/reprocess"),
};

export default biometricService;
