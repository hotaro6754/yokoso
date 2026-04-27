import { apiClient } from '@/lib/api';
import { managerTeamService } from './team.service';

export const shiftManagementService = {
  // Import bulk roster
  // Expects array of { employeeId, date, shiftCode, location }
  importMonthlyRoster: async (shiftsData) => {
    try {
      // Aligned with workforceService: /workforce/bulk-shift
      const response = await apiClient.post('/workforce/bulk-shift', { assignments: shiftsData }, { timeout: 60000 });
      return response.data;
    } catch (error) {
       console.error("Import Roster Error", error);
       throw new Error(error.response?.data?.message || 'Failed to import roster');
    }
  },

  // Get shifts for manager dashboard (Roster View)
  getMonthlyShifts: async (month, year) => {
     try {
       // 1. Get Manager's Team
       const teamResponse = await managerTeamService.getTeamOverview();
       console.log('Team API Response:', teamResponse);
       
       // Extract teamMembers from response structure
       const teamMembers = teamResponse?.teamMembers || teamResponse?.data || [];
       console.log('Extracted teamMembers:', teamMembers);

       // 2. Get All Shifts
       const response = await apiClient.get('/workforce/shift-assignments', { params: { month, year } });
       const allShifts = Array.isArray(response.data) ? response.data : (response.data?.data || []);

       // 3. Filter Shifts for team members only
       const teamIds = new Set(teamMembers.map(m => m.id || m._id || m.employeeId));
       const teamShifts = allShifts.filter(shift => {
          const shiftEmpId = shift.employeeId || shift.employee?.id || shift.employee?._id || shift.user || shift.userId;
          return teamIds.has(shiftEmpId);
       });
       
       return { success: true, data: teamShifts };
     } catch (error) {
       console.error("Get Monthly Shifts Error", error);
       throw new Error(error.response?.data?.message || 'Failed to fetch shifts');
     }
  },

  // Publish roster - Triggers notifications
  publishRoster: async (month, year) => {
    try {
      // Presumed endpoint: /workforce/publish-roster
      const response = await apiClient.post('/workforce/publish-roster', { month, year });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to publish roster');
    }
  },

  // Assign a single shift manually
  assignSingleShift: async (employeeId, shiftData) => {
    try {
       // Using workforce service pattern: PUT /workforce/shift/{employeeId}
       const response = await apiClient.put(`/workforce/shift/${employeeId}`, shiftData);
       return response.data;
    } catch (error) {
       throw new Error(error.response?.data?.message || 'Failed to assign shift');
    }
  },

  // Get pending swap requests for manager approval
  getSwapRequests: async (status) => {
    try {
      // Use /shift-swaps to get all (including approved/rejected) for history tracking
      const params = status ? { status } : {};
      const response = await apiClient.get('/workforce/shift-swaps', { params });
      return response.data;
    } catch (error) {
       throw new Error(error.response?.data?.message || 'Failed to fetch swap requests');
    }
  },
  
  // Approve or Reject swap
  actionSwapRequest: async (requestId, action, remarks) => { // action: 'APPROVE' | 'REJECT'
     try {
       // Presumed endpoint: /workforce/shift-swaps/{id}/action
       const response = await apiClient.post(`/workforce/shift-swaps/${requestId}/action`, { action, remarks });
       return response.data;
     } catch (error) {
       throw new Error(error.response?.data?.message || `Failed to ${action} request`);
     }
  }
};
