// src/services/company-admin/companySettingsService.js
import { apiClient } from '@/lib/api';

class CompanySettingsService {
    /**
     * Get current company settings
     */
    async getCompanySettings() {
        try {
            const response = await apiClient.get('/company-admin/settings');
            return response.data;
        } catch (error) {
            console.error('Error fetching company settings:', error);
            throw error;
        }
    }

    /**
     * Update company settings
     */
    async updateCompanySettings(settings) {
        try {
            const response = await apiClient.put('/company-admin/settings', settings);
            return response.data;
        } catch (error) {
            console.error('Error updating company settings:', error);
            throw error;
        }
    }

    /**
     * Get probation settings
     */
    async getProbationSettings() {
        try {
            const response = await apiClient.get('/company-admin/settings/probation');
            return response.data;
        } catch (error) {
            console.error('Error fetching probation settings:', error);
            throw error;
        }
    }

    /**
     * Update probation settings
     */
    async updateProbationSettings(settings) {
        try {
            const response = await apiClient.put('/company-admin/settings/probation', settings);
            return response.data;
        } catch (error) {
            console.error('Error updating probation settings:', error);
            throw error;
        }
    }

    /**
     * Parse comma-separated period options into array of numbers
     * @param {string} optionsString - Comma-separated string like "30,60,90,180"
     * @returns {Array<number>} - Array of numbers [30, 60, 90, 180]
     */
    parsePeriodOptions(optionsString) {
        if (!optionsString) return [];

        return optionsString
            .split(',')
            .map(val => val.trim())
            .filter(val => val !== '' && !isNaN(val))
            .map(val => parseInt(val, 10))
            .filter(val => val > 0);
    }

    /**
     * Get probation period options as array
     * @param {Object} settings - Company settings object
     * @returns {Array<{value: number, label: string}>} - Array of dropdown options
     */
    getProbationPeriodOptions(settings) {
        const options = this.parsePeriodOptions(settings?.probationPeriodOptions || '30,60,90,180');
        return options.map(days => ({
            value: days.toString(),
            label: `${days} days`
        }));
    }

    /**
     * Get notice period options as array
     * @param {Object} settings - Company settings object
     * @returns {Array<{value: string, label: string}>} - Array of dropdown options
     */
    getNoticePeriodOptions(settings) {
        const options = this.parsePeriodOptions(settings?.noticePeriodOptions || '15,30,60,90');
        return options.map(days => ({
            value: days.toString(),
            label: `${days} days`
        }));
    }
}

export const companySettingsService = new CompanySettingsService();
export default companySettingsService;
