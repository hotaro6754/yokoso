import { apiClient } from '@/lib/api';

export const auditLogService = {
    // ==========================================
    // AUDIT LOG MODULE
    // ==========================================

    // 1. Get All Logs with Filters
    getAllLogs: async (params = {}) => {
        try {
            const response = await apiClient.get('/company-admin/audit-logs/get-all-logs', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 2. Get Log By ID
    getLogById: async (id) => {
        try {
            const response = await apiClient.get(`/company-admin/audit-logs/get-log/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3. Export Logs
    exportLogs: async (params = {}) => {
        try {
            const response = await apiClient.get('/company-admin/audit-logs/export-logs', {
                params,
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            throw error;
        }
    }
};
