import { apiClient } from "@/lib/api";

const announcementService = {
    getAnnouncements: async () => {
        const response = await apiClient.get(`/announcements`);
        return response.data;
    },

    getUnreadCount: async (lastViewedAt) => {
        const response = await apiClient.get(`/announcements/unread-count`, {
            params: { lastViewedAt }
        });
        return response.data;
    },

    createAnnouncement: async (data) => {
        const response = await apiClient.post(`/announcements`, data);
        return response.data;
    },

    updateAnnouncement: async (id, data) => {
        const response = await apiClient.put(`/announcements/${id}`, data);
        return response.data;
    },

    deleteAnnouncement: async (id) => {
        const response = await apiClient.delete(`/announcements/${id}`);
        return response.data;
    }
};

export default announcementService;
