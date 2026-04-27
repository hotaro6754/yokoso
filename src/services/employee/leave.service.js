// src/services/employeeLeaveService.js
import { apiClient } from '@/lib/api';

class EmployeeLeaveService {
    // Get employee leave balance
    static async getLeaveBalance() {
        try {
            const response = await apiClient.get('/employee-leave/get-leave-balance');
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
        }
    }

    // Get employee leave history
    static async getLeaveHistory(params = {}) {
        try {
            const response = await apiClient.get('/employee-leave/get-leave-history', { params });
            const payload = response.data || {};
            return {
                data: payload.data || [],
                pagination: payload.pagination || {}
            };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch leave history');
        }
    }

    // Request new leave
    static async requestLeave(data) {
        try {
            const response = await apiClient.post('/employee-leave/request-leave', data);
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to submit leave request');
        }
    }

    // Cancel leave request
    static async cancelLeave(id) {
        try {
            const response = await apiClient.delete(`/employee-leave/cancel-leave/${id}`);
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to cancel leave request');
        }
    }

    // Get single leave request
    static async getLeaveRequest(id) {
        try {
            const response = await apiClient.get(`/employee-leave/get-leave-request/${id}`);
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch leave request');
        }
    }

    // Get available leave types
    static async getLeaveTypes() {
        try {
            const response = await apiClient.get('/employee-leave/get-leave-types');
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch leave types');
        }
    }

    // Get dashboard statistics
    static async getDashboardStats() {
        try {
            const response = await apiClient.get('/employee-leave/get-dashboard-stats');
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
        }
    }

    // Check leave availability
    static async checkLeaveAvailability(fromDate, toDate, leaveTypeId) {
        try {
            const response = await apiClient.get('/employee-leave/check-availability', {
                params: { fromDate, toDate, leaveTypeId }
            });
            const payload = response.data || {};
            return payload.data || payload;
        } catch (error) {
            console.error('Error checking leave availability:', error);
            return {
                available: false,
                message: error.response?.data?.message || 'Error checking availability'
            };
        }
    }
}

export default EmployeeLeaveService;