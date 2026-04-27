import { apiClient } from '@/lib/api';

export const managerAttendanceApprovalsService = {
  getApprovals: async () => {
    try {
      const response = await apiClient.get('/manager/attendance-approvals');
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to fetch attendance approvals');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error fetching attendance approvals', error);
      throw error;
    }
  },
  approveCorrection: async (attendanceId, comment) => {
    try {
      const response = await apiClient.post(`/manager/attendance-approvals/${attendanceId}/approve`, {
        comment
      });
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to approve correction');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error approving correction', error);
      throw error;
    }
  },
  rejectCorrection: async (attendanceId, comment) => {
    try {
      const response = await apiClient.post(`/manager/attendance-approvals/${attendanceId}/reject`, {
        comment
      });
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to reject correction');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error rejecting correction', error);
      throw error;
    }
  },
  requestClarification: async (attendanceId, comment) => {
    try {
      const response = await apiClient.post(`/manager/attendance-approvals/${attendanceId}/clarify`, {
        comment
      });
      const payload = response.data;

      if (payload?.success === false) {
        throw new Error(payload.message || 'Failed to request clarification');
      }

      return payload?.data || payload;
    } catch (error) {
      console.error('Error requesting clarification', error);
      throw error;
    }
  }
  ,
  approveTimesheet: async (timesheetId, comment) => {
    try {
      const response = await apiClient.post(`/manager/attendance-approvals/timesheets/${timesheetId}/approve`, {
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
      const response = await apiClient.post(`/manager/attendance-approvals/timesheets/${timesheetId}/reject`, {
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
