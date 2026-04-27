import { apiClient } from '@/lib/api';

export const biometricAgentService = {
  listReleases: async (params = {}) => {
    const response = await apiClient.get('/master-admin/biometric-agent/releases', { params });
    return response.data?.data || response.data;
  },

  getLatestRelease: async () => {
    const response = await apiClient.get('/master-admin/biometric-agent/releases/latest');
    return response.data?.data || response.data;
  },

  getRelease: async (id) => {
    const response = await apiClient.get(`/master-admin/biometric-agent/releases/${id}`);
    return response.data?.data || response.data;
  },

  uploadRelease: async (formData, onProgress) => {
    const response = await apiClient.post('/master-admin/biometric-agent/releases', formData, {
      timeout: 10 * 60 * 1000, // 10 minutes — large exe files take time
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent, progressEvent.loaded, progressEvent.total);
        }
      },
    });
    return response.data?.data || response.data;
  },

  updateRelease: async (id, data) => {
    const response = await apiClient.patch(`/master-admin/biometric-agent/releases/${id}`, data);
    return response.data?.data || response.data;
  },

  setLatest: async (id) => {
    const response = await apiClient.patch(`/master-admin/biometric-agent/releases/${id}/set-latest`, {});
    return response.data?.data || response.data;
  },

  deleteRelease: async (id) => {
    const response = await apiClient.delete(`/master-admin/biometric-agent/releases/${id}`);
    return response.data;
  },

  getSettings: async () => {
    const response = await apiClient.get('/master-admin/biometric-agent/settings');
    return response.data?.data || response.data;
  },

  saveSettings: async (data) => {
    const response = await apiClient.post('/master-admin/biometric-agent/settings', data);
    return response.data?.data || response.data;
  },
};
