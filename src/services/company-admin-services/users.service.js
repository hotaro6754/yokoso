import { apiClient } from "@/lib/api";

export const usersService = {
  // Get all users with pagination and filters
  getAllUsers: async (params = {}) => {
    try {
      const response = await apiClient.get('company-admin/users/get-all-users', { params });
      return response.data; // Return response.data directly like HR module
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Get user by ID
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/company-admin/users/get-user-by-id/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch user details';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await apiClient.post("/company-admin/users/create-user", userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Update user
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/company-admin/users/update-user/${id}`, userData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Delete user
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/company-admin/users/delete-user/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Change user status
  changeUserStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/company-admin/users/change-user-status/${id}`, { status });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change user status';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Get system roles
  getSystemRoles: async () => {
    try {
      const response = await apiClient.get("/company-admin/users/roles/system");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch system roles';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  },

  // Get company roles
  getCompanyRoles: async () => {
    try {
      const response = await apiClient.get("/company-admin/users/roles/company");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch company roles';
      const e = new Error(errorMessage);
      e.status = error.response?.status;
      e.details = error.response?.data;
      throw e;
    }
  }
};

export default usersService;
