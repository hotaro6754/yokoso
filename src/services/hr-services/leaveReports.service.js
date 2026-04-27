// src/services/leaveReportsService.js
import { apiClient } from '@/lib/api';

export const leaveReportsService = {
    // Get leave statistics
    getLeaveStats: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-reports/stats', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch leave statistics';
            throw new Error(errorMessage);
        }
    },

    // Get leave trends
    getLeaveTrends: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-reports/trends', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch leave trends';
            throw new Error(errorMessage);
        }
    },

    // Get leave by type
    getLeaveByType: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-reports/by-type', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch leave by type';
            throw new Error(errorMessage);
        }
    },

    // Get leave by department
    getLeaveByDepartment: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-reports/by-department', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch leave by department';
            throw new Error(errorMessage);
        }
    },

    // Get employee leave summary
    getEmployeeLeaveSummary: async (params = {}) => {
        try {
            const response = await apiClient.get('/leave-reports/employee-summary', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch employee leave summary';
            throw new Error(errorMessage);
        }
    },

    // Export report
    exportReport: async (exportData) => {
        try {
            const response = await apiClient.post('/leave-reports/export', exportData, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from response headers or use default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'leave-report.xlsx';
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch.length === 2) {
                    filename = filenameMatch[1];
                }
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            return { success: true, message: 'Report exported successfully' };
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to export report';
            throw new Error(errorMessage);
        }
    },

    // Save report
    saveReport: async (reportData) => {
        try {
            const response = await apiClient.post('/leave-reports/save', reportData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to save report';
            throw new Error(errorMessage);
        }
    },

    // Get saved reports
    getSavedReports: async () => {
        try {
            const response = await apiClient.get('/leave-reports/saved');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch saved reports';
            throw new Error(errorMessage);
        }
    },

    // Delete saved report
    deleteSavedReport: async (reportId) => {
        try {
            const response = await apiClient.delete(`/leave-reports/saved/${reportId}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete report';
            throw new Error(errorMessage);
        }
    },
    // Update employee leave balance
    updateLeaveBalance: async (employeePublicId, data) => {
        try {
            const response = await apiClient.put(`/leave-reports/employee-summary/${employeePublicId}`, data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update leave balance';
            throw new Error(errorMessage);
        }
    },

    importLeaveBalances: async (balances) => {
        try {
            const response = await apiClient.post('/leave-reports/leave-balances/import', { balances });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to import leave balances';
            throw new Error(errorMessage);
        }
    }
};

export default leaveReportsService;
