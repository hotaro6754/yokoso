import { apiClient } from '@/lib/api';

export const employeeSalaryStructureService = {
    // Get current employee's salary structure
    getCurrentSalaryStructure: async () => {
        try {
            const response = await apiClient.get('/employee/salary-structure/current');
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch salary structure');
        }
    },

    // Get salary structure history
    getSalaryHistory: async (params = {}) => {
        try {
            const response = await apiClient.get('/employee/salary-structure/history', {
                params: {
                    page: params.page || 1,
                    limit: params.limit || 10
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch salary history');
        }
    }
};

export default employeeSalaryStructureService;
