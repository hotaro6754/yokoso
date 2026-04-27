import { apiClient } from '@/lib/api';

export const managerTimesheetApprovalsService = {
    getApprovals: async () => {
        try {
            const response = await apiClient.get('/manager/timesheet-approvals');
            const payload = response.data;

            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to fetch timesheet approvals');
            }

            return payload?.data || payload;
        } catch (error) {
            console.error('Error fetching timesheet approvals', error);
            throw error;
        }
    },
    getTimesheetById: async (timesheetId) => {
        try {
            const response = await apiClient.get(`/manager/timesheet-approvals/${timesheetId}`);
            const payload = response.data;

            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to fetch timesheet details');
            }

            return payload?.data || payload;
        } catch (error) {
            console.error('Error fetching timesheet details', error);
            throw error;
        }
    },
    approveTimesheet: async (timesheetId, comment) => {
        try {
            const response = await apiClient.post(`/manager/timesheet-approvals/${timesheetId}/approve`, {
                comment
            });
            const payload = response.data;

            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to approve timesheet');
            }

            return payload?.data || payload;
        } catch (error) {
            console.error('Error approving timesheet', error);
            throw error;
        }
    },
    rejectTimesheet: async (timesheetId, comment) => {
        try {
            const response = await apiClient.post(`/manager/timesheet-approvals/${timesheetId}/reject`, {
                comment
            });
            const payload = response.data;

            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to reject timesheet');
            }

            return payload?.data || payload;
        } catch (error) {
            console.error('Error rejecting timesheet', error);
            throw error;
        }
    }
};
