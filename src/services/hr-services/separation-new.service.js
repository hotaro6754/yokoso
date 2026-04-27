import { apiClient } from "@/lib/api";

export const separationService = {
    // Employee Routes
    submitResignation: async (data) => {
        const response = await apiClient.post("/separation/resign", data);
        return response.data;
    },

    updateKtProgress: async (resignationId, data) => {
        const response = await apiClient.post(`/separation/${resignationId}/kt-update`, data);
        return response.data;
    },

    submitExitFeedback: async (resignationId, data) => {
        const response = await apiClient.post(`/separation/${resignationId}/exit-feedback`, data);
        return response.data;
    },

    acknowledgeKTPlan: async (resignationId) => {
        const response = await apiClient.post(`/separation/${resignationId}/acknowledge-kt`);
        return response.data;
    },

    // Manager/HR Routes
    getDashboard: async (params) => {
        const response = await apiClient.get("/separation/dashboard", { params });
        return response.data;
    },

    getHRDashboardStats: async () => {
        const response = await apiClient.get("/separation/hr-admin-stats");
        return response.data;
    },

    getResignationById: async (id) => {
        const response = await apiClient.get(`/separation/${id}`);
        return response.data;
    },

    managerReview: async (id, data) => {
        const response = await apiClient.put(`/separation/${id}/manager-review`, data);
        return response.data;
    },

    hrApproval: async (id, data) => {
        const response = await apiClient.put(`/separation/${id}/hr-approval`, data);
        return response.data;
    },

    submitClearance: async (id, data) => {
        const response = await apiClient.post(`/separation/${id}/clearance`, data);
        return response.data;
    },

    scheduleExitInterview: async (id, data) => {
        const response = await apiClient.post(`/separation/${id}/schedule-interview`, data);
        return response.data;
    },

    completeSeparation: async (id) => {
        const response = await apiClient.post(`/separation/${id}/complete`);
        return response.data;
    },

    updateResignation: async (id, data) => {
        const response = await apiClient.patch(`/separation/${id}`, data);
        return response.data;
    }
};
