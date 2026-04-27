import { apiClient } from '@/lib/api';

export const workflowManageService = {
    // ==========================================
    // WORKFLOW MANAGEMENT MODULE
    // ==========================================

    // 1. Create Workflow
    createWorkflow: async (data) => {
        try {
            const response = await apiClient.post('/company-admin/workflows/create-workflow', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 2. Update Workflow
    updateWorkflow: async (id, data) => {
        try {
            const response = await apiClient.put(`/company-admin/workflows/update-workflow/${id}`, data);
            console.log('response', response)
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 3. Clone Workflow
    cloneWorkflow: async (id, data) => {
        try {
            const response = await apiClient.post(`/company-admin/workflows/clone-workflow/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 4. Get All Workflows
    getAllWorkflows: async (params = {}) => {
        try {
            const response = await apiClient.get('/company-admin/workflows/get-all-workflows', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 5. Get Workflow By ID
    getWorkflowById: async (id) => {
        try {
            const response = await apiClient.get(`/company-admin/workflows/get-workflow/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // 6. Delete Workflow
    deleteWorkflow: async (id) => {
        try {
            const response = await apiClient.delete(`/company-admin/workflows/delete-workflow/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
