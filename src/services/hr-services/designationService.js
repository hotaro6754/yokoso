// src/services/designationService.js
import { apiClient } from '@/lib/api';

export const designationService = {
  // Get all designations
  getAllDesignations: async (params = {}) => {
    try {
      const response = await apiClient.get('/organization-structure/designations', { params });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch designations';
      throw new Error(errorMessage);
    }
  },

  // Get designation by ID
  getDesignationById: async (id) => {
    try {
      const response = await apiClient.get(`/organization-structure/designations/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch designation';
      throw new Error(errorMessage);
    }
  },

  // Create new designation
  createDesignation: async (designationData) => {
    try {
      const response = await apiClient.post('/organization-structure/designations', designationData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create designation';
      throw new Error(errorMessage);
    }
  },

  // Update designation
  updateDesignation: async (id, designationData) => {
    try {
      const response = await apiClient.put(`/organization-structure/designations/${id}`, designationData);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update designation';
      throw new Error(errorMessage);
    }
  },

  // Delete designation
  deleteDesignation: async (id) => {
    try {
      const response = await apiClient.delete(`/organization-structure/designations/${id}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete designation';
      throw new Error(errorMessage);
    }
  }
};

export default designationService;