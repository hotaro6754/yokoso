import { apiClient } from '@/lib/api';

/**
 * Service for managing probation and notice periods
 */
export const probationNoticeService = {
    // --- Probation Period ---

    /**
     * Get all probation periods
     */
    getProbationPeriods: async (filters = {}) => {
        const response = await apiClient.get('/probation-notice/probation-periods', { params: filters });
        return response.data;
    },

    /**
     * Complete probation
     */
    completeProbation: async (id) => {
        const response = await apiClient.put(`/probation-notice/probation-periods/${id}/complete`);
        return response.data;
    },

    /**
     * Extend probation
     */
    extendProbation: async (id, data) => {
        const response = await apiClient.put(`/probation-notice/probation-periods/${id}/extend`, data);
        return response.data;
    },

    /**
     * Reject probation
     */
    rejectProbation: async (id, data) => {
        const response = await apiClient.put(`/probation-notice/probation-periods/${id}/reject`, data);
        return response.data;
    },

    // --- Notice Period ---

    /**
     * Get all notice periods
     */
    getNoticePeriods: async (filters = {}) => {
        const response = await apiClient.get('/probation-notice/notice-periods', { params: filters });
        return response.data;
    },

    /**
     * Complete notice period
     */
    completeNoticePeriod: async (id) => {
        const response = await apiClient.put(`/probation-notice/notice-periods/${id}/complete`);
        return response.data;
    },

    /**
     * Extend notice period
     */
    extendNoticePeriod: async (id, data) => {
        const response = await apiClient.put(`/probation-notice/notice-periods/${id}/extend`, data);
        return response.data;
    },

    /**
     * Reject notice period
     */
    rejectNoticePeriod: async (id, data) => {
        const response = await apiClient.put(`/probation-notice/notice-periods/${id}/reject`, data);
        return response.data;
    },
};
