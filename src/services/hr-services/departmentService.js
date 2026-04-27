// src/services/departmentService.js
import { apiClient } from '@/lib/api';

export const departmentService = {
  // Get all departments
  getAllDepartments: async (params = {}) => {
    try {
      const response = await apiClient.get('/organization-structure/departments', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch departments';
      throw new Error(errorMessage);
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      const response = await apiClient.get(`/organization-structure/departments/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch department';
      throw new Error(errorMessage);
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      const response = await apiClient.post('/organization-structure/departments', departmentData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create department';
      throw new Error(errorMessage);
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const response = await apiClient.put(`/organization-structure/departments/${id}`, departmentData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update department';
      throw new Error(errorMessage);
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const response = await apiClient.delete(`/organization-structure/departments/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete department';
      throw new Error(errorMessage);
    }
  },

  // Get department employees
  getDepartmentEmployees: async (id, params = {}) => {
    try {
      const response = await apiClient.get(`/organization-structure/departments/${id}/employees`, { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch department employees';
      throw new Error(errorMessage);
    }
  },

  // get department stat's
  getDepartmentStats: async () => {
    try {
      const response = await apiClient.get('/organization-structure/departments/stats');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch department stats';
      throw new Error(errorMessage);
    }
  },

  // get org chart
  getOrgChart: async () => {
    try {
      const response = await apiClient.get('/organization-structure/departments/get-org-chart');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch organizational chart';
      throw new Error(errorMessage);
    }
  }
};

export default departmentService;