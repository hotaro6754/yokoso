import { apiClient } from '@/lib/api';

export const hrAttendanceApprovalsService = {
    getApprovals: async (params = {}) => {
        try {
            const response = await apiClient.get('/hr/attendance-approvals', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching HR attendance approvals', error);
            throw error;
        }
    },

    approveCorrection: async (id, comment) => {
        try {
            const response = await apiClient.post(`/hr/attendance-approvals/${id}/approve`, { comment });
            return response.data;
        } catch (error) {
            console.error('Error approving correction', error);
            throw error;
        }
    },

    rejectCorrection: async (id, comment) => {
        try {
            const response = await apiClient.post(`/hr/attendance-approvals/${id}/reject`, { comment });
            return response.data;
        } catch (error) {
            console.error('Error rejecting correction', error);
            throw error;
        }
    },

    requestClarification: async (id, comment) => {
        try {
            const response = await apiClient.post(`/hr/attendance-approvals/${id}/clarify`, { comment });
            return response.data;
        } catch (error) {
            console.error('Error requesting clarification', error);
            throw error;
        }
    }
};

export default hrAttendanceApprovalsService;
