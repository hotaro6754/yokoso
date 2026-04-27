import { apiClient } from '@/lib/api';

export const hrProbationService = {
    getAll: async (filters = {}) => {
        // filters: { status, statusIn, departmentId, name }
        const response = await apiClient.get('/hr-management/probation', { params: filters });
        return response.data?.data || [];
    },

    getStats: async () => {
        const response = await apiClient.get('/hr-management/probation/stats');
        return response.data?.data || {};
    },

    getDetails: async (probationId) => {
        const response = await apiClient.get(`/hr-management/probation/${probationId}`);
        return response.data?.data || null;
    }
};
