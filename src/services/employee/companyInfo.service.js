import { apiClient } from '@/lib/api';

export const companyInfoService = {
    // Get public company information for employees
    getCompanyInfo: async () => {
        try {
            const response = await apiClient.get('/employee/company-info');
            return response.data;
        } catch (error) {
            console.error('Error fetching company info:', error);
            throw error;
        }
    },

    // Get public policies for employees
    getPublicPolicies: async () => {
        try {
            const response = await apiClient.get('/employee/policies');
            return response.data;
        } catch (error) {
            console.error('Error fetching policies:', error);
            throw error;
        }
    },

    // Get holidays for employees
    getHolidays: async () => {
        try {
            const response = await apiClient.get('/employee/holidays');
            return response.data;
        } catch (error) {
            console.error('Error fetching holidays:', error);
            throw error;
        }
    }
};

export default companyInfoService;
