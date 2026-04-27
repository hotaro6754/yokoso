// src/services/userService.js
import { apiClient } from '@/lib/api';

export const userService = {
    // Get current user profile
    getProfile: async () => {
        try {
            const response = await apiClient.get('/company-admin/users/get-profile');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
            throw new Error(errorMessage);
        }
    },

    // Update current user profile
    updateProfile: async (updateData) => {
        try {
            const response = await apiClient.put('/company-admin/users/update-profile', updateData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            throw new Error(errorMessage);
        }
    },

    // Update current user profile image
    updateProfileImage: async (formData) => {
        try {
            const response = await apiClient.post('/company-admin/users/update-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile image';
            throw new Error(errorMessage);
        }
    },

    uploadDocument: async (employeeId, formData) => {
        try {
            const response = await apiClient.post(`/documents/upload/${employeeId}`, formData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to upload document';
            throw new Error(errorMessage);
        }
    }
};

export default userService;