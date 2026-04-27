import { apiClient } from '@/lib/api';

class ManagerLeaveService {
  static async getLeaveBalance() {
    try {
      const response = await apiClient.get('/manager/leave-requests/get-leave-balance');
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave balance');
    }
  }

  static async getLeaveHistory(params = {}) {
    try {
      const response = await apiClient.get('/manager/leave-requests/get-leave-history', { params });
      const payload = response.data || {};
      return {
        data: payload.data || [],
        pagination: payload.pagination || {}
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave history');
    }
  }

  static async requestLeave(data) {
    try {
      const response = await apiClient.post('/manager/leave-requests/request-leave', data);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit leave request');
    }
  }

  static async cancelLeave(id) {
    try {
      const response = await apiClient.delete(`/manager/leave-requests/cancel-leave/${id}`);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  }

  static async getLeaveRequest(id) {
    try {
      const response = await apiClient.get(`/manager/leave-requests/get-leave-request/${id}`);
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave request');
    }
  }

  static async getLeaveTypes() {
    try {
      const response = await apiClient.get('/manager/leave-requests/get-leave-types');
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch leave types');
    }
  }

  static async getDashboardStats() {
    try {
      const response = await apiClient.get('/manager/leave-requests/get-dashboard-stats');
      const payload = response.data || {};
      return payload.data || payload;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }

  static async checkLeaveAvailability(fromDate, toDate, leaveTypeId) {
    try {
      const response = await apiClient.get('/manager/leave-requests/check-availability', {
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

  static async exportLeaveRequests() {
    try {
      const response = await apiClient.get('/manager/leave-requests/export-leave-requests', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leave_requests_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to export leave requests');
    }
  }
}

export default ManagerLeaveService;
