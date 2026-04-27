import { apiClient } from '@/lib/api';

export const integrationService = {
    // ==========================================
    // INTEGRATION MANAGEMENT MODULE
    // ==========================================

    // 1. Create Integration
    createIntegration: async (data) => {
        try {
            const response = await apiClient.post('/super-admin/integrations/create-integration', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 2. Update Integration
    updateIntegration: async (id, data) => {
        try {
            const response = await apiClient.put(`/super-admin/integrations/update-integration/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3. Generate API Key
    generateApiKey: async (id) => {
        try {
            const response = await apiClient.post(`/super-admin/integrations/generate-api-key/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Sync Integration (Trigger Manual Sync)
    syncIntegration: async (id) => {
        try {
            const response = await apiClient.post(`/super-admin/integrations/sync-integration/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4b. Poll sync status after triggering
    getSyncStatus: async (id, baseline) => {
        try {
            const response = await apiClient.get(`/super-admin/integrations/sync-status/${id}`, {
                params: { baseline }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 5. Get All Integrations
    getAllIntegrations: async (params = {}) => {
        try {
            const response = await apiClient.get('/super-admin/integrations/get-all-integrations', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 6. Get Integration By ID
    getIntegrationById: async (id) => {
        try {
            const response = await apiClient.get(`/super-admin/integrations/get-integration/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 7. Delete Integration
    deleteIntegration: async (id) => {
        try {
            const response = await apiClient.delete(`/super-admin/integrations/delete-integration/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
