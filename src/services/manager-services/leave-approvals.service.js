import { apiClient } from '@/lib/api';



export const managerLeaveApprovalsService = {

  getLeaveRequests: async () => {

    try {

      const response = await apiClient.get('/manager/leave-approvals');

      const payload = response.data;



      if (payload?.success === false) {

        throw new Error(payload.message || 'Failed to fetch leave requests');

      }



      return payload?.data || payload;

    } catch (error) {

      console.error('Error fetching leave approvals', error);

      throw error;

    }

  },

  approveLeave: async (leaveId) => {

    try {

      const response = await apiClient.post(`/manager/leave-approvals/${leaveId}/approve`);

      const payload = response.data;



      if (payload?.success === false) {

        throw new Error(payload.message || 'Failed to approve leave');

      }



      return payload?.data || payload;

    } catch (error) {

      console.error('Error approving leave', error);

      throw error;

    }

  },

  rejectLeave: async (leaveId, rejectionReason) => {

    try {

      const response = await apiClient.post(`/manager/leave-approvals/${leaveId}/reject`, {

        rejectionReason

      });

      const payload = response.data;



      if (payload?.success === false) {

        throw new Error(payload.message || 'Failed to reject leave');

      }



      return payload?.data || payload;

    } catch (error) {

      console.error('Error rejecting leave', error);

      throw error;

    }

  },

  sendBackLeave: async (leaveId, comment) => {

    try {

      const response = await apiClient.post(`/manager/leave-approvals/${leaveId}/send-back`, {

        comment

      });

      const payload = response.data;



      if (payload?.success === false) {

        throw new Error(payload.message || 'Failed to send back leave');

      }



      return payload?.data || payload;

    } catch (error) {

      console.error('Error sending back leave', error);

      throw error;

    }

  }

};

