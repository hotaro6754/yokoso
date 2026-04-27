import { apiClient } from '@/lib/api';

export const employeeDashboardService = {
    getDashboardStats: async () => {
        try {
            const response = await apiClient.get('/employee/dashboard/stats');
            const payload = response.data;
            const data = payload?.data || payload;

            if (payload?.success === false) {
                throw new Error(payload.message || 'Failed to fetch dashboard stats');
            }

            return {
                attendance: data.attendance || data.attendanceStatus || {},
                leaves: data.leaves || data.leaveSummary || {},
                payroll: data.payroll || data.payrollSnapshot || {},
                requests: data.requests || data.pendingRequests || {},
                notifications: data.notifications || [],
                performance: data.performance || {}
            };
        } catch (error) {
            console.error("Error fetching dashboard stats", error);
            throw error;
        }
    }
};
