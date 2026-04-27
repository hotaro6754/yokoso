import { apiClient } from '@/lib/api';

export const dashboardService = {
    // Get Full Dashboard Stats (Company-wise)
    // Returns counts for Users, Config Status, Workflows, Integrations, and Recent Logs for the logged-in company
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/company-admin/dashboard/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get Recent Activities Only (Company-wise)
    // Returns the last 10 audit log entries for the logged-in company
    getRecentActivities: async () => {
        try {
            const response = await apiClient.get('/company-admin/dashboard/recent-activities');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
