import axios from 'axios';
import { apiClient } from '@/lib/api';

export const subscriptionService = {
  getAllSubscriptions: async () => {
    try {
      const response = await apiClient.get('/master-admin/subscriptions');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPublicSubscriptions: async () => {
    try {
      // Attempt to fetch from master-admin endpoint directly, bypassing interceptors
      // This works ONLY if the backend endpoint is actually public/unprotected
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      // We use a direct fetch/axios to avoid the api instance's auth-redirect logic
      const response = await axios.get(`${API_URL}/master-admin/subscriptions`);
      return response.data;
    } catch (error) {
      // If 401/403, it means it's protected and we can't access it publicly
      return null;
    }
  },

  createSubscription: async (data) => {
    try {
      const response = await apiClient.post('/master-admin/subscriptions', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getSubscriptionById: async (id) => {
    try {
      const response = await apiClient.get(`/master-admin/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateSubscription: async (id, data) => {
    try {
      const response = await apiClient.put(`/master-admin/subscriptions/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteSubscription: async (id) => {
    try {
      const response = await apiClient.delete(`/master-admin/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
