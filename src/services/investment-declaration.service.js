import { apiClient } from '@/lib/api';

const investmentDeclarationService = {
  /**
   * Get all declarations (Admin)
   */
  getAllDeclarations: async (params) => {
    try {
      const response = await apiClient.get('/investment-declarations/all', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching declarations:', error);
      throw error;
    }
  },

  /**
   * Get my declarations (Employee)
   */
  getMyDeclarations: async (financialYear) => {
    try {
      const response = await apiClient.get('/investment-declarations/my-declarations', { 
        params: { financialYear } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching my declarations:', error);
      throw error;
    }
  },

  /**
   * Submit or Save Draft (Employee)
   */
  submitDeclaration: async (data) => {
    try {
      const response = await apiClient.post('/investment-declarations/submit', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting declaration:', error);
      throw error;
    }
  },

  /**
   * Update Status (Admin)
   */
  updateStatus: async (id, data) => {
    try {
      const response = await apiClient.patch(`/investment-declarations/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating status:', error);
      throw error;
    }
  },

  /**
   * Get declaration details
   */
  getDeclarationDetails: async (id) => {
    try {
      const response = await apiClient.get(`/investment-declarations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching declaration details:', error);
      throw error;
    }
  },

  /**
   * Check if Proof Submission window is open
   */
  checkProofWindow: async () => {
    try {
      const response = await apiClient.get('/investment-declarations/proof-window');
      return response.data;
    } catch (error) {
      console.error('Error checking proof window:', error);
      throw error;
    }
  },

  /**
   * Generate Form 12BB
   */
  generateForm12BB: async (id) => {
    try {
      const response = await apiClient.get(`/investment-declarations/${id}/generate-12bb`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error generating Form 12BB:', error);
      throw error;
    }
  },
  /**
   * Upload proof file
   */
  uploadProof: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/investment-declarations/upload-proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading proof:', error);
      throw error;
    }
  }
};

export default investmentDeclarationService;
