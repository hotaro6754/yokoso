import { apiClient } from '@/lib/api';

export const pulseSurveyService = {
    getAllSurveys: async () => {
        try {
            const response = await apiClient.get('/hr-management/pulse-surveys');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch surveys');
        }
    },

    getSurveyById: async (id) => {
        try {
            const response = await apiClient.get(`/hr-management/pulse-surveys/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to fetch survey details');
        }
    },

    createSurvey: async (surveyData) => {
        try {
            const response = await apiClient.post('/hr-management/pulse-surveys', surveyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to create survey');
        }
    },

    updateSurvey: async (id, surveyData) => {
        try {
            const response = await apiClient.put(`/hr-management/pulse-surveys/${id}`, surveyData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to update survey');
        }
    },

    deleteSurvey: async (id) => {
        try {
            const response = await apiClient.delete(`/hr-management/pulse-surveys/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to delete survey');
        }
    },

    submitResponse: async (id, answers) => {
        try {
            const response = await apiClient.post(`/hr-management/pulse-surveys/${id}/submit`, { answers });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || error.message || 'Failed to submit survey');
        }
    }
};
