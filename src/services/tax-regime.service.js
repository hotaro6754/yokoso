import { apiClient } from '@/lib/api';

const taxRegimeService = {
  /**
   * Get available tax regimes
   */
  getTaxRegimes: async () => {
    try {
      const response = await apiClient.get('/tax-regimes');
      return response.data;
    } catch (error) {
      console.error('Error fetching tax regimes:', error);
      throw error;
    }
  },

  /**
   * Update employee tax regime
   */
  updateTaxRegime: async (taxRegime) => {
    try {
      const response = await apiClient.put('/tax-regimes', { taxRegime });
      return response.data;
    } catch (error) {
      console.error('Error updating tax regime:', error);
      throw error;
    }
  },

  /**
   * Get employee tax regime status
   */
  getTaxRegimeStatus: async () => {
    try {
      const response = await apiClient.get('/tax-regimes/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching tax regime status:', error);
      throw error;
    }
  }
};

export default taxRegimeService;
