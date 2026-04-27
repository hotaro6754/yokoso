// src/services/holidayService.js
import { apiClient } from '@/lib/api';

export const holidayService = {
    // Get all holidays with filters
    getAllHolidays: async (params = {}) => {
        try {
            const response = await apiClient.get('/holidays/get-all-holidays', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch holidays';
            throw new Error(errorMessage);
        }
    },

    // Get holidays for calendar view
    getCalendarHolidays: async (params = {}) => {
        try {
            const response = await apiClient.get('/holidays/get-holidays-calendar', { params });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch calendar holidays';
            throw new Error(errorMessage);
        }
    },

    // Get holiday by ID
    getHolidayById: async (id) => {
        try {
            const response = await apiClient.get(`/holidays/get-holiday/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch holiday';
            throw new Error(errorMessage);
        }
    },

    // Create new holiday
    createHoliday: async (holidayData) => {
        try {
            const response = await apiClient.post('/holidays/create-holiday', holidayData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to create holiday';
            throw new Error(errorMessage);
        }
    },

    // Update holiday
    updateHoliday: async (id, holidayData) => {
        try {
            const response = await apiClient.put(`/holidays/update-holiday/${id}`, holidayData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update holiday';
            throw new Error(errorMessage);
        }
    },

    // Delete holiday
    deleteHoliday: async (id) => {
        try {
            const response = await apiClient.delete(`/holidays/delete-holiday/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete holiday';
            throw new Error(errorMessage);
        }
    },

    // Get distinct holiday years
    getHolidayYears: async () => {
        try {
            const response = await apiClient.get('/holidays/get-holiday-years');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch holiday years';
            throw new Error(errorMessage);
        }
    },

    // Get upcoming holidays
    getUpcomingHolidays: async (limit = 5) => {
        try {
            const response = await apiClient.get('/holidays/get-upcoming-holidays', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch upcoming holidays';
            throw new Error(errorMessage);
        }
    },

    // Get holidays by date range (for calendar)
    getHolidaysByDateRange: async (startDate, endDate) => {
        try {
            const response = await apiClient.get('/holidays/get-holidays-calendar', {
                params: {
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0]
                }
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch holidays by date range';
            throw new Error(errorMessage);
        }
    },

    // Get holidays for current year with all filters
    getHolidaysForCurrentYear: async (filters = {}) => {
        try {
            const currentYear = new Date().getFullYear();
            const params = {
                year: currentYear,
                ...filters
            };
            const response = await apiClient.get('/holidays/get-all-holidays', {
                params: { ...params, limit: 100 } // Get all holidays for the year
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch holidays for current year';
            throw new Error(errorMessage);
        }
    },

    // Bulk create holidays (if needed in future)
    bulkCreateHolidays: async (holidaysArray) => {
        try {
            const promises = holidaysArray.map(holiday =>
                apiClient.post('/holidays/create-holiday', holiday)
            );
            const results = await Promise.allSettled(promises);
            return results;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to bulk create holidays';
            throw new Error(errorMessage);
        }
    }
};

export default holidayService;