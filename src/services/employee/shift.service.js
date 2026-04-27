import { apiClient } from '@/lib/api';

export const employeeShiftService = {
  // Get my roster
  getMyRoster: async (month, year) => {
    try {
      // Aligned with workforceService: /workforce/my-roster or filtered shift-assignments
      // Using /workforce/my-roster for specificity
      const response = await apiClient.get('/workforce/my-roster', { params: { month, year } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch roster');
    }
  },

  // Get eligible peers for swap (Same department/grade)
  getEligiblePeers: async () => {
    try {
      // Presumed endpoint: /workforce/eligible-peers
      const response = await apiClient.get('/workforce/eligible-peers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch peers');
    }
  },

  // Get peer's shift for a specific date
  getPeerShift: async (peerId, date) => {
    try {
      // Presumed endpoint: /workforce/peer-shift/{id}
      const response = await apiClient.get(`/workforce/peer-shift/${peerId}`, { params: { date } });
      return response.data;
    } catch (error) {
       throw new Error(error.response?.data?.message || 'Failed to fetch peer shift');
    }
  },

  // Submit swap request
  requestSwap: async (payload) => {
    // payload: { date, peerId, reason, comments }
    try {
      // Presumed endpoint: /workforce/swap-request
      const response = await apiClient.post('/workforce/swap-request', payload);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit request');
    }
  },

  // Get my swap requests
  getMySwapRequests: async (status) => {
    try {
      const response = await apiClient.get('/workforce/shift-swaps', { params: { status } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch swap requests');
    }
  }
};
