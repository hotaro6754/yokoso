import { apiClient } from "@/lib/api";

const helpdeskService = {
  // Categories
  getAllCategories: async () => {
    const response = await apiClient.get(`/helpdesk/categories`);
    return response.data;
  },

  getCategoriesByDepartment: async (departmentId) => {
    const response = await apiClient.get(`/helpdesk/categories/department/${departmentId}`);
    return response.data;
  },

  seedDefaultCategories: async () => {
    const response = await apiClient.post(`/helpdesk/categories/seed`);
    return response.data;
  },

  // Tickets
  createTicket: async (ticketData) => {
    const response = await apiClient.post(`/helpdesk/tickets`, ticketData);
    return response.data;
  },

  getTickets: async () => {
    const response = await apiClient.get(`/helpdesk/tickets`);
    return response.data;
  },

  getTicketById: async (id) => {
    const response = await apiClient.get(`/helpdesk/tickets/${id}`);
    return response.data;
  },

  claimTicket: async (id) => {
    const response = await apiClient.patch(`/helpdesk/tickets/${id}/claim`);
    return response.data;
  },

  addComment: async (id, commentData) => {
    const response = await apiClient.post(`/helpdesk/tickets/${id}/comments`, commentData);
    return response.data;
  },

  resolveTicket: async (id, resolutionData) => {
    const response = await apiClient.patch(`/helpdesk/tickets/${id}/resolve`, resolutionData);
    return response.data;
  },

  reopenTicket: async (id) => {
    const response = await apiClient.patch(`/helpdesk/tickets/${id}/reopen`);
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await apiClient.get(`/helpdesk/tickets/stats`);
    return response.data;
  },
  
  exportTickets: async () => {
    const response = await apiClient.get(`/helpdesk/tickets/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default helpdeskService;
