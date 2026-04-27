import { apiClient } from '@/lib/api';

export const employeeProbationService = {
    getStatus: async () => {
        try {
            const response = await apiClient.get('/employee/probation/status');
            const payload = response.data;
            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to fetch probation status');
            }
            return payload?.data || payload;
        } catch (error) {
            console.error('Error fetching probation status', error);
            throw error;
        }
    },

    acknowledgeGoals: async (probationPeriodId) => {
        try {
            const response = await apiClient.post('/employee/probation/acknowledge', {
                probationPeriodId
            });
            const data = response.data;
            if (data?.success === false) {
                throw new Error(data.message || 'Failed to acknowledge goals');
            }
            return data;
        } catch (error) {
            console.error('Error acknowledging goals', error);
            throw error;
        }
    },

    submitSurvey: async (probationPeriodId, stage, answers) => {
        // answers: { roleClarityRating, managerSupportRating, experienceFeedback, suggestions }
        try {
            const response = await apiClient.post(`/employee/probation/survey`, {
                probationPeriodId,
                stage,
                ...answers
            });
            return response.data;
        } catch (error) {
            console.error('Error submitting survey', error);
            throw error;
        }
    },

    addReviewResponse: async (probationPeriodId, reviewId, responseText) => {
        try {
            const response = await apiClient.post(`/employee/probation/review-response`, {
                probationPeriodId,
                reviewId,
                responseText
            });
            return response.data;
        } catch (error) {
            console.error('Error adding review response', error);
            throw error;
        }
    }
};
